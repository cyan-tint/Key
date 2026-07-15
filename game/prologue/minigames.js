/* ============================================================================
 * 《密钥》· 序章 · 小游戏
 *   - codeRecycle: 代码框选回收
 *   - stamp: 盖章
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
   * 小游戏一：代码框选回收
   * ======================================================= */
  function codeRecycle(container, config, onComplete) {
    config = config || {};
    var lines = config.lines || [];
    var rounds = config.rounds || 3;
    var normalRecycles = Math.max(1, rounds - 1);
    var anomalyText = config.anomalyLine || "/* anomaly_detected.sys — locked */";

    container.innerHTML = "";
    var root = div("mg-code", container);

    var tip = div("mg-tip", root);
    tip.textContent = config.prompt || "框选带灰色标记的代码行，拖入右下角回收处理器。";

    var screen = div("cc-screen", root);
    screen.innerHTML = '<div class="cc-titlebar"><span></span><span class="cc-dots">● ● ●</span></div>';
    var codeBody = div("cc-body", screen);

    var lineEls = [];
    lines.forEach(function (ln) {
      var row = div("cc-line" + (ln.marked ? " marked" : ""), codeBody);
      row.textContent = ln.t;
      lineEls.push(row);
    });

    var bin = div("cc-bin", root);
    bin.innerHTML = '<span class="cc-bin-ico">⏏</span><span class="cc-bin-txt">回收处理器</span>';

    var sel = div("cc-sel", screen);
    sel.style.display = "none";

    var recycled = 0;
    var anomalyInjected = false;
    var group = null;
    var groupCtrl = null;
    var selecting = false;
    var selStart = null;
    var done = false;

    function setTip(t) { tip.textContent = t; }

    /* ---- 橡皮筋框选 ---- */
    function onDown(e) {
      if (done || group) return;
      selecting = true;
      selStart = { x: e.clientX, y: e.clientY };
      var r = screen.getBoundingClientRect();
      sel.style.left = (e.clientX - r.left) + "px";
      sel.style.top = (e.clientY - r.top) + "px";
      sel.style.width = "0px";
      sel.style.height = "0px";
      sel.style.display = "block";
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }

    function onMove(e) {
      if (!selecting) return;
      var r = screen.getBoundingClientRect();
      var x1 = Math.min(selStart.x, e.clientX) - r.left;
      var y1 = Math.min(selStart.y, e.clientY) - r.top;
      var x2 = Math.max(selStart.x, e.clientX) - r.left;
      var y2 = Math.max(selStart.y, e.clientY) - r.top;
      sel.style.left = x1 + "px";
      sel.style.top = y1 + "px";
      sel.style.width = (x2 - x1) + "px";
      sel.style.height = (y2 - y1) + "px";

      var selRect = sel.getBoundingClientRect();
      lineEls.forEach(function (el) {
        if (el.dataset.recycled) return;
        var hit = Input.rectsIntersect(selRect, el.getBoundingClientRect());
        el.classList.toggle("selected", hit);
      });
    }

    function onUp() {
      if (!selecting) return;
      selecting = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      sel.style.display = "none";

      var picked = lineEls.filter(function (el) {
        return el.classList.contains("selected") && !el.dataset.recycled;
      });
      if (!picked.length) {
        lineEls.forEach(function (el) { el.classList.remove("selected"); });
        return;
      }
      var hasUnmarked = picked.some(function (el) { return !el.classList.contains("marked"); });
      if (hasUnmarked) {
        setTip("只能回收带灰色标记的行。");
        picked.forEach(function (el) { el.classList.remove("selected"); });
        return;
      }
      makeGroup(picked);
    }

    Input.on(screen, "pointerdown", onDown);

    /* ---- 生成可拖拽的选中组 ---- */
    function makeGroup(picked) {
      var first = picked[0].getBoundingClientRect();
      var last = picked[picked.length - 1].getBoundingClientRect();
      var r = root.getBoundingClientRect();
      var top = Math.min(first.top, last.top) - r.top;
      var bottom = Math.max(first.bottom, last.bottom) - r.top;
      var left = first.left - r.left;

      group = div("cc-group", root);
      group.style.top = top + "px";
      group.style.left = left + "px";
      group.style.width = (first.width || 300) + "px";
      group.style.height = (bottom - top) + "px";
      group.textContent = "已选 " + picked.length + " 行 · 拖入回收";

      groupCtrl = new Input.DragController({
        handle: group,
        target: group,
        hitTargets: [bin],
        onDrop: function (x, y, ev, hit) {
          if (!hit && groupCtrl) groupCtrl.reset();
        },
        onHit: function () { recycle(picked); }
      });
    }

    /* ---- 回收 ---- */
    function recycle(picked) {
      var hitAnomaly = picked.some(function (el) { return el.classList.contains("anomaly"); });
      picked.forEach(function (el) {
        el.dataset.recycled = "1";
        el.classList.remove("selected");
        el.classList.add("recycled");
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 360);
      });
      if (groupCtrl) { groupCtrl.destroy(); groupCtrl = null; }
      if (group && group.parentNode) group.parentNode.removeChild(group);
      group = null;

      if (hitAnomaly) {
        done = true;
        setTip("无法移动此文件。该文件正在被其他进程使用。");
        Renderer.showToast("anomaly_detected.sys — locked", 2600);
        setTimeout(function () { if (typeof onComplete === "function") onComplete(); }, 1100);
        return;
      }

      recycled++;
      if (recycled < normalRecycles) {
        setTip("已回收。继续处理剩余垃圾代码……（" + recycled + "/" + normalRecycles + "）");
      } else if (!anomalyInjected) {
        anomalyInjected = true;
        var row = div("cc-line marked anomaly", codeBody);
        row.textContent = anomalyText;
        lineEls.push(row);
        setTip("又一段代码看起来没什么不同……拖拽它试试。");
      }
    }
  }

  /* =========================================================
   * 小游戏二：盖章
   * ======================================================= */
  function stamp(container, config, onComplete) {
    config = config || {};
    var docs = config.documents || [];
    var required = config.stampsRequired || 3;

    container.innerHTML = "";
    var root = div("mg-stamp", container);

    var tip = div("mg-tip", root);
    tip.textContent = config.prompt || "拿起印章，对准文件，按下盖章。";

    var desk = div("stamp-desk", root);
    var docEl = div("stamp-doc", desk);
    var pile = div("stamp-pile", desk);
    var stampTool = div("stamp-tool", desk);
    stampTool.innerHTML = '<span class="stamp-face">章</span>';

    var idx = 0;
    var sealed = 0;
    var done = false;

    function renderDoc() {
      var d = docs[idx];
      docEl.classList.toggle("own", !!d.own);
      docEl.classList.remove("sealed");
      docEl.innerHTML =
        '<div class="stamp-doc-head">' + (d.own ? "机密文件" : "内部文件") + '</div>' +
        '<div class="stamp-doc-name">' + d.name + '</div>' +
        '<div class="stamp-doc-lines"><span></span><span></span><span></span><span></span></div>';
      pile.textContent = "剩余 " + (docs.length - 1 - idx) + " 份";

      if (d.own) {
        function onStampTouch() {
          if (done) return;
          done = true;
          stampTool.removeEventListener("pointerdown", onStampTouch);
          setTip("印章悬在半空。那些字像是突然有了重量……");
          setTimeout(function () { if (typeof onComplete === "function") onComplete(); }, 600);
        }
        stampTool.addEventListener("pointerdown", onStampTouch, { once: true });
      }
    }
    renderDoc();

    function setTip(t) { tip.textContent = t; }

    var ctrl = new Input.DragController({
      handle: stampTool,
      target: stampTool,
      hitTargets: [docEl],
      onStart: function () { stampTool.classList.add("pressing"); },
      onHit: function () { doStamp(); }
    });

    function resetStamp() {
      stampTool.classList.remove("pressing");
      ctrl.reset();
    }

    function doStamp() {
      if (done) return;
      docEl.classList.add("sealed");
      resetStamp();
      sealed++;

      if (idx < docs.length - 1) {
        if (sealed >= required && idx === required - 1) {
          setTimeout(function () {
            idx++;
            renderDoc();
            setTip("下一份文件摊开了。你拿起印章，正要落下……");
          }, 650);
        } else {
          setTimeout(function () {
            idx++;
            renderDoc();
          }, 650);
        }
      } else {
        done = true;
        setTip("印章悬在半空。那些字像是突然有了重量……");
        setTimeout(function () { if (typeof onComplete === "function") onComplete(); }, 1400);
      }
    }
  }

  return {
    codeRecycle: codeRecycle,
    stamp: stamp
  };
})();
