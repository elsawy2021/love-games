/* ================= extras.js — لودو الاحترافية (Ludo King Style) + إصلاح مين فينا ================= */
(function () {
  // حفظ واسترجاع الأسماء عشان لو الصفحة اتعملها ريفريش
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
      w = w || {}; w.v = w.v || {};
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

  /* ================= 2) محرك الصوت 🎵 ================= */
  let audioCtx = null;
  function playTone(type) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator(), gain = audioCtx.createGain(), now = audioCtx.currentTime;
      osc.connect(gain); gain.connect(audioCtx.destination);
      if (type === 'dice') {
        osc.type = 'triangle'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
        gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1);
      } else if (type === 'step') { // صوت خطوة البيدق
        osc.type = 'sine'; osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
      } else if (type === 'capture') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gain.gain.setValueAtTime(0.3, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
      } else if (type === 'win') {
        osc.type = 'square'; [523, 659, 784, 1046].forEach((f, i) => osc.frequency.setValueAtTime(f, now + i * 0.1));
        gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now); osc.stop(now + 0.4);
      }
    } catch (e) {}
  }

  /* ================= 3) محرك لودو وقواعد اللعب 🎲 ================= */
  const SEAT_COLORS = [
    { main: '#2563eb', dark: '#1e3a8a', light: '#93c5fd', name: 'أزرق' }, // 0: Bottom-Left
    { main: '#dc2626', dark: '#7f1d1d', light: '#fca5a5', name: 'أحمر' }, // 1: Top-Left
    { main: '#16a34a', dark: '#14532d', light: '#86efac', name: 'أخضر' }, // 2: Top-Right
    { main: '#eab308', dark: '#713f12', light: '#fef08a', name: 'أصفر' }  // 3: Bottom-Right
  ];

  const START_IDX = [39, 0, 13, 26]; 
  const SAFE = [0, 8, 13, 21, 26, 34, 39, 47];

  function isPartnerFemale(name) {
    const s = String(name || '').toLowerCase();
    return s.includes('فريال') || s.includes('فلفله') || s.includes('فلفلة');
  }

  const mySeat = () => (Q.get('seat') === '2' || isPartnerFemale(ME)) ? 2 : 0;
  const seatName = (s) => {
    const ms = mySeat();
    if (s === ms) return ME;
    if (s === (ms === 0 ? 2 : 0)) return YOU;
    return s === 1 ? 'كمبيوتر 1' : 'كمبيوتر 2';
  };

  const SEATS = c => c ? [0, 1, 2, 3] : [0, 2];
  const nxtSeat = s => { const l = SEATS(s.cpu); return l[(l.indexOf(s.t) + 1) % l.length]; };
  const validMoves = s => {
    const out = [];
    (s.pw[s.t] || []).forEach((p, i) => { if (p < 0 ? s.d === 6 : p + s.d <= 56) out.push(i); });
    return out;
  };

  function ludoInit(cpu) {
    return {
      st: 'play', cpu: cpu, t: mySeat(), d: 0, ld: 0,
      pw: [[-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1], [-1,-1,-1,-1]],
      m: 'دور ' + seatName(mySeat()) + ' — ارمي النرد 🎲', n: 1
    };
  }

  function ludoRoll(s, exp) {
    if (!s || s.st !== 'play' || s.d || (exp != null && s.n !== exp)) return;
    const rolled = 1 + (Math.random() * 6 | 0);
    s.d = rolled; s.ld = rolled; s.n = (s.n || 1) + 1;
    if (!validMoves(s).length) {
      const rn = seatName(s.t);
      s.d = 0; s.t = nxtSeat(s);
      s.m = `${rn} جاب (${rolled}) ومفيش حركة ⏭ الدور على ${seatName(s.t)}`;
    } else {
      s.m = `${seatName(s.t)} جاب (${rolled}) — حرك بيدق 👆`;
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
          if (o !== t) s.pw[o].forEach((q, j) => { if (q >= 0 && q <= 50 && (START_IDX[o] + q) % 52 === ab) { s.pw[o][j] = -1; cap = 1; } });
        });
      }
    }

    s.n = (s.n || 1) + 1; s.ld = d;
    if (P.every(p => p === 56)) {
      s.st = 'done'; s.w = t; s.d = 0; s.m = `🏆 مبروك! ${seatName(t)} كسب الجيم! 🎉♥️`;
      return s;
    }

    const xtra = (d === 6 || cap === 1 || np === 56);
    const mn = seatName(t);
    s.d = 0;
    if (!xtra) s.t = nxtSeat(s);

    if (xtra) s.m = `${mn} ${cap ? 'أكل بيدق 💥' : np === 56 ? 'دخّل بيدق 🏠' : 'جاب 6 🔥'} ويلعب تاني!`;
    else s.m = `الدور على ${seatName(s.t)} 🎲`;
    return s;
  }

  function ludoBestBotMove(s) {
    const t = s.t, d = s.d; let bi = -1, bs = -1e9;
    validMoves(s).forEach(i => {
      const p = s.pw[t][i], np = p < 0 ? 0 : p + d; let sc = np / 4;
      if (np === 56) sc += 120; if (p < 0) sc += 45; if (np > 50) sc += 30;
      if (np <= 50) {
        const ab = (START_IDX[t] + np) % 52;
        if (SAFE.includes(ab)) sc += 10;
        else SEATS(s.cpu).forEach(o => { if (o !== t) s.pw[o].forEach(q => { if (q >= 0 && q <= 50 && (START_IDX[o] + q) % 52 === ab) sc += 80; }); });
      }
      if (sc > bs) { bs = sc; bi = i; }
    });
    return bi;
  }

  /* ================= 4) محرك الحركات السلسة (Step-by-Step Animator) ================= */
  let display_pw = null;
  let isAnimating = false;
  let animQueue = [];
  let currentTargetLudo = null;

  function syncDisplayPw(targetLudo) {
    currentTargetLudo = targetLudo;
    if (!display_pw) {
      display_pw = JSON.parse(JSON.stringify(targetLudo.pw));
      _drawLudoFrame();
      return;
    }

    for (let s = 0; s < 4; s++) {
      for (let i = 0; i < 4; i++) {
        let oldP = display_pw[s][i];
        let newP = targetLudo.pw[s][i];
        if (oldP !== newP) {
          if (newP === -1) {
            // أكل: يرجع فجأة عشان اللعب ميتعطلش
            display_pw[s][i] = -1;
            playTone('capture');
          } else {
            // نطة بنطة من المربع الحالي للجديد
            let start = oldP < 0 ? 0 : oldP + 1;
            for (let step = start; step <= newP; step++) {
              animQueue.push({ s, i, step });
            }
          }
        }
      }
    }
    processAnimQueue();
  }

  function processAnimQueue() {
    if (isAnimating || animQueue.length === 0) {
      if (animQueue.length === 0) _drawLudoFrame(); // التحديث النهائي للنصوص والأدوار
      return;
    }
    isAnimating = true;
    let m = animQueue.shift();
    display_pw[m.s][m.i] = m.step;
    
    // إضافة كلاس النطة للبيدق في الرسم
    window._hoppingPawn = `${m.s}-${m.i}`;
    playTone('step');
    _drawLudoFrame(true); 
    
    setTimeout(() => {
      window._hoppingPawn = null;
      isAnimating = false;
      processAnimQueue();
    }, 180); // سرعة النطة 180 ملي ثانية
  }


  /* ================= 5) هندسة اللوحة (180° Rotate) ورسم الجرافيك ================= */
  const PATH = [];
  [
    [6, 1, 0, 1, 5], [5, 6, -1, 0, 6], [0, 7, 0, 1, 2],
    [1, 8, 1, 0, 5], [6, 9, 0, 1, 6], [7, 14, 1, 0, 2],
    [8, 13, 0, -1, 5], [9, 8, 1, 0, 6], [14, 7, 0, -1, 2],
    [13, 6, -1, 0, 5], [8, 5, 0, -1, 6], [7, 0, -1, 0, 2]
  ].forEach(([r, c, a, b, n]) => {
    for (let i = 0; i < n; i++) PATH.push([r + a * i, c + b * i]);
  });

  const HOME_STREAK = [
    [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]], 
    [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],     
    [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],     
    [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]]  
  ];

  const YARD_ORIGINS = [[9, 0], [0, 0], [0, 9], [9, 9]];

  function vCoord(r, c) { return mySeat() === 2 ? [14 - r, 14 - c] : [r, c]; }
  function vBox(r, c, w, h) { return mySeat() === 2 ? [15 - r - h, 15 - c - w] : [r, c]; }
  const U = 100 / 15;
  const cellHtml = (r, c, w, h, cls, st, inner) => {
    const [vr, vc] = vBox(r, c, w, h);
    return `<div class="${cls}" style="left:${vc * U}%;top:${vr * U}%;width:${w * U}%;height:${h * U}%;${st || ''}">${inner || ''}</div>`;
  };

  function renderDice3D(val, rolling) {
    // نرد احترافي 3D
    const pips = { 1:[4], 2:[0,8], 3:[0,4,8], 4:[0,2,6,8], 5:[0,2,4,6,8], 6:[0,2,3,5,6,8] };
    let dHtml = '';
    for(let i=0; i<9; i++) {
      dHtml += `<span class="pip ${(pips[val||6]||[4]).includes(i)?'on':''}">&nbsp;</span>`;
    }
    return `<div class="dice-wrapper ${rolling ? 'rolling' : ''}"><div class="dice-cube"><div class="dice-face">${dHtml}</div></div></div>`;
  }

  function renderPawn3D(col) {
    return `<div class="pawn-3d" style="--pc1:${col.main};--pc2:${col.dark}">
              <div class="pawn-head"></div>
              <div class="pawn-body"></div>
              <div class="pawn-base"></div>
            </div>`;
  }

  function buildLudoBoardHtml(L) {
    let h = '';
    const isFlipped = mySeat() === 2;

    // 1. القواعد (Yards)
    YARD_ORIGINS.forEach(([yr, yc], s) => {
      const col = SEAT_COLORS[s];
      h += cellHtml(yr, yc, 6, 6, 'ld-yard', `background:${col.main};`);
      let socks = '';
      [[0,0], [0,1], [1,0], [1,1]].forEach(([sr, sc]) => {
        socks += `<div class="ld-socket"></div>`;
      });
      h += cellHtml(yr + 1, yc + 1, 4, 4, 'ld-yard-tray', '', `<div class="ld-sockets-grid">${socks}</div>`);
    });

    // 2. المركز
    const gradDeg = isFlipped ? '135deg' : '-45deg';
    h += cellHtml(6, 6, 3, 3, 'ld-center', `background:conic-gradient(from ${gradDeg}, ${SEAT_COLORS[1].main} 0 90deg, ${SEAT_COLORS[2].main} 90deg 180deg, ${SEAT_COLORS[3].main} 180deg 270deg, ${SEAT_COLORS[0].main} 270deg 360deg);`);

    // 3. المسار الخارجي
    const startColorMap = { 39: SEAT_COLORS[0], 0: SEAT_COLORS[1], 13: SEAT_COLORS[2], 26: SEAT_COLORS[3] };
    const starColorMap = { 47: SEAT_COLORS[1], 8: SEAT_COLORS[2], 21: SEAT_COLORS[3], 34: SEAT_COLORS[0] };

    PATH.forEach(([r, c], idx) => {
      let bg = '#fff', inner = '';
      if (startColorMap[idx]) { bg = startColorMap[idx].main; inner = '<span class="ld-arrow">➜</span>'; }
      else if (starColorMap[idx]) { inner = `<span class="ld-star" style="color:${starColorMap[idx].main}">★</span>`; }
      h += cellHtml(r, c, 1, 1, 'ld-cell', `background:${bg};`, inner);
    });

    // 4. مسارات الوصول
    HOME_STREAK.forEach((streak, s) => {
      const col = SEAT_COLORS[s];
      for (let j = 0; j < 5; j++) {
        h += cellHtml(streak[j][0], streak[j][1], 1, 1, 'ld-cell', `background:${col.main};opacity:0.9;`);
      }
    });

    // 5. البيادق باستخدام display_pw المنسق
    const pwToDraw = display_pw || L.pw;
    const mv = (!isAnimating && L.st === 'play' && L.t === mySeat() && L.d) ? validMoves(L) : [];
    const stackCount = {};

    SEATS(L.cpu).forEach(s => {
      const col = SEAT_COLORS[s];
      pwToDraw[s].forEach((p, i) => {
        let r, c;
        if (p < 0) {
          const [yr, xc] = YARD_ORIGINS[s];
          const offsets = [[1.4, 1.4], [1.4, 3.6], [3.6, 1.4], [3.6, 3.6]];
          r = yr + offsets[i][0]; c = xc + offsets[i][1];
        } else if (p <= 50) {
          [r, c] = PATH[(START_IDX[s] + p) % 52];
        } else if (p < 56) {
          [r, c] = HOME_STREAK[s][p - 51];
        } else {
          [r, c] = HOME_STREAK[s][5];
          const spread = (i - 1.5) * 0.2;
          if (s === 0 || s === 2) c += spread; else r += spread;
        }

        const [vr, vc] = vCoord(r, c);
        const key = `${Math.round(vr * 10)},${Math.round(vc * 10)}`;
        const count = stackCount[key] = (stackCount[key] || 0) + 1;
        const shift = (count - 1) * 0.12;
        const canMove = (s === L.t && mv.includes(i));
        const isHopping = window._hoppingPawn === `${s}-${i}`;

        h += `<div class="ld-pawn-wrapper ${canMove ? 'movable' : ''} ${isHopping ? 'hopping' : ''}" 
                   style="left:${(vc + shift) * U}%;top:${(vr - shift) * U}%;width:${U}%;height:${U}%;"
                   ${canMove ? `data-a="lm" data-v="${i}"` : ''}>
                ${renderPawn3D(col)}
              </div>`;
      });
    });
    return h;
  }

  function _drawLudoFrame(skipUpdateState = false) {
    const L = currentTargetLudo || G.ludo;
    if (!L || !L.st) return;
    
    const meS = mySeat();
    const isMyTurn = (L.t === meS && L.st === 'play');
    const diceVal = (isMyTurn && !L.d) ? 6 : (L.ld || 1);
    
    // شريط الحالة السفلي والنرد
    const actionHtml = L.st === 'done' 
      ? `<button class="go" data-a="lx">🎉 جولة جديدة</button>`
      : `<div class="ld-action-bar">
          <div class="ld-dice-area" ${isMyTurn && !L.d && !isAnimating ? 'data-a="lr"' : ''}>
             ${renderDice3D(diceVal, window._rollingDice)}
          </div>
          <div class="ld-msg-area">${esc(L.m || '')}</div>
         </div>`;

    const html = `
      <div class="bar" style="align-items:center;">
        <span class="pill">🎲 لودو Ludo</span>
        <button class="ld-reset-btn" data-a="lx">🔄 إعادة اللعب</button>
      </div>
      <div class="ld-board-container">
        <div class="ld-board-inner">
          ${buildLudoBoardHtml(L)}
        </div>
      </div>
      ${actionHtml}
    `;
    
    const sEl = $('stage');
    if (sEl.innerHTML !== html) sEl.innerHTML = html;
  }

  function dLudo(L) {
    if (!L || !L.st) {
      display_pw = null;
      isAnimating = false;
      animQueue = [];
      stage(
        bar('🎲 لودو 3D', 'اختار المود')
        + `<div class="q" style="font-size:18px;">جاهزين للتحدي؟ ♥️🎲</div>`
        + `<div class="row" style="gap:12px;margin-top:20px;">
            <button class="go" data-a="ls" data-v="0">💑 إحنا الاتنين بس (1 ضد 1)</button>
            <button class="go alt" data-a="ls" data-v="1" style="width:100%">🤖 أنا و${esc(YOU)} ضد الكمبيوتر</button>
          </div>`
      );
      return;
    }
    syncDisplayPw(L);
  }

  // روبوت بيفكر ويلعب لوحده
  let lastBotStep = -1;
  function runBotTurn(L) {
    if (!L || L.st !== 'play' || !L.cpu || L.t % 2 === 0 || lastBotStep === L.n) return;
    lastBotStep = L.n;
    const currentStep = L.n;
    setTimeout(() => {
      if (isAnimating) { lastBotStep = -1; return; } // استنى الأنيميشن يخلص
      R('ludo').transaction(s => {
        if (!s || s.n !== currentStep || s.st !== 'play' || s.t % 2 === 0) return;
        return s.d ? ludoMove(s, ludoBestBotMove(s), currentStep) : ludoRoll(s, currentStep);
      });
    }, 1200);
  }

  // ================= 6) ربط الإجراءات (Actions) =================
  Object.assign(act, {
    ls(v) { R('ludo').set(ludoInit(+v)); },
    lr() {
      if (window._rollingDice || isAnimating) return;
      playTone('dice');
      window._rollingDice = true;
      _drawLudoFrame(); // تشغيل أنيميشن النرد
      
      setTimeout(() => {
        window._rollingDice = false;
        R('ludo').transaction(s => {
          if (!s || s.t !== mySeat() || s.d) return;
          return ludoRoll(s);
        });
      }, 500); // النرد بيلف نص ثانية قبل ما يظهر الرقم
    },
    lm(i) {
      if (isAnimating) return;
      R('ludo').transaction(s => {
        if (!s || s.t !== mySeat() || !s.d) return;
        return ludoMove(s, +i);
      });
    },
    lx() { R('ludo').set(null); }
  });

  // ================= 7) ستايلات الـ 3D لودو =================
  const css = document.createElement('style');
  css.textContent = `
    .tabs { grid-template-columns: repeat(5, 1fr) !important; }
    .tab { font-size: 12px; }
    .ld-reset-btn { background: transparent; color: #ffd166; border: 1px solid #ffd166; border-radius: 12px; padding: 4px 10px; font-size: 12px; cursor: pointer; transition: 0.2s; }
    .ld-reset-btn:hover { background: #ffd166; color: #140209; }

    .ld-board-container {
      background: linear-gradient(145deg, #1e1e2f, #151522);
      border: 3px solid #333;
      border-radius: 12px;
      padding: 6px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8), inset 0 0 10px rgba(255,255,255,0.1);
      margin-bottom: 15px;
    }
    .ld-board-inner {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #f1f5f9;
      border-radius: 6px;
      overflow: hidden;
    }

    .ld-yard { position: absolute; box-sizing: border-box; }
    .ld-yard-tray { position: absolute; background: #fff; border-radius: 20%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; padding: 10%; }
    .ld-sockets-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20%; width: 100%; height: 100%; }
    .ld-socket { border-radius: 50%; background: #e2e8f0; box-shadow: inset 0 3px 6px rgba(0,0,0,0.3); }

    .ld-cell { position: absolute; box-sizing: border-box; border: 0.5px solid #cbd5e1; display: flex; align-items: center; justify-content: center; }
    .ld-arrow { color: #fff; font-size: clamp(10px, 3vw, 16px); text-shadow: 0 1px 2px rgba(0,0,0,0.5); font-weight: bold; }
    .ld-star { font-size: clamp(14px, 4vw, 22px); line-height: 1; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); }
    .ld-center { position: absolute; box-sizing: border-box; border: 1px solid #94a3b8; }

    /* بيادق 3D احترافية */
    .ld-pawn-wrapper {
      position: absolute;
      z-index: 5;
      transition: left 0.18s linear, top 0.18s linear; /* حركة خطية لأننا بننطها مربع مربع */
      pointer-events: none;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      transform: translateY(-20%);
    }
    .pawn-3d {
      width: 80%; height: 120%;
      position: relative;
      filter: drop-shadow(0 4px 3px rgba(0,0,0,0.6));
    }
    .pawn-base { position: absolute; bottom: 0; width: 100%; height: 30%; background: var(--pc2); border-radius: 50%; border: 1px solid rgba(255,255,255,0.4); }
    .pawn-body { position: absolute; bottom: 15%; left: 15%; width: 70%; height: 60%; background: linear-gradient(to right, var(--pc2), var(--pc1), var(--pc2)); clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%); }
    .pawn-head { position: absolute; top: 0; left: 10%; width: 80%; aspect-ratio: 1; background: radial-gradient(circle at 35% 35%, #fff 0%, var(--pc1) 40%, var(--pc2) 100%); border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.4); }
    
    .ld-pawn-wrapper.movable { pointer-events: auto; cursor: pointer; z-index: 10; animation: pawnBlink 1s infinite alternate; }
    .ld-pawn-wrapper.movable::after { content: ''; position: absolute; bottom: -5px; width: 100%; height: 30%; border-radius: 50%; border: 2px solid #ffd166; box-shadow: 0 0 10px #ffd166; animation: ringBlink 1s infinite alternate; }
    @keyframes pawnBlink { to { transform: translateY(-30%) scale(1.1); } }
    @keyframes ringBlink { to { transform: scale(1.3); opacity: 0; } }

    /* أنيميشن النطة وقت الحركة */
    .ld-pawn-wrapper.hopping .pawn-3d { animation: arcHop 0.18s ease-in-out; }
    @keyframes arcHop { 0%{transform:translateY(0) scale(1);} 50%{transform:translateY(-15px) scale(1.15);} 100%{transform:translateY(0) scale(1);} }

    /* شريط التحكم السفلي والنرد الـ 3D */
    .ld-action-bar { display: flex; align-items: center; background: #1a1a2e; border: 1.5px solid #ffd166; border-radius: 16px; padding: 6px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
    .ld-dice-area { width: 50px; height: 50px; flex-shrink: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 12px; }
    .ld-dice-area[data-a="lr"] { background: rgba(255,209,102,0.2); border: 1px dashed #ffd166; animation: promptRoll 1s infinite alternate; }
    @keyframes promptRoll { to { transform: scale(1.05); } }
    
    .dice-wrapper { width: 40px; height: 40px; perspective: 400px; }
    .dice-cube { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.1s; }
    .dice-wrapper.rolling .dice-cube { animation: tumble 0.5s linear infinite; }
    @keyframes tumble { 0%{transform:rotateX(0) rotateY(0) rotateZ(0);} 100%{transform:rotateX(360deg) rotateY(720deg) rotateZ(360deg);} }
    
    .dice-face { position: absolute; width: 100%; height: 100%; background: linear-gradient(145deg, #fff, #f0f0f0); border-radius: 8px; border: 1px solid #ccc; box-shadow: inset 0 0 8px rgba(0,0,0,0.1); display: grid; grid-template-columns: repeat(3,1fr); grid-template-rows: repeat(3,1fr); padding: 4px; gap: 2px; }
    .pip { background: transparent; border-radius: 50%; }
    .pip.on { background: #111; box-shadow: inset 0 1px 2px rgba(255,255,255,0.5); }

    .ld-msg-area { flex: 1; text-align: right; padding-right: 12px; font-size: 14px; font-weight: 800; color: #ffe0e9; line-height: 1.4; }
  `;
  document.head.appendChild(css);

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
