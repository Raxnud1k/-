(function () {
  var home = document.getElementById("home"),
    love = document.getElementById("love");
  var wrap = document.getElementById("wrap"),
    go = document.getElementById("go"),
    again = document.getElementById("again");
  var canvas = document.getElementById("c"),
    ctx = canvas.getContext("2d");

  wrap.addEventListener("mousemove", function (e) {
    var b = go.getBoundingClientRect();
    go.style.setProperty("--mx", e.clientX - b.left + "px");
    go.style.setProperty("--my", e.clientY - b.top + "px");
  });

  var poly = [];
  for (var i = 0; i < 240; i++) {
    var t = (i / 240) * Math.PI * 2;
    poly.push([
      16 * Math.pow(Math.sin(t), 3),
      13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t),
    ]);
  }

  var raf = 0,
    W = 0,
    H = 0,
    u = 1,
    items = [];

  function toScreen(p) {
    return [W / 2 + p[0] * u, H / 2 - (p[1] + 2.5) * u];
  }
  function inside(x, y) {
    var c = false,
      n = poly.length;
    for (var i = 0, j = n - 1; i < n; j = i++) {
      var a = toScreen(poly[i]),
        b = toScreen(poly[j]);
      if (
        a[1] > y !== b[1] > y &&
        x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
      )
        c = !c;
    }
    return c;
  }

  function build() {
    var dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    u = Math.min((W * 0.94) / 32, (H * 0.88) / 29);

    var fs = Math.max(6, u * 0.6),
      rowH = fs * 1.06;
    ctx.font = "700 " + fs + "px Arial, Helvetica, sans-serif";
    var text = "I LOVE YOU",
      w = ctx.measureText(text).width,
      gap = fs * 0.3;
    items = [];
    var top = H / 2 - 14.5 * u,
      bottom = H / 2 + 14.5 * u;
    for (var y = top + rowH / 2; y < bottom; y += rowH) {
      var segs = [],
        start = null;
      for (var x = 0; x <= W; x += 2) {
        var ok =
          inside(x, y) &&
          inside(x, y - rowH * 0.4) &&
          inside(x, y + rowH * 0.4);
        if (ok && start === null) start = x;
        if (!ok && start !== null) {
          segs.push([start, x]);
          start = null;
        }
      }
      segs.forEach(function (s) {
        var L = s[1] - s[0] - fs * 0.4,
          n = Math.floor((L + gap) / (w + gap));
        if (n < 1) return;
        var slot = (s[1] - s[0]) / n;
        for (var k = 0; k < n; k++)
          items.push({ x: s[0] + slot * (k + 0.5), y: y, at: 0 });
      });
    }
    // случайный порядок появления
    for (var m = items.length - 1; m > 0; m--) {
      var r = Math.floor(Math.random() * (m + 1)),
        tmp = items[m];
      items[m] = items[r];
      items[r] = tmp;
    }
    var step = Math.max(3, Math.min(30, 3500 / items.length));
    items.forEach(function (it, idx) {
      it.at = 400 + idx * step;
    });
    return { fs: fs, text: text, end: 400 + items.length * step };
  }

  function play() {
    cancelAnimationFrame(raf);
    again.classList.remove("show");
    var cfg = build(),
      t0 = performance.now();

    (function frame(now) {
      var t = now - t0;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      ctx.font = "700 " + cfg.fs + "px Arial, Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (var i = 0; i < items.length; i++) {
        var it = items[i],
          a = (t - it.at) / 130;
        if (a <= 0) continue;
        if (a > 1) a = 1;
        ctx.globalAlpha = a;
        ctx.fillStyle = "#ff1e3c";
        ctx.shadowColor = "#ff1e3c";
        ctx.shadowBlur = a < 1 ? 10 : 0;
        ctx.fillText(cfg.text, it.x, it.y);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      if (t < cfg.end + 400) raf = requestAnimationFrame(frame);
      else {
        again.classList.add("show");
      }
    })(t0);
  }

  function show(name) {
    var isLove = name === "love";
    home.classList.toggle("active", !isLove);
    love.classList.toggle("active", isLove);
    if (isLove) setTimeout(play, 700);
    else cancelAnimationFrame(raf);
  }

  go.addEventListener("click", function () {
    location.hash = "love";
  });
  again.addEventListener("click", play);
  window.addEventListener("hashchange", function () {
    show(location.hash === "#love" ? "love" : "home");
  });
  if (location.hash === "#love") show("love");

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (love.classList.contains("active")) play();
    }, 250);
  });
})();
(function () {
  var c = document.getElementById("fx"),
    x = c.getContext("2d"),
    w,
    h,
    ps = [];
  var light = document.getElementById("light");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function size() {
    var d = window.devicePixelRatio || 1;
    w = innerWidth;
    h = innerHeight;
    c.width = w * d;
    c.height = h * d;
    x.setTransform(d, 0, 0, d, 0, 0);
  }

  function mk(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 1.3, // размер искры
      v: 0.12 + Math.random() * 0.3, // скорость подъёма
      a: 0.2 + Math.random() * 0.4, // яркость
      p: Math.random() * 6.28,
      f: 0.01 + Math.random() * 0.02, // скорость мерцания
    };
  }

  size();
  for (var i = 0; i < 26; i++) ps.push(mk(true)); // 26 — количество искр
  addEventListener("resize", size);

  var lx = innerWidth / 2,
    ly = innerHeight / 2,
    tx = lx,
    ty = ly;
  addEventListener("pointermove", function (e) {
    tx = e.clientX;
    ty = e.clientY;
  });

  (function loop() {
    x.clearRect(0, 0, w, h);
    ps.forEach(function (q, i) {
      if (!still) {
        q.y -= q.v;
        q.p += q.f;
      }
      if (q.y < -10) ps[i] = mk(false);
      x.fillStyle =
        "rgba(255, 70, 90, " + q.a * (0.55 + 0.45 * Math.sin(q.p)) + ")";
      x.beginPath();
      x.arc(q.x, q.y, q.r, 0, 6.2832);
      x.fill();
    });
    lx += (tx - lx) * 0.08; // 0.08 — плавность следования света за мышкой
    ly += (ty - ly) * 0.08;
    light.style.transform =
      "translate(" + (lx - 300) + "px," + (ly - 300) + "px)";
    requestAnimationFrame(loop);
  })();
})();
