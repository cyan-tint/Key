/* ============================================================================
 * 《密钥》· 第二章 · 小游戏
 *   - surgery: 手术夹取碎片
 *   - signCertificate: 死亡证明签字
 *   - repairImplant: 义肢修复
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
   * 小游戏一：手术夹取碎片
   * ======================================================= */
  function surgery(container, config, onComplete) {
    config = config || {};
    var total = config.fragments || 3;

    container.innerHTML = "";
    var root = div("mg-surgery", container);

    var tip = div("mg-tip", root);
    tip.textContent = config.prompt || "点击伤口内的子弹碎片，夹取到托盘上。";

    var table = div("surg-table", root);

    var wound = div("surg-wound", table);
    wound.innerHTML =
      '<div class="surg-wound-inner">' +
        '<div class="surg-wound-skin"></div>' +
      '</div>';

    var tray = div("surg-tray", root);
    tray.innerHTML = '<span class="surg-tray-label">托盘</span>';
    var trayCount = div("surg-tray-count", tray);
    trayCount.textContent = "0/" + total;
    tray.appendChild(trayCount);

    var handHint = div("surg-hand", wound);
    handHint.innerHTML = '<span class="surg-hand-icon">✋</span>';
    handHint.style.display = "none";

    var fragments = [];
    var collected = 0;
    var done = false;

    function spawnFragments() {
      var positions = [
        { x: 0.28, y: 0.35 },
        { x: 0.55, y: 0.48 },
        { x: 0.40, y: 0.62 }
      ];

      for (var i = positions.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = positions[i];
        positions[i] = positions[j];
        positions[j] = tmp;
      }

      for (var k = 0; k < total && k < positions.length; k++) {
        var frag = div("surg-fragment", wound);
        frag.style.left = (positions[k].x * 100) + "%";
        frag.style.top = (positions[k].y * 100) + "%";
        frag.style.animationDelay = (k * 0.3) + "s";
        fragments.push(frag);

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
      var fx = frag.offsetLeft + frag.offsetWidth / 2;
      var fy = frag.offsetTop + frag.offsetHeight / 2;
      handHint.style.display = "block";
      handHint.style.left = fx + "px";
      handHint.style.top = fy + "px";
      handHint.style.transform = "translate(-50%, -50%) scale(1.8)";
      handHint.classList.add("pinching");

      frag.classList.add("removed");

      setTimeout(function () {
        var tr = tray.getBoundingClientRect();
        var wr = wound.getBoundingClientRect();
        handHint.style.left = (tr.left + tr.width / 2 - wr.left) + "px";
        handHint.style.top = (tr.top + tr.height / 2 - wr.top) + "px";
        handHint.style.transform = "translate(-50%, -50%) scale(1)";
        handHint.classList.remove("pinching");
      }, 400);

      setTimeout(function () {
        handHint.style.display = "none";
        collected++;
        trayCount.textContent = collected + "/" + total;

        tray.classList.add("drop");
        setTimeout(function () { tray.classList.remove("drop"); }, 400);

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
        if (f.dataset.removed !== "1") { f.classList.add("removed"); }
      });
    }

    setTimeout(spawnFragments, 100);
  }

  /* =========================================================
   * 小游戏二：死亡证明签字
   * ======================================================= */
  function signCertificate(container, config, onComplete) {
    config = config || {};
    var patientName = config.patientName || "无名氏";
    var causeOfDeath = config.causeOfDeath || "待填写";

    container.innerHTML = "";
    var root = div("mg-sign", container);

    var tip = div("mg-tip", root);
    tip.textContent = config.prompt || "在签名栏拖拽滑动，签署死亡证明。";

    var terminal = div("sign-terminal", root);
    terminal.innerHTML =
      '<div class="sign-titlebar"><span>医疗终端 · 死亡证明</span><span class="cc-dots">● ● ●</span></div>';

    var form = div("sign-form", terminal);
    form.innerHTML =
      '<div class="sign-field"><span class="sign-label">姓名：</span><span class="sign-value">' + patientName + '</span></div>' +
      '<div class="sign-field"><span class="sign-label">年龄：</span><span class="sign-value">42</span></div>' +
      '<div class="sign-field"><span class="sign-label">死因：</span><span class="sign-value sign-danger">' + causeOfDeath + '</span></div>' +
      '<div class="sign-divider"></div>' +
      '<div class="sign-field"><span class="sign-label">确认无误后请签字：</span></div>';

    var signArea = div("sign-canvas-wrap", form);
    var canvas = document.createElement("canvas");
    canvas.className = "sign-canvas";
    canvas.width = 340;
    canvas.height = 100;
    signArea.appendChild(canvas);

    var ctx = canvas.getContext("2d");
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
      return { x: e.clientX - r.left, y: e.clientY - r.top };
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

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(0,240,255,0.1)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(20, 50);
      ctx.lineTo(320, 50);
      ctx.stroke();
      ctx.setLineDash([]);

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
        hasSigned = true;
        signHint.textContent = "签名完成";
        signHint.style.opacity = "0.8";
        signHint.style.color = "var(--ok)";

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
   * 小游戏三：义肢修复（拖拽代码块到回收区）
   * ======================================================= */
  function repairImplant(container, config, onComplete) {
    config = config || {};
    var total = config.modules || 3;

    container.innerHTML = "";
    var root = div("mg-repair", container);

    var tip = div("mg-tip", root);
    tip.textContent = config.prompt || "拖拽闪烁的故障代码块到回收区。";

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

    var modulesArea = div("repair-modules", diag);

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

    var moduleDefs = [
      { name: "AX-NET-ERR", desc: "神经接口异常", delay: "0.8s" },
      { name: "AX-SIG-LAG", desc: "信号延迟溢出", delay: "1.2s" },
      { name: "AX-MOT-SYNC", desc: "运动同步故障", delay: "0.6s" }
    ];

    function createModule(def, idx) {
      var mod = div("repair-module", modulesArea);
      mod.innerHTML =
        '<span class="rm-name">' + def.name + '</span>' +
        '<span class="rm-desc">' + def.desc + '</span>' +
        '<span class="rm-severity">延迟 ' + def.delay + '</span>';
      mod.style.top = (30 + idx * 90) + "px";
      mod.style.left = "24px";
      mod.style.animationDelay = (idx * 0.25) + "s";

      var ctrl = new Input.DragController({
        handle: mod,
        target: mod,
        hitTargets: [bin],
        onStart: function () { mod.classList.add("dragging"); },
        onMove: function (x, y, ev, state) {
          if (state.overTarget) { bin.classList.add("hover"); }
          else { bin.classList.remove("hover"); }
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

  return {
    surgery: surgery,
    signCertificate: signCertificate,
    repairImplant: repairImplant
  };
})();
