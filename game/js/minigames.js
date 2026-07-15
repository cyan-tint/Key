/* ============================================================================
 * 《密钥》· 交互小游戏（minigames.js）
 * ----------------------------------------------------------------------------
 * 序章两个小游戏，由 game.js 在 minigame 节点启动，完成后回调 onComplete：
 *   - codeRecycle(container, config, onComplete)
 *       框选带灰色标记的代码行 → 拖入右下角回收处理器 → 重复 2 轮后
 *       异常代码触发报错 → 回调（进入报错弹窗节点）
 *   - stamp(container, config, onComplete)
 *       拖拽印章对准文件按下盖章 → 盖完普通文件后，最后一份是自己的裁员报告
 *       → 回调（进入发现真相节点）
 * 依赖 Input（拖拽/命中）与 Renderer（提示条）。
 * ========================================================================== */

window.MiniGames = (function () {
  "use strict";

  function div(cls, parent) {
    const d = document.createElement("div");
    if (cls) d.className = cls;
    if (parent) parent.appendChild(d);
    return d;
  }

  /* =========================================================
   * 小游戏一：代码框选回收
   * ======================================================= */
  function codeRecycle(container, config, onComplete) {
    config = config || {};
    const lines = config.lines || [];
    const rounds = config.rounds || 3;
    const normalRecycles = Math.max(1, rounds - 1); // 前 N 轮正常，最后一轮为异常
    const anomalyText = config.anomalyLine || "/* anomaly_detected.sys — locked */";

    container.innerHTML = "";
    const root = div("mg-code", container);

    const tip = div("mg-tip", root);
    tip.textContent = config.prompt || "框选带灰色标记的代码行，拖入右下角回收处理器。";

    const screen = div("cc-screen", root);
    screen.innerHTML = '<div class="cc-titlebar"><span></span><span class="cc-dots">● ● ●</span></div>';
    const codeBody = div("cc-body", screen);

    const lineEls = [];
    lines.forEach(function (ln) {
      const row = div("cc-line" + (ln.marked ? " marked" : ""), codeBody);
      row.textContent = ln.t;
      lineEls.push(row);
    });

    const bin = div("cc-bin", root);
    bin.innerHTML = '<span class="cc-bin-ico">⏏</span><span class="cc-bin-txt">回收处理器</span>';

    const sel = div("cc-sel", screen);
    sel.style.display = "none";

    let recycled = 0;
    let anomalyInjected = false;
    let group = null;
    let groupCtrl = null;
    let selecting = false;
    let selStart = null;
    let done = false;

    function setTip(t) { tip.textContent = t; }

    /* ---- 橡皮筋框选 ---- */
    function onDown(e) {
      if (done || group) return;
      selecting = true;
      selStart = { x: e.clientX, y: e.clientY };
      const r = screen.getBoundingClientRect();
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
      const r = screen.getBoundingClientRect();
      const x1 = Math.min(selStart.x, e.clientX) - r.left;
      const y1 = Math.min(selStart.y, e.clientY) - r.top;
      const x2 = Math.max(selStart.x, e.clientX) - r.left;
      const y2 = Math.max(selStart.y, e.clientY) - r.top;
      sel.style.left = x1 + "px";
      sel.style.top = y1 + "px";
      sel.style.width = (x2 - x1) + "px";
      sel.style.height = (y2 - y1) + "px";

      const selRect = sel.getBoundingClientRect();
      lineEls.forEach(function (el) {
        if (el.dataset.recycled) return;
        const hit = Input.rectsIntersect(selRect, el.getBoundingClientRect());
        el.classList.toggle("selected", hit);
      });
    }

    function onUp() {
      if (!selecting) return;
      selecting = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      sel.style.display = "none";

      const picked = lineEls.filter(function (el) {
        return el.classList.contains("selected") && !el.dataset.recycled;
      });
      if (!picked.length) {
        lineEls.forEach(function (el) { el.classList.remove("selected"); });
        return;
      }
      const hasUnmarked = picked.some(function (el) { return !el.classList.contains("marked"); });
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
      const first = picked[0].getBoundingClientRect();
      const last = picked[picked.length - 1].getBoundingClientRect();
      const r = root.getBoundingClientRect();
      const top = Math.min(first.top, last.top) - r.top;
      const bottom = Math.max(first.bottom, last.bottom) - r.top;
      const left = first.left - r.left;

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
          if (!hit && groupCtrl) groupCtrl.reset(); // 未命中回收区则回弹
        },
        onHit: function () { recycle(picked); }
      });
    }

    /* ---- 回收 ---- */
    function recycle(picked) {
      const hitAnomaly = picked.some(function (el) { return el.classList.contains("anomaly"); });
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
        const row = div("cc-line marked anomaly", codeBody);
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
    const docs = config.documents || [];
    const required = config.stampsRequired || 3;

    container.innerHTML = "";
    const root = div("mg-stamp", container);

    const tip = div("mg-tip", root);
    tip.textContent = config.prompt || "拿起印章，对准文件，按下盖章。";

    const desk = div("stamp-desk", root);
    const docEl = div("stamp-doc", desk);
    const pile = div("stamp-pile", desk);
    const stampTool = div("stamp-tool", desk);
    stampTool.innerHTML = '<span class="stamp-face">章</span>';

    let idx = 0;
    let sealed = 0;
    let done = false;
    let isLastDoc = false;

    function renderDoc() {
      const d = docs[idx];
      docEl.classList.toggle("own", !!d.own);
      docEl.classList.remove("sealed");
      docEl.innerHTML =
        '<div class="stamp-doc-head">' + (d.own ? "机密文件" : "内部文件") + '</div>' +
        '<div class="stamp-doc-name">' + d.name + '</div>' +
        '<div class="stamp-doc-lines"><span></span><span></span><span></span><span></span></div>';
      pile.textContent = "剩余 " + (docs.length - 1 - idx) + " 份";

      // 如果是最后一份（自己的报告），注册印章点击即触发旁白
      if (d.own) {
        isLastDoc = true;
        function onStampTouch() {
          if (done) return;
          done = true;
          stampTool.removeEventListener("pointerdown", onStampTouch);
          setTip("印章悬在半空。那些字像是突然有了重量……");
          setTimeout(function () { if (typeof onComplete === "function") onComplete(); }, 600);
        }
        stampTool.addEventListener("pointerdown", onStampTouch, { once: true });
      } else {
        isLastDoc = false;
      }
    }
    renderDoc();

    function setTip(t) { tip.textContent = t; }

    const ctrl = new Input.DragController({
      handle: stampTool,
      target: stampTool,
      hitTargets: [docEl],
      onStart: function () { stampTool.classList.add("pressing"); },
      onHit: function () { doStamp(); }
    });

    // 每次盖章后让印章归位
    function resetStamp() {
      stampTool.classList.remove("pressing");
      ctrl.reset();
    }

    function doStamp() {
      if (done) return;
      const d = docs[idx];
      docEl.classList.add("sealed");
      resetStamp();
      sealed++;

      if (idx < docs.length - 1) {
        if (sealed >= required && idx === required - 1) {
          // 普通文件盖完，进入最后一份（玩家自己的报告）
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
        // 最后一份：自己的裁员报告
        done = true;
        setTip("印章悬在半空。那些字像是突然有了重量……");
        setTimeout(function () { if (typeof onComplete === "function") onComplete(); }, 1400);
      }
    }
  }

  /* =========================================================
   * 小游戏三：补偿金滑块调整
   * ======================================================= */
  function adjustComp(container, config, onComplete) {
    config = config || {};
    const empName = config.name || "林国强";
    const maxLabel = config.maxAmount || "两倍";
    const defLabel = config.defaultAmount || "最低";

    container.innerHTML = "";
    const root = div("mg-comp", container);

    const tip = div("mg-tip", root);
    tip.textContent = config.prompt || "拖动滑块，把补偿金额调整为两倍标准。";

    const desk = div("comp-desk", root);
    const doc = div("comp-doc", desk);
    doc.innerHTML =
      '<div class="comp-doc-head">遣散员工补偿金审批表</div>' +
      '<div class="comp-name">' + empName + '</div>' +
      '<div class="comp-row"><span class="comp-label">岗位：</span><span>仓库管理 · 5年</span></div>' +
      '<div class="comp-row"><span class="comp-label">补偿标准：</span><span class="comp-value" id="compVal">' + defLabel + '</span></div>';

    const wrap = div("comp-slider-wrap", root);
    const track = div("comp-slider-track", wrap);
    const fill = div("comp-slider-fill", track);
    const thumb = div("comp-slider-thumb", track);
    const labels = div("comp-slider-labels", wrap);
    labels.innerHTML = "<span>" + defLabel + "</span><span>一倍</span><span>" + maxLabel + "</span>";

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "comp-confirm";
    confirmBtn.textContent = "确认修改";
    confirmBtn.style.display = "none";
    wrap.appendChild(confirmBtn);

    let dragging = false;
    let valuePct = 0;

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
   * 小游戏四：赊账清除（收银终端）
   * ======================================================= */
  function clearDebt(container, config, onComplete) {
    config = config || {};
    const records = config.records || [];

    container.innerHTML = "";
    const root = div("mg-debt", container);

    const tip = div("mg-tip", root);
    tip.textContent = config.prompt || "找到自己的赊账记录，点击「清除」。";

    const terminal = div("debt-terminal", root);
    terminal.innerHTML =
      '<div class="debt-titlebar"><span>收银终端 · 赊账记录</span><span class="cc-dots">● ● ●</span></div>';

    const table = div("debt-table", terminal);
    const header = div("debt-header", table);
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
   * 小游戏五：警察枪击（第一人称瞄准）
   * ======================================================= */
  function shoot(container, config, onComplete) {
    config = config || {};

    container.innerHTML = "";
    const root = div("mg-shoot", container);

    const tip = div("mg-tip", root);
    tip.textContent = config.prompt || "瞄准巷道尽头的身影，扣下扳机。";
    tip.style.top = "50px";

    const scene = div("shoot-scene", root);
    const view = div("shoot-view", scene);
    const vignette = div("shoot-vignette-heavy", view);
    const alley = div("shoot-alley", view);

    // 目标（在巷道中移动）
    var target = div("shoot-target", view);
    var targetX = 0.55, targetY = 0.62; // 相对位置
    target.style.left = (targetX * 100) + "%";
    target.style.top = (targetY * 100) + "%";

    // 准星
    var crosshair = div("shoot-crosshair", view);
    crosshair.style.left = "50%";
    crosshair.style.top = "50%";

    // 枪火闪光
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

    // 目标缓慢移动
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

    // 点击开枪
    view.addEventListener("pointerdown", function fire() {
      if (done) return;
      done = true;
      clearInterval(moveTimer);

      // 枪火闪光
      flash.classList.add("fire");
      setTimeout(function () { flash.classList.remove("fire"); }, 80);

      // 检测命中
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

  /* =========================================================
   * 小游戏六：手术夹取碎片
   * ======================================================= */
  function surgery(container, config, onComplete) {
    config = config || {};
    var total = config.fragments || 3;

    container.innerHTML = "";
    var root = div("mg-surgery", container);

    var tip = div("mg-tip", root);
    tip.textContent = config.prompt || "点击伤口内的子弹碎片，夹取到托盘上。";

    // 手术台背景
    var table = div("surg-table", root);

    // 伤口特写区域
    var wound = div("surg-wound", table);
    wound.innerHTML =
      '<div class="surg-wound-inner">' +
        '<div class="surg-wound-skin"></div>' +
      '</div>';

    // 托盘
    var tray = div("surg-tray", root);
    tray.innerHTML = '<span class="surg-tray-label">托盘</span>';
    var trayCount = div("surg-tray-count", tray);
    trayCount.textContent = "0/" + total;
    tray.appendChild(trayCount);

    // 义肢手指示
    var handHint = div("surg-hand", wound);
    handHint.innerHTML = '<span class="surg-hand-icon">✋</span>';
    handHint.style.display = "none";

    var fragments = [];
    var collected = 0;
    var done = false;

    // 生成碎片位置（在伤口区域内随机分布）
    function spawnFragments() {
      var woundRect = wound.getBoundingClientRect();
      var cw = woundRect.width;
      var ch = woundRect.height;

      // 伤口中心区域的碎片位置
      var positions = [
        { x: 0.28, y: 0.35 },
        { x: 0.55, y: 0.48 },
        { x: 0.40, y: 0.62 }
      ];

      // 随机打乱
      for (var i = positions.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = positions[i];
        positions[i] = positions[j];
        positions[j] = tmp;
      }

      // 只取需要的数量
      for (var k = 0; k < total && k < positions.length; k++) {
        var frag = div("surg-fragment", wound);
        frag.style.left = (positions[k].x * 100) + "%";
        frag.style.top = (positions[k].y * 100) + "%";
        frag.style.animationDelay = (k * 0.3) + "s";
        fragments.push(frag);

        // 点击碎片 → 夹取
        (function (f) {
          Input.on(f, "pointerdown", function (e) {
            if (done || f.dataset.removed === "1") return;
            e.stopPropagation();
            collectFragment(f);
          });
        })(frag);
      }
    }

    function collectFragment(frag) {
      frag.dataset.removed = "1";
      // 义肢手移动到碎片位置
      var fx = frag.offsetLeft + frag.offsetWidth / 2;
      var fy = frag.offsetTop + frag.offsetHeight / 2;
      handHint.style.display = "block";
      handHint.style.left = fx + "px";
      handHint.style.top = fy + "px";
      handHint.style.transform = "translate(-50%, -50%) scale(1.8)";
      handHint.classList.add("pinching");

      // 碎片缩小消失
      frag.classList.add("removed");

      // 移动到托盘
      setTimeout(function () {
        var tr = tray.getBoundingClientRect();
        var wr = wound.getBoundingClientRect();
        handHint.style.left = (tr.left + tr.width / 2 - wr.left) + "px";
        handHint.style.top = (tr.top + tr.height / 2 - wr.top) + "px";
        handHint.style.transform = "translate(-50%, -50%) scale(1)";
        handHint.classList.remove("pinching");
      }, 400);

      // 落入托盘
      setTimeout(function () {
        handHint.style.display = "none";
        collected++;
        trayCount.textContent = collected + "/" + total;

        // 托盘闪光
        tray.classList.add("drop");
        setTimeout(function () { tray.classList.remove("drop"); }, 400);

        // 碎片出现在托盘中
        var fragCopy = document.createElement("span");
        fragCopy.className = "surg-frag-tray";
        fragCopy.textContent = "◆";
        tray.appendChild(fragCopy);

        if (collected >= total) {
          done = true;
          tip.textContent = "所有子弹碎片已取出。";
          Renderer.showToast("手术完成 · 碎片已全部取出", 2600);
          setAllFragmentsDim();
          setTimeout(function () {
            if (typeof onComplete === "function") onComplete();
          }, 1400);
        } else {
          tip.textContent = "已取出 " + collected + "/" + total + " 片。继续……";
        }
      }, 650);
    }

    function setAllFragmentsDim() {
      fragments.forEach(function (f) {
        if (f.dataset.removed !== "1") {
          f.classList.add("removed");
        }
      });
    }

    // 延迟生成，等布局完成
    setTimeout(spawnFragments, 100);
  }

  /* =========================================================
   * 小游戏七：死亡证明签字
   * ======================================================= */
  function signCertificate(container, config, onComplete) {
    config = config || {};
    var patientName = config.patientName || "无名氏";
    var causeOfDeath = config.causeOfDeath || "待填写";

    container.innerHTML = "";
    var root = div("mg-sign", container);

    var tip = div("mg-tip", root);
    tip.textContent = config.prompt || "在签名栏拖拽滑动，签署死亡证明。";

    // 终端屏幕
    var terminal = div("sign-terminal", root);
    terminal.innerHTML =
      '<div class="sign-titlebar"><span>医疗终端 · 死亡证明</span><span class="cc-dots">● ● ●</span></div>';

    var form = div("sign-form", terminal);

    // 表格内容
    form.innerHTML =
      '<div class="sign-field"><span class="sign-label">姓名：</span><span class="sign-value">' + patientName + '</span></div>' +
      '<div class="sign-field"><span class="sign-label">年龄：</span><span class="sign-value">42</span></div>' +
      '<div class="sign-field"><span class="sign-label">死因：</span><span class="sign-value sign-danger">' + causeOfDeath + '</span></div>' +
      '<div class="sign-divider"></div>' +
      '<div class="sign-field"><span class="sign-label">确认无误后请签字：</span></div>';

    // 签名区域
    var signArea = div("sign-canvas-wrap", form);
    var canvas = document.createElement("canvas");
    canvas.className = "sign-canvas";
    canvas.width = 340;
    canvas.height = 100;
    signArea.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    // 画背景提示线
    ctx.strokeStyle = "rgba(0,240,255,0.2)";
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(20, 50);
    ctx.lineTo(320, 50);
    ctx.stroke();
    ctx.setLineDash([]);

    var signHint = div("sign-hint", signArea);
    signHint.textContent = "← 在此处滑动签名 →";

    var isDrawing = false;
    var hasSigned = false;
    var points = [];

    function getPos(e) {
      var r = canvas.getBoundingClientRect();
      return {
        x: e.clientX - r.left,
        y: e.clientY - r.top
      };
    }

    function onDown(e) {
      if (hasSigned) return;
      e.preventDefault();
      isDrawing = true;
      signHint.style.opacity = "0";
      points = [];
      var p = getPos(e);
      points.push(p);
    }

    function onMove(e) {
      if (!isDrawing || hasSigned) return;
      e.preventDefault();
      var p = getPos(e);
      points.push(p);

      // 实时绘制
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 重画虚线
      ctx.strokeStyle = "rgba(0,240,255,0.1)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(20, 50);
      ctx.lineTo(320, 50);
      ctx.stroke();
      ctx.setLineDash([]);

      // 画签名线
      if (points.length > 1) {
        ctx.strokeStyle = "rgba(0,240,255,0.9)";
        ctx.shadowColor = "rgba(0,240,255,0.5)";
        ctx.shadowBlur = 8;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    function onUp() {
      if (!isDrawing) return;
      isDrawing = false;
      if (points.length > 10) {
        // 有足够的轨迹 → 视为已签名
        hasSigned = true;
        signHint.textContent = "签名完成";
        signHint.style.opacity = "0.8";
        signHint.style.color = "var(--ok)";

        // 延迟弹出确认框
        setTimeout(function () {
          Renderer.showPopup({
            title: "确认提交",
            message: "确认提交？此操作不可撤回。",
            confirmText: "确认提交"
          }, function () {
            tip.textContent = "已归档。";
            Renderer.showToast("死亡证明 · 已归档", 2200);
            setTimeout(function () {
              if (typeof onComplete === "function") onComplete();
            }, 1100);
          });
        }, 500);
      } else {
        // 轨迹太短，重置
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "rgba(0,240,255,0.2)";
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(20, 50);
        ctx.lineTo(320, 50);
        ctx.stroke();
        ctx.setLineDash([]);
        signHint.style.opacity = "1";
        signHint.textContent = "← 请滑动更长距离 →";
        setTimeout(function () {
          signHint.textContent = "← 在此处滑动签名 →";
        }, 1500);
      }
    }

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onUp);
  }

  /* =========================================================
   * 小游戏八：义肢修复（拖拽代码块到回收区）
   * ======================================================= */
  function repairImplant(container, config, onComplete) {
    config = config || {};
    var total = config.modules || 3;

    container.innerHTML = "";
    var root = div("mg-repair", container);

    var tip = div("mg-tip", root);
    tip.textContent = config.prompt || "拖拽闪烁的故障代码块到回收区。";

    // 代码终端背景
    var terminal = div("repair-terminal", root);
    terminal.innerHTML =
      '<div class="repair-titlebar"><span>义肢诊断终端 · AX-1072</span><span class="cc-dots">● ● ●</span></div>';

    var diag = div("repair-diag", terminal);
    diag.innerHTML =
      '<div class="repair-status">' +
        '<span class="repair-ok">✓ 电源模块</span>' +
        '<span class="repair-ok">✓ 通讯模块</span>' +
        '<span class="repair-ok">✓ 传感器阵列</span>' +
      '</div>' +
      '<div class="repair-issues-title">⚠ 检测到异常模块：</div>';

    // 闪烁的故障模块区域
    var modulesArea = div("repair-modules", diag);

    // 回收区
    var bin = div("repair-bin", root);
    bin.innerHTML = 
      '<span class="repair-bin-icon">🗑</span>' +
      '<span class="repair-bin-text">回收区</span>';

    var collected = 0;
    var done = false;
    var binCounter = document.createElement("span");
    binCounter.className = "repair-bin-counter";
    binCounter.textContent = "0/" + total;
    bin.appendChild(binCounter);

    // 故障模块数据
    var moduleDefs = [
      { name: "AX-NET-ERR", desc: "神经接口异常", delay: "0.8s" },
      { name: "AX-SIG-LAG", desc: "信号延迟溢出", delay: "1.2s" },
      { name: "AX-MOT-SYNC", desc: "运动同步故障", delay: "0.6s" }
    ];

    // 创建模块
    function createModule(def, idx) {
      var mod = div("repair-module", modulesArea);
      mod.innerHTML =
        '<span class="rm-name">' + def.name + '</span>' +
        '<span class="rm-desc">' + def.desc + '</span>' +
        '<span class="rm-severity">延迟 ' + def.delay + '</span>';
      mod.style.top = (30 + idx * 90) + "px";
      mod.style.left = "24px";
      mod.style.animationDelay = (idx * 0.25) + "s";

      // 拖拽
      var ctrl = new Input.DragController({
        handle: mod,
        target: mod,
        hitTargets: [bin],
        onStart: function () {
          mod.classList.add("dragging");
        },
        onMove: function (x, y, ev, state) {
          if (state.overTarget) {
            bin.classList.add("hover");
          } else {
            bin.classList.remove("hover");
          }
        },
        onDrop: function (x, y, ev, hit) {
          bin.classList.remove("hover");
          if (!hit) {
            ctrl.reset();
            mod.classList.remove("dragging");
            mod.classList.add("snap-back");
            setTimeout(function () { mod.classList.remove("snap-back"); }, 300);
          }
        },
        onHit: function () {
          bin.classList.remove("hover");
          recycleModule(mod, ctrl);
        }
      });
    }

    function recycleModule(mod, ctrl) {
      if (done || mod.dataset.recycled === "1") return;
      mod.dataset.recycled = "1";
      if (ctrl) ctrl.setEnabled(false);

      // 回收到回收区动画
      mod.classList.add("recycling");
      bin.classList.add("active");

      setTimeout(function () {
        mod.style.opacity = "0";
        mod.style.transform = "scale(0.3)";
        mod.style.transition = "all 0.3s ease";
        collected++;
        binCounter.textContent = collected + "/" + total;
        bin.classList.remove("active");

        if (collected >= total) {
          done = true;
          tip.textContent = "全部故障模块已回收。信号延迟修复中……";
          Renderer.showToast("连接问题已修复 · 信号延迟：0.1 秒 → 0.01 秒", 3200);

          // 完成反馈
          terminal.classList.add("repaired");
          setTimeout(function () {
            if (typeof onComplete === "function") onComplete();
          }, 1600);
        } else {
          tip.textContent = "已修复 " + collected + "/" + total + " 个模块。继续拖拽……";
        }
      }, 350);

      setTimeout(function () {
        if (mod.parentNode) mod.parentNode.removeChild(mod);
      }, 700);
    }

    for (var i = 0; i < total && i < moduleDefs.length; i++) {
      setTimeout((function (def, idx) {
        return function () { createModule(def, idx); };
      })(moduleDefs[i], i), 200 + i * 250);
    }
  }

  /* =========================================================
   * 小游戏九：保险箱精密操作（第三章）
   * ======================================================= */
  function safeCrack(container, config, onComplete) {
    config = config || {};
    var layers = config.layers || 3;

    container.innerHTML = "";
    var root = div("mg-safe", container);

    var tip = div("mg-tip", root);
    tip.textContent = config.prompt || "将手指移动到指定坐标点并保持稳定，缓慢拖拽滑块到目标位置。";

    // 保险箱背景
    var safeBody = div("safe-body", root);
    safeBody.innerHTML =
      '<div class="safe-door">' +
        '<div class="safe-dial-outer">' +
          '<div class="safe-dial-inner"></div>' +
        '</div>' +
        '<div class="safe-handle"></div>' +
      '</div>';

    var info = div("safe-info", root);
    var progressText = document.createElement("span");
    progressText.className = "safe-progress";
    progressText.textContent = "0 / " + layers;
    info.appendChild(progressText);

    var currentLayer = 0;
    var done = false;
    var isDragging = false;
    var sliderVal = 0;
    var targetVal = 0;
    var stability = 0;
    var stabilityCheckTimer = null;

    // 滑条区域
    var sliderWrap = div("safe-slider-wrap", root);
    var sliderTrack = div("safe-slider-track", sliderWrap);
    var sliderFill = div("safe-slider-fill", sliderTrack);
    var sliderThumb = div("safe-slider-thumb", sliderTrack);
    var targetMarker = div("safe-target", sliderTrack);

    function initLayer() {
      targetVal = 0.5 + (Math.random() - 0.5) * 0.8;
      targetVal = Math.max(0.15, Math.min(0.85, targetVal));
      targetMarker.style.left = (targetVal * 100) + "%";
      sliderVal = 0;
      sliderFill.style.width = "0%";
      sliderThumb.style.left = "0%";
      stability = 0;
      tip.textContent = "第 " + (currentLayer + 1) + " 层：将滑块移动到目标标记处并保持稳定。";
      if (stabilityCheckTimer) clearInterval(stabilityCheckTimer);
    }

    function updateSlider(pct) {
      pct = Math.max(0, Math.min(100, pct));
      sliderVal = pct / 100;
      sliderFill.style.width = pct + "%";
      sliderThumb.style.left = pct + "%";
    }

    function getPct(e) {
      var r = sliderTrack.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 100;
    }

    function onDown(e) {
      if (done) return;
      isDragging = true;
      updateSlider(getPct(e));
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }

    function onMove(e) {
      if (!isDragging || done) return;
      updateSlider(getPct(e));
      var dist = Math.abs(sliderVal - targetVal);

      // 检测稳定性
      if (dist < 0.04) {
        stability++;
        sliderThumb.style.boxShadow = "0 0 24px rgba(57, 255, 20, 0.8)";
        sliderThumb.style.borderColor = "var(--ok)";
        tip.textContent = "保持稳定……" + Math.floor(stability / 3 * 100) + "%";
        if (stability >= 15) {
          unlockLayer();
        }
      } else {
        stability = Math.max(0, stability - 1);
        sliderThumb.style.boxShadow = "0 0 14px rgba(0, 240, 255, 0.5)";
        sliderThumb.style.borderColor = "var(--neon-cyan)";
        tip.textContent = "第 " + (currentLayer + 1) + " 层：将滑块移动到目标标记处并保持稳定。";
      }
    }

    function onUp() {
      if (!isDragging) return;
      isDragging = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    function unlockLayer() {
      currentLayer++;
      progressText.textContent = currentLayer + " / " + layers;
      tip.textContent = "第 " + currentLayer + " 层解锁！";

      // 表盘旋转动画
      safeBody.classList.add("dial-rotate");
      setTimeout(function () { safeBody.classList.remove("dial-rotate"); }, 800);

      if (currentLayer >= layers) {
        done = true;
        safeBody.classList.add("unlocked");
        tip.textContent = "保险箱已打开。芯片取出中……";
        Renderer.showToast("已取出。任务完成。", 2600);
        setTimeout(function () {
          if (typeof onComplete === "function") onComplete();
        }, 1500);
      } else {
        setTimeout(initLayer, 600);
      }
    }

    sliderThumb.addEventListener("pointerdown", onDown);
    sliderTrack.addEventListener("pointerdown", onDown);
    initLayer();
  }

  /* =========================================================
   * 小游戏十：多重联动（第五章 · 放手一搏）
   * ======================================================= */
  function multiTap(container, config, onComplete) {
    config = config || {};
    var totalTargets = config.targets || 4;
    var timeLimit = config.timeLimit || 8000;

    container.innerHTML = "";
    var root = div("mg-multitap", container);

    var tip = div("mg-tip", root);
    tip.textContent = config.prompt || "在限定时间内快速点击所有目标点。";

    // 倒计时
    var timerBar = div("mt-timer-bar", root);
    var timerFill = div("mt-timer-fill", timerBar);
    var timerText = div("mt-timer-text", timerBar);
    timerText.textContent = (timeLimit / 1000).toFixed(1) + "s";

    var playArea = div("mt-area", root);
    var targets = [];
    var hitCount = 0;
    var done = false;
    var startTime = 0;
    var timerInterval = null;

    // 生成目标点（屏幕放大的脉冲圈）
    function spawnTargets() {
      var areaRect = playArea.getBoundingClientRect();
      for (var i = 0; i < totalTargets; i++) {
        var t = div("mt-target", playArea);
        t.style.left = (15 + Math.random() * 65) + "%";
        t.style.top = (20 + Math.random() * 55) + "%";
        t.style.animationDelay = (i * 0.3) + "s";
        t.dataset.index = i;
        targets.push(t);

        Input.on(t, "pointerdown", function (e) {
          if (done) return;
          var el = e.currentTarget;
          if (el.dataset.hit === "1") return;
          el.dataset.hit = "1";
          el.classList.add("popped");
          hitCount++;
          Renderer.showToast("联动 " + hitCount + "/" + totalTargets, 800);
          if (hitCount >= totalTargets) {
            complete(true);
          }
        });
      }
    }

    function complete(success) {
      if (done) return;
      done = true;
      if (timerInterval) clearInterval(timerInterval);

      if (success) {
        tip.textContent = "信号已覆盖所有目标。多重联动发起！";
        playArea.style.borderColor = "var(--neon-cyan)";
        playArea.style.boxShadow = "0 0 60px rgba(0, 240, 255, 0.5)";
        setTimeout(function () {
          if (typeof onComplete === "function") onComplete();
        }, 1000);
      } else {
        tip.textContent = "时间耗尽。但已经来不及回头了……";
        playArea.style.borderColor = "var(--danger)";
        playArea.style.boxShadow = "0 0 60px rgba(255, 59, 92, 0.5)";
        setTimeout(function () {
          if (typeof onComplete === "function") onComplete();
        }, 800);
      }
    }

    function startTimer() {
      startTime = performance.now();
      timerInterval = setInterval(function () {
        var elapsed = performance.now() - startTime;
        var remaining = timeLimit - elapsed;
        var pct = Math.max(0, remaining / timeLimit * 100);
        timerFill.style.width = pct + "%";
        timerText.textContent = Math.max(0, remaining / 1000).toFixed(1) + "s";
        if (remaining <= 0) {
          complete(false);
        }
      }, 100);
    }

    spawnTargets();
    setTimeout(startTimer, 500);
  }

  return {
    codeRecycle: codeRecycle,
    stamp: stamp,
    adjustComp: adjustComp,
    clearDebt: clearDebt,
    shoot: shoot,
    surgery: surgery,
    signCertificate: signCertificate,
    repairImplant: repairImplant,
    safeCrack: safeCrack,
    multiTap: multiTap
  };
})();
