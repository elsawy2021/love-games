/* ================= extras.js — إصلاح (مين فينا) + لودو احترافية 3D ================= */
(function () {
  // حفظ واسترجاع الأسماء من الذاكرة عشان لو حد فتح اللينك المباشر بدون بارامترات
  try {
    if (Q.get('user')) {
      localStorage.setItem('lg_saved_user', Q.get('user'));
      if (Q.get('partner')) localStorage.setItem('lg_saved_partner', Q.get('partner'));
    } else if (localStorage.getItem('lg_saved_user')) {
      ME = localStorage.getItem('lg_saved_user');
      YOU = localStorage.getItem('lg_saved_partner') || YOU;
      MK = K(ME);
      YK = K(YOU);
    }
  } catch (e) {}

  /* ================= 1) إصلاح لعبة (مين فينا؟) ================= */
  const nmk = k => (k === MK ? ME : YOU);
  act.wv = v => {
    const k = v === 'me' ? MK : YK;
    R('whofirst').transaction(w => {
      w = w || {};
      w.v = w.v || {};
      if (Object.keys(w.v).length < 2) w.v[MK] = k;
      return w;
    });
  };
  dWho = function (w) {
    const L = whoFirstBank, v = w.v || {}, my = v[MK], yo = v[YK], ok = my && yo;
    stage(bar('😂 مين فينا اللي...؟', wait(ok, yo, my, 'صوّت'))
      + `<div class="q">${esc(L[(w.q || 0) % L.length])}</div><div class="opts">`
      + `<button class="opt ${my === MK ? 'sel' : ''}" data-a="wv" data-v="me">🙋 أنا (${esc(ME)})</button>`
      + `<button class="opt ${my === YK ? 'sel' : ''}" data-a="wv" data-v="you">💑 ${esc(YOU)}</button></div>`
      + (ok ? `<div class="rev"><b>${my === yo ? `😂 إجماع على (${esc(nmk(my))})! ♥️` : (my === MK && yo === YK) ? '😄 كل واحد شاور على نفسه! 😂' : '😄 كل واحد شاور على التاني!'}</b><br>تصويتك: ${esc(nmk(my))} | تصويت ${esc(YOU)}: ${esc(nmk(yo))}</div>` : '')
      + `<button class="go" data-a="wn">الموقف اللي بعده 🔄😂</button>`);
  };

  /* ================= 2) محرك الصوت الخفيف (Web Audio API) ================= */
  let audioCtx = null;
  function playTone(type) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const now = audioCtx.currentTime;

      if (type === 'dice') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.14);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
      } else if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc.start(now); osc.stop(now + 0.13);
      } else if (type === 'capture') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'win') {
        osc.type = 'triangle';
        [523, 659, 784, 1046].forEach((f, idx) => osc.frequency.setValueAtTime(f, now + idx * 0.1));
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now); osc.stop(now + 0.45);
      }
    } catch (e) {}
  }

  /* ================= 3) تحديد المقاعد بدون أخطاء الترتيب الأبجدي ================= */
  // Seat 0: أزرق (أسفل اليسار عند مصطفى) | Seat 1: أحمر (كمبيوتر 1)
  // Seat 2: أخضر (أعلى اليمين عند مصطفى، ويتقلب لأسفل اليسار عند فريال!) | Seat 3: أصفر (كمبيوتر 2)
  const SEAT_COLORS = [
    { main: '#2979ff', dark: '#0d47a1', light: '#82b1ff', glow: 'rgba(41,121,255,0.6)' }, // 0: Blue
    { main: '#ff1744', dark: '#b71c1c', light: '#ff8a80', glow: 'rgba(255,23,68,0.6)' },  // 1: Red
    { main: '#00c853', dark: '#1b5e20', light: '#69f0ae', glow: 'rgba(0,200,83,0.6)' },   // 2: Green
    { main: '#ffab00', dark: '#e65100', light: '#ffe57f', glow: 'rgba(255,171,0,0.6)' }   // 3: Yellow
  ];

  const START_IDX = [39, 0, 13, 26]; // نقاط البداية لكل مقعد على المسار الـ 52
  const SAFE = [0, 8, 13, 21, 26, 34, 39, 47];

  function isPartnerFemale(name) {
    const s = String(name || '').toLowerCase();
    return s.includes('فريال') || s.includes('فلفله') || s.includes('فلفلة') || s.includes('feryal') || s.includes('felfela');
  }

  // مقعد اللاعب الحالي: فريال/فلفله دائماً مقعد 2، ومصطفى/توفا دائماً مقعد 0
  const mySeat = () => {
    if (Q.get('seat') === '2' || isPartnerFemale(ME)) return 2;
    return 0;
  };

  const seatName = (s, L) => {
    const meS = mySeat();
    if (s === meS) return ME;
    if (s === (meS === 0 ? 2 : 0)) return YOU;
    return s === 1 ? 'كمبيوتر 1' : 'كمبيوتر 2';
  };

  const SEATS = c => c ? [0, 1, 2, 3] : [0, 2];
  const nxtSeat = s => {
    const list = SEATS(s.cpu);
    return list[(list.indexOf(s.t) + 1) % list.length];
  };

  const validMoves = s => {
    const out = [];
    (s.pw[s.t] || []).forEach((p, i) => {
      if (p < 0 ? s.d === 6 : p + s.d <= 56) out.push(i);
    });
    return out;
  };

  function ludoInit(cpuMode) {
    return {
      st: 'play',
      cpu: cpuMode,
      t: mySeat(), // يبدأ اللعب من عند الشخص اللي أنشأ الجيم
      d: 0,
      ld: 0,
      pw: [
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1]
      ],
      m: 'دور ' + seatName(mySeat()) + ' — اضغط على النرد للبدء 🎲',
      n: 1
    };
  }

  function ludoRoll(s, exp) {
    if (!s || s.st !== 'play' || s.d || (exp != null && s.n !== exp)) return;
    const rolled = 1 + (Math.random() * 6 | 0);
    s.d = rolled;
    s.ld = rolled;
    s.n = (s.n || 1) + 1;

    const mvs = validMoves(s);
    if (!mvs.length) {
      const rollerName = seatName(s.t, s);
      s.d = 0;
      s.t = nxtSeat(s);
      s.m = `${rollerName} رمى (${rolled}) ومفيش حركة ⏭ الدور الآن لـ ${seatName(s.t, s)}`;
    } else {
      s.m = `${seatName(s.t, s)} رمى (${rolled}) — اختار بيدق يتحرك 👆`;
    }
    return s;
  }

  function ludoMove(s, i, exp) {
    if (!s || s.st !== 'play' || !s.d || (exp != null && s.n !== exp) || !validMoves(s).includes(i)) return;
    const t = s.t, P = s.pw[t], d = s.d;
    const np = P[i] < 0 ? 0 : P[i] + d;
    P[i] = np;
    let cap = 0;

    if (np <= 50) {
      const ab = (START_IDX[t] + np) % 52;
      if (!SAFE.includes(ab)) {
        SEATS(s.cpu).forEach(o => {
          if (o !== t) {
            s.pw[o].forEach((q, j) => {
              if (q >= 0 && q <= 50 && (START_IDX[o] + q) % 52 === ab) {
                s.pw[o][j] = -1;
                cap = 1;
              }
            });
          }
        });
      }
    }

    s.n = (s.n || 1) + 1;
    s.ld = d;

    if (P.every(p => p === 56)) {
      s.st = 'done';
      s.w = t;
      s.d = 0;
      s.m = `🏆 مبروك! ${seatName(t, s)} كسب الجيم بجدارة! 🎉♥️`;
      return s;
    }

    const extraTurn = (d === 6 || cap === 1 || np === 56);
    const moverName = seatName(t, s);
    s.d = 0;
    if (!extraTurn) s.t = nxtSeat(s);

    if (extraTurn) {
      s.m = `${moverName} ${cap ? 'أكل بيدق 💥' : np === 56 ? 'وصّل بيدق للبيت 🏠' : 'جاب 6 🔥'} ويلعب تاني!`;
    } else {
      s.m = `الدور الآن لـ ${seatName(s.t, s)} 🎲`;
    }
    return s;
  }

  function ludoBestBotMove(s) {
    const t = s.t, d = s.d;
    let bi = -1, bs = -1e9;
    validMoves(s).forEach(i => {
      const p = s.pw[t][i], np = p < 0 ? 0 : p + d;
      let sc = np / 4;
      if (np === 56) sc += 120;
      if (p < 0) sc += 45;
      if (np > 50) sc += 30;
      if (np <= 50) {
        const ab = (START_IDX[t] + np) % 52;
        if (SAFE.includes(ab)) sc += 10;
        else {
          SEATS(s.cpu).forEach(o => {
            if (o !== t) {
              s.pw[o].forEach(q => {
                if (q >= 0 && q <= 50 && (START_IDX[o] + q) % 52 === ab) sc += 80;
              });
            }
          });
        }
      }
      if (sc > bs) { bs = sc; bi = i; }
    });
    return bi;
  }

  /* ================= 4) هندسة اللوحة الاحترافية ودوران 180° للاعب ================= */
  const PATH = [];
  [
    [6, 1, 0, 1, 5], [5, 6, -1, 0, 6], [0, 7, 0, 1, 2],
    [1, 8, 1, 0, 5], [6, 9, 0, 1, 6], [7, 14, 1, 0, 2],
    [8, 13, 0, -1, 5], [9, 8, 1, 0, 6], [14, 7, 0, -1, 2],
    [13, 6, -1, 0, 5], [8, 5, 0, -1, 6], [7, 0, -1, 0, 2]
  ].forEach(([r, c, a, b, n]) => {
    for (let i = 0; i < n; i++) PATH.push([r + a * i, c + b * i]);
  });

  // مسارات البيت (51..55) والهدف (56) لكل مقعد
  const HOME_STREAK = [
    [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]], // Seat 0 (Blue - Bottom)
    [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],     // Seat 1 (Red - Left)
    [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],     // Seat 2 (Green - Top)
    [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]]  // Seat 3 (Yellow - Right)
  ];

  // مواقع القواعد الـ 4 لكل مقعد
  const YARD_ORIGINS = [
    [9, 0], // Seat 0: Bottom-Left (Blue)
    [0, 0], // Seat 1: Top-Left (Red)
    [0, 9], // Seat 2: Top-Right (Green)
    [9, 9]  // Seat 3: Bottom-Right (Yellow)
  ];

  // تدوير الإحداثيات 180 درجة إذا كان اللاعب الحالي هو المقعد 2 (فريال/فلفله)
  // النتيجة: كل لاعب يرى بيادقه وبيته في الأسفل على اليسار دائماً!
  function vCoord(r, c) {
    return mySeat() === 2 ? [14 - r, 14 - c] : [r, c];
  }
  function vBoxCoord(r, c, w, h) {
    return mySeat() === 2 ? [15 - r - h, 15 - c - w] : [r, c];
  }

  const U = 100 / 15;
  const cellHtml = (r, c, w, h, cls, st, inner) => {
    const [vr, vc] = vBoxCoord(r, c, w, h);
    return `<div class="${cls}" style="left:${vc * U}%;top:${vr * U}%;width:${w * U}%;height:${h * U}%;${st || ''}">${inner || ''}</div>`;
  };

  function renderDiceFace(val, rolling) {
    const pipsMap = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };
    const activePips = pipsMap[val] || [4];
    let dots = '';
    for (let i = 0; i < 9; i++) {
      dots += `<span class="ld-pip ${activePips.includes(i) ? 'on' : ''}"></span>`;
    }
    return `<div class="ld-dice ${rolling ? 'rolling' : ''}">${dots}</div>`;
  }

  function renderPinSvg(colorObj) {
    return `<svg viewBox="0 0 36 44" class="ld-pin-svg">
      <defs>
        <radialGradient id="g_${colorObj.main.replace('#','')}" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
          <stop offset="30%" stop-color="${colorObj.light}"/>
          <stop offset="75%" stop-color="${colorObj.main}"/>
          <stop offset="100%" stop-color="${colorObj.dark}"/>
        </radialGradient>
      </defs>
      <ellipse cx="18" cy="40" rx="10" ry="3.5" fill="rgba(0,0,0,0.35)"/>
      <path d="M18 2 C9.5 2 3 8.5 3 17 C3 26.5 18 39 18 39 C18 39 33 26.5 33 17 C33 8.5 26.5 2 18 2 Z"
            fill="url(#g_${colorObj.main.replace('#','')})" stroke="#ffffff" stroke-width="2.2"/>
      <circle cx="18" cy="16" r="6" fill="rgba(255,255,255,0.35)"/>
    </svg>`;
  }

  function renderPlayerCard(seat, L, isMe, isActive) {
    const active = SEATS(L.cpu).includes(seat);
    const col = SEAT_COLORS[seat];
    if (!active) {
      return `<div class="ld-pcard empty"><span style="opacity:0.35;font-size:12px;">مقعد فارغ</span></div>`;
    }
    const name = seatName(seat, L);
    const doneSteps = (L.pw[seat] || []).reduce((acc, p) => acc + (p < 0 ? 0 : p), 0);
    const pct = Math.round((doneSteps / 224) * 100);
    const canRoll = isMe && isActive && !L.d && L.st === 'play';
    const diceVal = isActive ? (L.d || L.ld || 6) : (L.ld || 1);

    return `
      <div class="ld-pcard ${isActive ? 'active' : ''}" style="--pcol:${col.main};--pglow:${col.glow}">
        <div class="ld-pavatar">${renderPinSvg(col)}</div>
        <div class="ld-pinfo">
          <div class="ld-pname">${esc(name)}</div>
          <div class="ld-ppct">${pct}%</div>
        </div>
        ${isActive ? `
          <button class="ld-dice-btn ${canRoll ? 'pulse' : ''}" ${canRoll ? 'data-a="lr"' : 'disabled'} title="${canRoll ? 'اضغط لرمي النرد' : 'انتظر'}">
            ${renderDiceFace(diceVal, false)}
            ${canRoll ? '<span class="ld-tap-hand">👆</span>' : ''}
          </button>
        ` : ''}
      </div>
    `;
  }

  function buildLudoBoardHtml(L) {
    let h = '';
    const isFlipped = mySeat() === 2;

    // 1. رسم القواعد الـ 4 (Yards) مع الصندوق الأبيض الداخلي و4 دوائر مجوفة ونسبة التقدم
    YARD_ORIGINS.forEach(([yr, yc], s) => {
      const col = SEAT_COLORS[s];
      const active = SEATS(L.cpu).includes(s);
      const doneSteps = (L.pw[s] || []).reduce((acc, p) => acc + (p < 0 ? 0 : p), 0);
      const pct = Math.round((doneSteps / 224) * 100);

      h += cellHtml(yr, yc, 6, 6, 'ld-yard', `background:linear-gradient(145deg,${col.main},${col.dark});`, '');
      // الصندوق الأبيض الداخلي
      let socketsHtml = '';
      [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([sr, sc]) => {
        socketsHtml += `<div class="ld-socket" style="border-color:${col.main}55;box-shadow:inset 0 2px 5px rgba(0,0,0,0.22), 0 0 0 3px ${col.main}22;"></div>`;
      });
      const trayInner = `
        <div class="ld-sockets-grid">${socketsHtml}</div>
        ${active ? `<div class="ld-yard-pct" style="color:${col.dark}">${pct}%</div>` : ''}
      `;
      h += cellHtml(yr + 1, yc + 1, 4, 4, 'ld-yard-tray', '', trayInner);
    });

    // 2. المثلثات الـ 4 في المنتصف (مع تدوير 180 درجة إذا كانت اللوحة مقلوبة للاعب 2)
    const gradDeg = isFlipped ? '135deg' : '-45deg';
    h += cellHtml(6, 6, 3, 3, 'ld-center',
      `background:conic-gradient(from ${gradDeg}, ${SEAT_COLORS[1].main} 0 90deg, ${SEAT_COLORS[2].main} 90deg 180deg, ${SEAT_COLORS[3].main} 180deg 270deg, ${SEAT_COLORS[0].main} 270deg 360deg);`,
      '<div class="ld-center-gem">♥️</div>'
    );

    // 3. المسار الخارجي (52 خانة) مع تلوين مربعات البداية والنجوم الآمنة
    const startColorMap = { 39: SEAT_COLORS[0], 0: SEAT_COLORS[1], 13: SEAT_COLORS[2], 26: SEAT_COLORS[3] };
    const starColorMap = { 47: SEAT_COLORS[1], 8: SEAT_COLORS[2], 21: SEAT_COLORS[3], 34: SEAT_COLORS[0] };

    PATH.forEach(([r, c], idx) => {
      let bg = '#ffffff';
      let inner = '';
      if (startColorMap[idx]) {
        bg = startColorMap[idx].main;
        inner = '<span class="ld-start-arrow">➜</span>';
      } else if (starColorMap[idx]) {
        inner = `<span class="ld-star" style="color:${starColorMap[idx].main}">★</span>`;
      }
      h += cellHtml(r, c, 1, 1, 'ld-cell', `background:${bg};`, inner);
    });

    // 4. مسارات الوصول الملونة (Home Streaks)
    HOME_STREAK.forEach((streak, s) => {
      const col = SEAT_COLORS[s];
      for (let j = 0; j < 5; j++) {
        const [r, c] = streak[j];
        h += cellHtml(r, c, 1, 1, 'ld-cell', `background:linear-gradient(135deg,${col.main},${col.light});`, '');
      }
    });

    // 5. رسم البيادق ثلاثية الأبعاد (3D Pins)
    const mv = (L.st === 'play' && L.t === mySeat() && L.d) ? validMoves(L) : [];
    const stackCount = {};

    SEATS(L.cpu).forEach(s => {
      const col = SEAT_COLORS[s];
      L.pw[s].forEach((p, i) => {
        let r, c;
        if (p < 0) {
          const [yr, xc] = YARD_ORIGINS[s];
          const offsets = [[1.45, 1.45], [1.45, 3.55], [3.55, 1.45], [3.55, 3.55]];
          r = yr + offsets[i][0];
          c = xc + offsets[i][1];
        } else if (p <= 50) {
          [r, c] = PATH[(START_IDX[s] + p) % 52];
        } else if (p < 56) {
          [r, c] = HOME_STREAK[s][p - 51];
        } else {
          [r, c] = HOME_STREAK[s][5];
          const spread = (i - 1.5) * 0.16;
          if (s === 0 || s === 2) c += spread; else r += spread;
        }

        const [vr, vc] = vCoord(r, c);
        const key = `${Math.round(vr * 10)},${Math.round(vc * 10)}`;
        const count = stackCount[key] = (stackCount[key] || 0) + 1;
        const shift = (count - 1) * 0.14;
        const canMove = (s === L.t && mv.includes(i));

        h += `<div class="ld-pawn ${canMove ? 'movable' : ''}" 
                   style="left:${(vc + shift) * U}%;top:${(vr - shift) * U}%;width:${U}%;height:${U}%;"
                   ${canMove ? `data-a="lm" data-v="${i}"` : ''}>
                ${renderPinSvg(col)}
              </div>`;
      });
    });

    return h;
  }

  function dLudo(L) {
    if (!L || !L.st) {
      stage(
        bar('🎲 لودو الملكية 3D', 'اختار نظام اللعب')
        + `<div class="q" style="font-size:19px;">جاهزين للتحدي؟ اختاروا مود اللعب ♥️🎲</div>`
        + `<div class="row" style="gap:12px;margin-top:10px;">
            <button class="go" data-a="ls" data-v="0">💑 إحنا الاتنين بس (1 ضد 1)</button>
            <button class="go alt" data-a="ls" data-v="1">🤖 أنا و${esc(YOU)} ضد كمبيوترين</button>
          </div>`
      );
      return;
    }

    const meS = mySeat();
    const partnerS = (meS === 0 ? 2 : 0);
    // ترتيب المقاعد في الشاشة حسب زاوية اللاعب الحالي:
    // Top-Left: (meS + 1) % 4 | Top-Right: partnerS (أمامك مباشرة)
    // Bottom-Left: meS (أنت من ناحيتك!) | Bottom-Right: (meS + 3) % 4
    const topLeftSeat = (meS + 1) % 4;
    const topRightSeat = partnerS;
    const botLeftSeat = meS;
    const botRightSeat = (meS + 3) % 4;

    const headerBar = `
      <div class="bar" style="align-items:center;">
        <span class="pill">🎲 لودو ${L.cpu ? '(4 لاعبين)' : '(ثنائي ♥️)'}</span>
        <button class="ld-reset-btn" data-a="lx" title="إعادة بدء اللعبة">🔄 إعادة اللعب</button>
      </div>
    `;

    const topHud = `
      <div class="ld-hud-row">
        ${renderPlayerCard(topLeftSeat, L, false, L.t === topLeftSeat)}
        ${renderPlayerCard(topRightSeat, L, false, L.t === topRightSeat)}
      </div>
    `;

    const botHud = `
      <div class="ld-hud-row">
        ${renderPlayerCard(botLeftSeat, L, true, L.t === botLeftSeat)}
        ${renderPlayerCard(botRightSeat, L, false, L.t === botRightSeat)}
      </div>
    `;

    const statusBanner = `
      <div class="ld-status-bar ${L.st === 'done' ? 'win' : ''}">
        ${esc(L.m || '')}
      </div>
    `;

    stage(
      headerBar
      + `<div class="ld-arena-cabinet">`
      + topHud
      + `<div class="ld-board-frame"><div class="ld-board">${buildLudoBoardHtml(L)}</div></div>`
      + botHud
      + `</div>`
      + statusBanner
      + (L.st === 'done' ? `<button class="go" style="margin-top:10px;" data-a="lx">🎉 جولة جديدة</button>` : '')
    );
  }

  // تحريك الكمبيوتر تلقائياً بدون تعليق
  let lastBotStep = -1;
  function runBotTurn(L) {
    if (!L || L.st !== 'play' || !L.cpu || L.t % 2 === 0 || lastBotStep === L.n) return;
    lastBotStep = L.n;
    const currentStep = L.n;
    setTimeout(() => {
      R('ludo').transaction(s => {
        if (!s || s.n !== currentStep || s.st !== 'play' || s.t % 2 === 0) return;
        return s.d ? ludoMove(s, ludoBestBotMove(s), currentStep) : ludoRoll(s, currentStep);
      });
    }, 950);
  }

  // أوامر اللعبة مع المؤثرات الصوتية
  Object.assign(act, {
    ls(v) {
      playTone('move');
      R('ludo').set(ludoInit(+v));
    },
    lr() {
      playTone('dice');
      R('ludo').transaction(s => {
        if (!s || s.t !== mySeat() || s.d) return;
        return ludoRoll(s);
      });
    },
    lm(i) {
      R('ludo').transaction(s => {
        if (!s || s.t !== mySeat() || !s.d) return;
        const beforeCap = JSON.stringify(s.pw);
        const res = ludoMove(s, +i);
        if (res) {
          if (res.st === 'done') playTone('win');
          else if (res.m && res.m.includes('أكل')) playTone('capture');
          else playTone('move');
        }
        return res;
      });
    },
    lx() {
      playTone('move');
      R('ludo').set(null);
    }
  });

  // تنسيقات الجرافيك ثلاثي الأبعاد الاحترافي (مستوحاة من لودو الموبايل)
  const css = document.createElement('style');
  css.textContent = `
    .tabs { grid-template-columns: repeat(5, 1fr) !important; }
    .tab { font-size: 12px; }
    .ld-reset-btn { background: rgba(255,42,95,0.2); color: #ffe0e9; border: 1px solid #ff4d6d; border-radius: 16px; padding: 4px 12px; font-size: 12px; font-weight: 800; transition: 0.2s; }
    .ld-reset-btn:hover { background: #ff2a5f; color: #fff; transform: scale(1.04); }
    
    .ld-arena-cabinet {
      background: linear-gradient(180deg, #0a1f56 0%, #14368c 50%, #091b4a 100%);
      border: 2px solid #3b82f6;
      border-radius: 22px;
      padding: 10px 8px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.65), inset 0 0 20px rgba(59,130,246,0.35);
      max-width: 440px;
      margin: 0 auto 12px;
    }

    .ld-hud-row { display: flex; justify-content: space-between; gap: 8px; margin: 4px 0; }
    .ld-pcard {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(180deg, #163b96, #0d2563);
      border: 1.5px solid rgba(130, 177, 255, 0.35);
      border-radius: 14px;
      padding: 5px 8px;
      min-height: 46px;
      position: relative;
      transition: 0.25s;
    }
    .ld-pcard.empty { opacity: 0.4; justify-content: center; }
    .ld-pcard.active {
      border-color: #ffd166;
      box-shadow: 0 0 14px var(--pglow, rgba(255,209,102,0.7));
      background: linear-gradient(180deg, #1e4ec2, #112e7a);
    }
    .ld-pavatar { width: 24px; height: 30px; flex-shrink: 0; }
    .ld-pinfo { text-align: right; flex: 1; overflow: hidden; }
    .ld-pname { font-size: 12px; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ld-ppct { font-size: 10px; font-weight: 700; color: #ffd166; }

    .ld-dice-btn {
      position: relative;
      width: 38px;
      height: 38px;
      padding: 3px;
      border-radius: 10px;
      border: 2px solid #ffd166;
      background: linear-gradient(145deg, #ffffff, #e2e8f0);
      box-shadow: 0 4px 10px rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .ld-dice-btn.pulse { animation: dicePulse 0.85s infinite alternate; cursor: pointer; }
    @keyframes dicePulse { from { transform: scale(1); box-shadow: 0 0 6px #ffd166; } to { transform: scale(1.14); box-shadow: 0 0 18px #ffd166; } }
    .ld-tap-hand { position: absolute; bottom: -14px; right: -4px; font-size: 16px; animation: handBounce 0.6s infinite alternate; pointer-events: none; }
    @keyframes handBounce { to { transform: translateY(-4px); } }

    .ld-dice { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); width: 100%; height: 100%; gap: 1px; padding: 2px; }
    .ld-pip { border-radius: 50%; background: transparent; }
    .ld-pip.on { background: #1e293b; box-shadow: inset 0 1px 1px rgba(0,0,0,0.6); }

    .ld-board-frame {
      padding: 5px;
      border-radius: 16px;
      background: linear-gradient(135deg, #60a5fa, #1d4ed8);
      box-shadow: 0 6px 20px rgba(0,0,0,0.55);
      margin: 6px 0;
    }
    .ld-board {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
    }

    .ld-yard { position: absolute; box-sizing: border-box; border: 1px solid rgba(0,0,0,0.15); }
    .ld-yard-tray {
      position: absolute;
      background: linear-gradient(145deg, #ffffff, #f1f5f9);
      border-radius: 16%;
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8%;
    }
    .ld-sockets-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18%; width: 78%; height: 78%; }
    .ld-socket { border-radius: 50%; background: #e2e8f0; border: 2px solid #cbd5e1; }
    .ld-yard-pct { position: absolute; bottom: 2%; font-size: clamp(8px, 2.2vw, 11px); font-weight: 800; }

    .ld-cell {
      position: absolute;
      box-sizing: border-box;
      border: 0.5px solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ld-start-arrow { color: #fff; font-size: clamp(9px, 2.6vw, 14px); font-weight: 900; text-shadow: 0 1px 2px rgba(0,0,0,0.4); }
    .ld-star { font-size: clamp(11px, 3vw, 16px); line-height: 1; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.25)); }

    .ld-center {
      position: absolute;
      box-sizing: border-box;
      border: 1px solid #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ld-center-gem {
      width: 44%;
      height: 44%;
      border-radius: 50%;
      background: rgba(255,255,255,0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: clamp(10px, 2.8vw, 15px);
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    }

    .ld-pawn {
      position: absolute;
      z-index: 5;
      transition: left 0.28s cubic-bezier(0.22, 1, 0.36, 1), top 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translateY(-16%);
      pointer-events: none;
    }
    .ld-pin-svg { width: 92%; height: 112%; overflow: visible; }
    .ld-pawn.movable {
      pointer-events: auto;
      cursor: pointer;
      z-index: 10;
      animation: pawnHop 0.55s infinite alternate;
    }
    .ld-pawn.movable::after {
      content: "";
      position: absolute;
      bottom: -2px;
      width: 95%;
      height: 95%;
      border-radius: 50%;
      border: 2.5px solid #ffd166;
      box-shadow: 0 0 12px #ffd166;
      animation: ringPulse 0.7s infinite alternate;
    }
    @keyframes pawnHop { from { transform: translateY(-16%) scale(1); } to { transform: translateY(-38%) scale(1.18); } }
    @keyframes ringPulse { from { transform: scale(0.85); opacity: 0.7; } to { transform: scale(1.25); opacity: 1; } }

    .ld-status-bar {
      background: rgba(20, 2, 9, 0.9);
      border: 1.5px solid #ffd166;
      border-radius: 16px;
      padding: 9px 14px;
      font-size: 14px;
      font-weight: 800;
      color: #ffe0e9;
      max-width: 440px;
      margin: 0 auto;
    }
    .ld-status-bar.win {
      background: linear-gradient(135deg, #ff2a5f, #c9184a);
      color: #fff;
      font-size: 16px;
      box-shadow: 0 0 20px rgba(255,42,95,0.7);
    }
  `;
  document.head.appendChild(css);

  // إضافة تاب لودو لشريط الألعاب
  const tabsEl = document.querySelector('.tabs');
  if (tabsEl && !tabsEl.querySelector('[data-v="ludo"]')) {
    tabsEl.insertAdjacentHTML('beforeend', '<button class="tab" data-a="mode" data-v="ludo"><i>🎲</i>لودو</button>');
  }

  // ربط دالة الرسم الأساسية بلودو
  const _draw = draw;
  draw = function () {
    if (mode === 'ludo') {
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.v === 'ludo'));
      dLudo(G.ludo);
      runBotTurn(G.ludo);
    } else {
      _draw();
    }
  };

  draw();
})();
