/* ================= 2) لودو (Ludo Engine) ================= */
(function () {
  const LC = ['#e63946', '#2a9d8f', '#e9c46a', '#3a86ff'], SAFE = [0, 8, 13, 21, 26, 34, 39, 47];
  
  // تحديد مقعد اللاعب: مصطفى وفريال بياخدوا مقاعد متقابلة (0 و 2)
  const ms = () => { const k = [MK, YK].sort(); return k.indexOf(MK) === 0 ? 0 : 2; }; 
  const nm = s => { const k = [MK, YK].sort(); return s === 0 ? (k[0] === MK ? ME : YOU) : s === 2 ? (k[1] === MK ? ME : YOU) : '🤖 كمبيوتر ' + (s === 1 ? 1 : 2); };

  const SEATS = c => c ? [0, 1, 2, 3] : [0, 2];
  const nxtSeat = s => { const L = SEATS(s.cpu); return L[(L.indexOf(s.t) + 1) % L.length]; };
  const moves = s => { const o = []; (s.pw[s.t] || []).forEach((p, i) => { if (p < 0 ? s.d === 6 : p + s.d <= 56) o.push(i); }); return o; };
  
  function ludoInit(c) { 
    return { st: 'play', cpu: c, t: 0, d: 0, ld: 0, pw: [0, 1, 2, 3].map(() => [-1, -1, -1, -1]), m: 'ابدأ برمي النرد 🎲', n: Date.now() / 1000 | 0 }; 
  }
  
  function ludoRoll(s, exp) {
    if (!s || s.st !== 'play' || s.d || (exp != null && s.n !== exp)) return;
    s.d = 1 + Math.random() * 6 | 0; s.ld = s.d; s.n++;
    if (!moves(s).length) { s.m = nm(s.t) + ' رمى ' + s.d + ' ومفيش حركة ⏭'; s.d = 0; s.t = nxtSeat(s); }
    else s.m = nm(s.t) + ' رمى ' + s.d;
    return s;
  }
  
  function ludoMove(s, i, exp) {
    if (!s || s.st !== 'play' || !s.d || (exp != null && s.n !== exp) || !moves(s).includes(i)) return;
    const t = s.t, P = s.pw[t], d = s.d, np = P[i] < 0 ? 0 : P[i] + d; P[i] = np; let cap = 0;
    
    if (np <= 50) {
      const ab = (13 * t + np) % 52;
      if (!SAFE.includes(ab)) SEATS(s.cpu).forEach(o => { if (o !== t) s.pw[o].forEach((q, j) => { if (q >= 0 && q <= 50 && (13 * o + q) % 52 === ab) { s.pw[o][j] = -1; cap = 1; } }); });
    }
    s.n++; s.ld = d;
    
    if (P.every(p => p === 56)) { s.st = 'done'; s.w = t; s.d = 0; s.m = '🎉 ' + nm(t) + ' خلّص كل بيادقه!'; return s; }
    
    const ex = d === 6 || cap || np === 56; s.d = 0; if (!ex) s.t = nxtSeat(s);
    s.m = nm(t) + ' حرّك' + (cap ? ' وأكل بيدق 💥' : '') + (np === 56 ? ' وأوصل بيدق للبيت 🏠' : '') + (ex ? ' ويلعب تاني' : '');
    return s;
  }
  
  function ludoBest(s) {
    const t = s.t, d = s.d; let bi = -1, bs = -1e9;
    moves(s).forEach(i => {
      const p = s.pw[t][i], np = p < 0 ? 0 : p + d; let sc = np / 5;
      if (np === 56) sc += 100; if (p < 0) sc += 40; if (np > 50) sc += 25;
      if (np <= 50) {
        const ab = (13 * t + np) % 52;
        if (SAFE.includes(ab)) sc += 8;
        else SEATS(s.cpu).forEach(o => { if (o !== t) s.pw[o].forEach(q => { if (q >= 0 && q <= 50 && (13 * o + q) % 52 === ab) sc += 60; }); });
      }
      if (sc > bs) { bs = sc; bi = i; }
    });
    return bi;
  }

  const PATH = [];
  [[6, 1, 0, 1, 5], [5, 6, -1, 0, 6], [0, 7, 0, 1, 2], [1, 8, 1, 0, 5], [6, 9, 0, 1, 6], [7, 14, 1, 0, 2], [8, 13, 0, -1, 5], [9, 8, 1, 0, 6], [14, 7, 0, -1, 2], [13, 6, -1, 0, 5], [8, 5, 0, -1, 6], [7, 0, -1, 0, 2]]
    .forEach(([r, c, a, b, n]) => { for (let i = 0; i < n; i++) PATH.push([r + a * i, c + b * i]); });
  const lRot = (p, k) => { let r = p[0], c = p[1]; for (let i = 0; i < k; i++) [r, c] = [c, 14 - r]; return [r, c]; };
  const U = 100 / 15, lBox = (r, c, w, h, st, tx) => `<i style="left:${c * U}%;top:${r * U}%;width:${w * U}%;height:${h * U}%;${st || ''}">${tx || ''}</i>`;

  function ludoBoard(L) {
    let h = '';
    [[0, 0], [0, 9], [9, 9], [9, 0]].forEach((p, s) => { h += lBox(p[0], p[1], 6, 6, 'background:' + LC[s]) + lBox(p[0] + 1, p[1] + 1, 4, 4, 'background:#fff;border-radius:50%'); });
    h += lBox(6, 6, 3, 3, `background:conic-gradient(from -45deg,${LC[1]} 0 90deg,${LC[2]} 90deg 180deg,${LC[3]} 180deg 270deg,${LC[0]} 270deg 360deg)`);
    PATH.forEach((p, i) => { h += lBox(p[0], p[1], 1, 1, `background:${i % 13 === 0 ? LC[i / 13] + 'bb' : '#fff'};border:1px solid #bbb`, i % 13 === 8 ? '★' : ''); });
    for (let s = 0; s < 4; s++) for (let j = 0; j < 5; j++) { const q = lRot([7, 1 + j], s); h += lBox(q[0], q[1], 1, 1, `background:${LC[s]}cc;border:1px solid #fff`); }
    const mv = L.st === 'play' && L.t === ms() && L.d ? moves(L) : [], cnt = {};
    SEATS(L.cpu).forEach(s => L.pw[s].forEach((p, i) => {
      let r, c;
      if (p < 0) { [r, c] = lRot([[1, 1], [1, 4], [4, 1], [4, 4]][i], s); }
      else if (p <= 50) { [r, c] = PATH[(13 * s + p) % 52]; }
      else if (p < 56) { [r, c] = lRot([7, 1 + p - 51], s); }
      else { [r, c] = [[7, 6.3], [6.3, 7], [7, 7.7], [7.7, 7]][s]; if (s % 2) c += (i % 2 ? .12 : -.12); else r += (i % 2 ? .12 : -.12); }
      const k = r + ',' + c, o = cnt[k] = (cnt[k] || 0) + 1, off = (o - 1) * .14, can = s === L.t && mv.includes(i);
      h += `<b class="lp${can ? ' mv' : ''}" style="left:${(c + .11 + off) * U}%;top:${(r + .11 - off) * U}%;width:${U * .78}%;height:${U * .78}%;background:${LC[s]}"${can ? ` data-a="lm" data-v="${i}"` : ''}></b>`;
    }));
    return h;
  }

  function dLudo(L) {
    if (!L || !L.st) {
      stage(bar('🎲 لودو', 'اختار طريقة اللعب') + `<div class="q">لودو ♥️</div><div class="row"><button class="go" data-a="ls" data-v="1">🤖 أنا و${esc(YOU)} ضد كمبيوترين</button><button class="go alt" data-a="ls" data-v="0">💑 إحنا الاتنين بس</button></div>`);
      return;
    }
    const my = L.t === ms() && L.st === 'play', dc = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][L.d || L.ld || 0];
    stage(bar('🎲 لودو' + (L.cpu ? ' — إحنا ضد الكمبيوتر 🤖' : ''), L.st === 'done' ? 'خلصت اللعبة' : `الدور: <b style="color:${LC[L.t]}">${esc(nm(L.t))}</b>`)
      + `<div class="lb">${ludoBoard(L)}</div><div style="font-size:46px;line-height:1.1;color:var(--g);text-shadow:0 2px 5px rgba(0,0,0,0.5);">${dc}</div><div class="rev" style="padding:8px">${esc(L.m || '')}</div>`
      + (L.st === 'done' ? '<button class="go" data-a="lx">🔄 لعبة جديدة</button>' : my && !L.d ? '<button class="go" data-a="lr">🎲 ارمي النرد</button>' : my ? '<small style="color:var(--b)">اختار بيدق بيلمع عشان تحركه 👆</small>' : ''));
  }

  let kBot = 0;
  function bots(L) {
    if (!L || L.st !== 'play' || !L.cpu || L.t % 2 === 0 || kBot === L.n) return;
    kBot = L.n; const n = L.n;
    setTimeout(() => R('ludo').transaction(s => { if (!s || s.n !== n) return; return s.d ? ludoMove(s, ludoBest(s), n) : ludoRoll(s, n); }), 1100);
  }

  // إضافة أوامر لودو
  Object.assign(act, {
    ls(v) { R('ludo').transaction(s => s && s.st ? s : ludoInit(+v)); },
    lr() { R('ludo').transaction(s => (s && s.t === ms()) ? ludoRoll(s) : undefined); },
    lm(i) { R('ludo').transaction(s => (s && s.t === ms()) ? ludoMove(s, +i) : undefined); },
    lx() { R('ludo').set(null); }
  });

  // إضافة ستايلات وزرار لودو للواجهة الرئيسية
  const css = document.createElement('style');
  css.textContent = '.tabs{grid-template-columns:repeat(5,1fr)!important}.tab{font-size:12px}.lb{position:relative;width:min(96%,440px);aspect-ratio:1/1;margin:6px auto;background:#fff;border-radius:12px;overflow:hidden}.lb i{position:absolute;display:grid;place-items:center;box-sizing:border-box;font-style:normal;font-size:clamp(8px,2.4vw,12px);color:#777}.lp{position:absolute;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 4px #0007;transition:left .3s,top .3s;z-index:2}.lp.mv{cursor:pointer;z-index:4;animation:lpp .7s infinite alternate}@keyframes lpp{to{transform:scale(1.28)}}';
  document.head.appendChild(css);
  document.querySelector('.tabs').insertAdjacentHTML('beforeend', '<button class="tab" data-a="mode" data-v="ludo"><i>🎲</i>لودو</button>');

  // تحديث الدالة الأساسية عشان تدعم لودو
  const _draw = draw;
  draw = function () {
    if (mode === 'ludo') {
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.v === 'ludo'));
      dLudo(G.ludo); bots(G.ludo);
    } else {
      _draw();
    }
  };
  
  // ارسم الشاشة لأول مرة
  draw();
})();
