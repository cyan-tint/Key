/* ============================================================================
 * 《密钥》· 第一章 · 小游戏
 *   - adjustComp: 补偿金滑块调整
 *   - clearDebt: 赊账清除
 *   - shoot: 警察枪击
 * ========================================================================== */

window.MiniGames = (function () {
  "use strict";

  function div(cls, parent) {
    var d = document.createElement("div");
    if (cls) d.className = cls;
    if (parent) parent.appendChild(d);
    return d;
  }

  /* =========================================================
   * 小游戏一：补偿金滑块调整
   * ======================================================= */
  function adjustComp(container, config, onComplete) {
    config = config || {};
    var empName = config.name || "林国强";
    var maxLabel = config.maxAmount || "两倍";
    var defLabel = config.defaultAmount || "最低";

    container.innerHTML = "";
    var root = div("mg-comp", container);

    var tip = div("mg-tip", root);
    tip.textContent = config.prompt || "拖动滑块，把补偿金额调整为两倍标准。";

    var desk = div("comp-desk", root);
    var doc = div("comp-doc", desk);
    doc.innerHTML =
      '<div class="comp-doc-head">遣散员工补偿金审批表</div>' +
      '<div class="comp-name">' + empName + '</div>' +
      '<div class="comp-row"><span class="comp-label">岗位：</span><span>仓库管理 · 5年</span></div>' +
      '<div class="comp-row"><span class="comp-label">补偿标准：</span><span class="comp-value" id="compVal">' + defLabel + '</span></div>';

    var wrap = div("comp-slider-wrap", root);
    var track = div("comp-slider-track", wrap);
    var fill = div("comp-slider-fill", track);
    var thumb = div("comp-slider-thumb", track);
    var labels = div("comp-slider-labels", wrap);
    labels.innerHTML = "<span>" + defLabel + "</span><span>一倍</span><span>" + maxLabel + "</span>";

    var confirmBtn = document.createElement("button");
    confirmBtn.className = "comp-confirm";
    confirmBtn.textContent = "确认修改";
    confirmBtn.style.display = "none";
    wrap.appendChild(confirmBtn);

    var dragging = false;
    var valuePct = 0;

    function updateThumb(pct) {
      pct = Math.max(0, Math.min(100, pct));
      valuePct = pct;
      fill.style.width = pct + "%";
      thumb.style.left = pct + "%";

      var valEl = doc.querySelector("#compVal");
      if (!valEl) return;
      if (pct <= 5) {
        valEl.textContent = defLabel;
        valEl.style.color = "#333";
      } else if (pct >= 90) {
        valEl.textContent = maxLabel;
        valEl.style.color = "#0a6";
        confirmBtn.style.display = "inline-block";
      } else if (pct >= 45) {
        valEl.textContent = "一倍";
        valEl.style.color = "#333";
      } else {
        valEl.textContent = defLabel;
        valEl.style.color = "#333";
      }
    }
    updateThumb(0);

    function getPct(e) {
      var r = track.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 100;
    }

    function onDown(e) {
      dragging = true;
      updateThumb(getPct(e));
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }
    function onMove(e) {
      if (!dragging) return;
      updateThumb(getPct(e));
    }
    function onUp() {
      dragging = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    thumb.addEventListener("pointerdown", onDown);
    track.addEventListener("pointerdown", onDown);

    var done = false;
    Input.on(confirmBtn, "click", function () {
      if (done) return;
      done = true;
      tip.textContent = "修改已保存。系统更新中……";
      setTimeout(function () { if (typeof onComplete === "function") onComplete(); }, 900);
    });
  }

  /* =========================================================
   * 小游戏二：赊账清除
   * ======================================================= */
  function clearDebt(container, config, onComplete) {
    config = config || {};
    var records = config.records || [];

    container.innerHTML = "";
    var root = div("mg-debt", container);

    var tip = div("mg-tip", root);
    tip.textContent = config.prompt || "找到自己的赊账记录，点击「清除」。";

    var terminal = div("debt-terminal", root);
    terminal.innerHTML =
      '<div class="debt-titlebar"><span>收银终端 · 赊账记录</span><span class="cc-dots">● ● ●</span></div>';

    var table = div("debt-table", terminal);
    var header = div("debt-header", table);
    header.innerHTML = "<span>姓名</span><span>金额</span><span></span>";

    var cleared = false;
    records.forEach(function (r) {
      var row = div("debt-row", table);
      if (r.own) row.classList.add("own-record");
      row.innerHTML = "<span>" + r.name + "</span><span>" + r.amount + "</span>";
      var btnSpan = document.createElement("span");
      var btn = document.createElement("button");
      btn.className = "debt-clear-btn";
      btn.textContent = r.own ? "清除" : "—";
      if (!r.own) btn.style.opacity = "0.3";
      btnSpan.appendChild(btn);
      row.appendChild(btnSpan);

      Input.on(btn, "click", function () {
        if (!r.own || cleared) return;
        cleared = true;
        btn.classList.add("cleared");
        btn.textContent = "已清";
        tip.textContent = "赊账已清除。";
        setTimeout(function () { if (typeof onComplete === "function") onComplete(); }, 800);
      });
    });
  }

  /* =========================================================
   * 小游戏三：警察枪击
   * ======================================================= */
  function shoot(container, config, onComplete) {
    config = config || {};

    container.innerHTML = "";
    var root = div("mg-shoot", container);

    var tip = div("mg-tip", root);
    tip.textContent = config.prompt || "瞄准巷道尽头的身影，扣下扳机。";
    tip.style.top = "50px";

    var scene = div("shoot-scene", root);
    var view = div("shoot-view", scene);
    var vignette = div("shoot-vignette-heavy", view);
    var alley = div("shoot-alley", view);

    var target = div("shoot-target", view);
    var targetX = 0.55, targetY = 0.62;
    target.style.left = (targetX * 100) + "%";
    target.style.top = (targetY * 100) + "%";

    var crosshair = div("shoot-crosshair", view);
    crosshair.style.left = "50%";
    crosshair.style.top = "50%";

    var flash = div("shoot-flash", view);

    var done = false;
    var mouseX = 0.5, mouseY = 0.5;

    function updateCrosshair(e) {
      var r = view.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width;
      mouseY = (e.clientY - r.top) / r.height;
      crosshair.style.left = (mouseX * 100) + "%";
      crosshair.style.top = (mouseY * 100) + "%";
    }

    var moveTimer = setInterval(function () {
      if (done) return;
      targetX += (Math.random() - 0.5) * 0.03;
      targetY += (Math.random() - 0.5) * 0.015;
      targetX = Math.max(0.3, Math.min(0.8, targetX));
      targetY = Math.max(0.55, Math.min(0.72, targetY));
      target.style.left = (targetX * 100) + "%";
      target.style.top = (targetY * 100) + "%";
    }, 800);

    view.addEventListener("pointermove", updateCrosshair);

    view.addEventListener("pointerdown", function fire() {
      if (done) return;
      done = true;
      clearInterval(moveTimer);

      flash.classList.add("fire");
      setTimeout(function () { flash.classList.remove("fire"); }, 80);

      var dx = mouseX - targetX;
      var dy = mouseY - targetY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var hit = dist < 0.08;

      if (hit) {
        target.style.background = "rgba(255,40,40,0.6)";
        target.style.borderColor = "rgba(255,100,100,0.8)";
        tip.textContent = (config.hitResult || "命中！") + " 信号中断……";
      } else {
        target.style.background = "rgba(200,200,100,0.2)";
        tip.textContent = "枪声回荡。信号中断……";
      }

      setTimeout(function () {
        view.style.filter = "brightness(0.3) blur(1px)";
        view.style.transition = "filter 0.5s ease";
        setTimeout(function () {
          if (typeof onComplete === "function") onComplete();
        }, 700);
      }, 350);
    });
  }

  return {
    adjustComp: adjustComp,
    clearDebt: clearDebt,
    shoot: shoot
  };
})();
