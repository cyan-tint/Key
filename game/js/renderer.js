/* ============================================================================
 * 《密钥》· 渲染器（renderer.js）
 * ----------------------------------------------------------------------------
 * 负责所有 DOM 表现层逻辑，被 game.js 与 minigames.js 调用：
 *   - 场景氛围 / 背景图（预留 .scene-bg / --scene-image 接口）
 *   - 淡入淡出（opacity 遮罩）
 *   - 打字机（rAF 驱动，点击快进 / 跳过）
 *   - 选项按钮（对话框上方）
 *   - 中心报错弹窗（阻塞式）
 *   - 系统提示条（顶部）
 *   - 小游戏覆盖层显隐
 * ========================================================================== */

window.Renderer = (function () {
  "use strict";

  const $ = function (id) { return document.getElementById(id); };
  const el = {
    scene: $("scene"),
    sceneBg: document.querySelector(".scene-bg"),
    minigame: $("minigame-layer"),
    toast: $("sys-toast"),
    choices: $("choices"),
    dialog: $("dialog"),
    dialogPortrait: $("dialog-portrait"),
    speaker: $("dialog-speaker"),
    text: $("dialog-text"),
    cursor: $("dialog-cursor"),
    hint: $("dialog-hint"),
    popupOverlay: $("popup-overlay"),
    popupTitle: $("popup-title"),
    popupMsg: $("popup-message"),
    popupActions: $("popup-actions"),
    fade: $("fade-overlay"),
    shock: $("shock-overlay"),
    chapterOverlay: $("chapter-overlay"),
    chapterNum: $("chapter-num"),
    chapterNameEl: $("chapter-name"),
    chapterSubname: $("chapter-subname"),
    startOverlay: $("start-overlay"),
    startBtn: $("start-btn"),
    stage: $("stage"),
    prostheticHUD: $("prosthetic-hud"),
    hudRadarLabel: $("hud-radar-label"),
    hudRadarDot: $("hud-radar-dot"),
    hudRadarDotLabel: $("hud-radar-dot-label"),
    hudDeviceName: $("hud-device-name"),
    hudDeviceModel: $("hud-device-model"),
    hudSigBars: $("hud-sig-bars"),
    hudSigPct: $("hud-sig-pct"),
    hudDeviceRange: $("hud-device-range"),
    hudDeviceStatus: $("hud-device-status"),
    hudSig: $("hud-sig"),
    hudClock: $("hud-clock"),
    hudLog: $("hud-log"),
    hudBottombarText: $("hud-bottombar-text"),
    hudBottombarHint: $("hud-bottombar-hint"),
    hudActions: $("hud-actions")
  };

  /* ---------- 打字机状态 ---------- */
  let typing = false;
  let rafId = null;
  let fullText = "";
  let onTypeDone = null;
  let dialogClickHandler = null;

  /* ---------- 场景氛围 / 背景 ---------- */
  function setMood(mood) {
    el.scene.setAttribute("data-mood", mood || "dark");
  }

  // 预留接口：传入图片 URL 即覆盖 CSS 渲染（assets/images）
  function setBackgroundImage(url) {
    if (!url) return;
    el.sceneBg.style.backgroundImage = 'url("' + url + '")';
    el.sceneBg.style.backgroundSize = "cover";
    el.sceneBg.style.backgroundPosition = "center";
    el.sceneBg.style.backgroundRepeat = "no-repeat";
    el.sceneBg.classList.add("has-image");
  }
  function resetBackgroundImage() {
    el.sceneBg.style.backgroundImage = "";
    el.sceneBg.style.backgroundSize = "";
    el.sceneBg.style.backgroundPosition = "";
    el.sceneBg.style.backgroundRepeat = "";
    el.sceneBg.classList.remove("has-image");
  }

  /* ---------- 淡入淡出 ---------- */
  function fadeOut(cb) {
    el.fade.classList.add("active");
    setTimeout(function () { if (cb) cb(); }, 900);
  }
  function fadeIn(cb) {
    el.fade.classList.remove("active");
    setTimeout(function () { if (cb) cb(); }, 900);
  }

  /* ---------- 对话框 ---------- */
  function showDialog() {
    el.dialog.classList.add("show");
  }
  function hideDialog() {
    el.dialog.classList.remove("show");
  }
  function setSpeaker(name) {
    el.speaker.textContent = name || "";
    el.speaker.style.display = name ? "block" : "none";
    // 『我/你』使用仿宋字体
    if (name === "你" || name === "我") {
      el.dialog.classList.add("me-mode");
    } else {
      el.dialog.classList.remove("me-mode");
    }
    // 主角立绘：仅当 speaker 为"你"时显示
    if (name === "你") {
      el.dialog.classList.add("has-portrait");
    } else {
      el.dialog.classList.remove("has-portrait");
    }
  }

  // 打字机：逐字显示；点击对话框可快进/跳过
  function typeText(text, onDone) {
    fullText = text || "";
    onTypeDone = onDone || null;
    el.text.textContent = "";
    el.cursor.classList.remove("hidden");
    el.hint.classList.remove("show");
    typing = true;

    let i = 0;
    let last = performance.now();
    const speed = 24; // 每字约 24ms

    function step(now) {
      if (!typing) return;
      const dt = now - last;
      if (dt >= speed) {
        const advance = Math.max(1, Math.floor(dt / speed));
        i = Math.min(fullText.length, i + advance);
        el.text.textContent = fullText.slice(0, i);
        last = now;
      }
      if (i >= fullText.length) {
        finishTyping();
        return;
      }
      rafId = requestAnimationFrame(step);
    }
    rafId = requestAnimationFrame(step);
  }

  function finishTyping() {
    if (!typing && el.text.textContent === fullText) {
      // 已结束，避免重复回调
      return;
    }
    typing = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    el.text.textContent = fullText;
    el.cursor.classList.add("hidden");
    el.hint.classList.add("show");
    const cb = onTypeDone;
    onTypeDone = null;
    if (cb) cb();
  }

  function isTyping() { return typing; }

  // 点击对话框：打字中则快进；否则交给 game 处理（推进节点）
  Input.on(el.dialog, "click", function () {
    if (typing) {
      finishTyping();
      return;
    }
    if (dialogClickHandler) dialogClickHandler();
  });

  function onDialogClick(fn) { dialogClickHandler = fn; }

  /* ---------- 选项按钮 ---------- */
  function showChoices(choices, onPick) {
    el.choices.innerHTML = "";
    if (!choices || !choices.length) {
      el.choices.classList.remove("show");
      return;
    }
    var locked = false;
    var buttons = [];
    choices.forEach(function (c, idx) {
      var btn = document.createElement("button");
      btn.className = "choice-btn";
      // 支持新格式（label + description）和旧格式（text）
      if (c.label) {
        btn.innerHTML =
          '<span class="choice-label">' + c.label + '</span>' +
          (c.description ? '<span class="choice-desc">' + c.description + '</span>' : '');
      } else {
        btn.textContent = c.text || "";
      }
      btn.style.animationDelay = (idx * 90) + "ms";
      Input.on(btn, "click", function () {
        if (locked) return;
        locked = true;
        // 当前按钮高亮，所有按钮变灰
        btn.classList.add("picked");
        buttons.forEach(function (b) { b.classList.add("locked"); });
        if (typeof onPick === "function") onPick(c, idx);
      });
      buttons.push(btn);
      el.choices.appendChild(btn);
    });
    el.choices.classList.add("show");
  }
  function hideChoices() {
    el.choices.classList.remove("show");
    el.choices.innerHTML = "";
  }

  /* ---------- 系统提示条 ---------- */
  function showToast(text, duration) {
    if (!text) return;
    el.toast.textContent = text;
    el.toast.classList.add("show");
    if (el.toast._timer) clearTimeout(el.toast._timer);
    el.toast._timer = setTimeout(function () {
      el.toast.classList.remove("show");
    }, duration || 3200);
  }
  function hideToast() {
    el.toast.classList.remove("show");
  }

  /* ---------- 进度加载提示（0% → target%） ---------- */
  function showProgressToast(template, targetPct, duration) {
    if (!template) return;
    targetPct = targetPct || 42;
    const dur = duration || 1500;
    const start = performance.now();
    el.toast.classList.add("show");
    function tick(now) {
      const elapsed = now - start;
      const pct = Math.min(targetPct, Math.round((elapsed / dur) * targetPct));
      el.toast.textContent = template.replace("{pct}", pct + "%");
      if (pct < targetPct) {
        requestAnimationFrame(tick);
      } else {
        // 完成后保持显示
        if (el.toast._timer) clearTimeout(el.toast._timer);
        el.toast._timer = setTimeout(function () {
          el.toast.classList.remove("show");
        }, 1800);
      }
    }
    requestAnimationFrame(tick);
  }

  /* ---------- 中心报错 / 确认弹窗（阻塞式） ---------- */
  function showPopup(opts, onConfirm) {
    opts = opts || {};
    el.popupTitle.textContent = opts.title || "系统提示";
    // 支持 \n 换行
    el.popupMsg.innerHTML = (opts.message || "").replace(/\n/g, "<br>");
    el.popupActions.innerHTML = "";

    const confirmText = opts.confirmText || "确定";
    const btn = document.createElement("button");
    btn.className = "popup-btn";
    btn.textContent = confirmText;
    Input.on(btn, "click", function () {
      hidePopup();
      if (typeof onConfirm === "function") onConfirm();
    });
    el.popupActions.appendChild(btn);

    el.popupOverlay.classList.add("show");
  }
  function hidePopup() {
    el.popupOverlay.classList.remove("show");
  }

  /* ---------- 小游戏覆盖层 ---------- */
  function showMinigameLayer() {
    el.minigame.classList.add("active");
    el.minigame.setAttribute("aria-hidden", "false");
  }
  function hideMinigameLayer() {
    el.minigame.classList.remove("active");
    el.minigame.setAttribute("aria-hidden", "true");
  }
  function clearMinigameLayer() {
    el.minigame.innerHTML = "";
  }

  /* ---------- 开始遮罩 ---------- */
  function onStart(fn) {
    Input.on(el.startBtn, "click", function () {
      el.startOverlay.classList.add("hide");
      if (typeof fn === "function") fn();
    });
  }

  /* ---------- 震惊效果：屏幕边缘红色脉冲 ---------- */
  function triggerShock() {
    el.shock.classList.add("active");
    el.stage.classList.add("stage-shocked");
    setTimeout(function () {
      el.shock.classList.remove("active");
      el.stage.classList.remove("stage-shocked");
    }, 1500);
  }

  /* ---------- 章节标题覆盖 ---------- */
  function showChapterTitle(chapterNum, chapterName, chapterSubname, onDone) {
    el.chapterNum.textContent = chapterNum || "";
    el.chapterNameEl.textContent = chapterName || "";
    el.chapterSubname.textContent = chapterSubname || "";
    el.chapterOverlay.classList.add("show");
    setTimeout(function () {
      el.chapterOverlay.classList.remove("show");
      if (typeof onDone === "function") onDone();
    }, 2600);
  }

  /* ---------- 密钥图标 ---------- */
  function showKeyIcon() {
    var icon = document.getElementById("key-icon");
    if (icon) icon.classList.add("show");
  }

  /* ---------- 义肢连接系统 HUD ---------- */
  var hudClockTimer = null;
  var hudStageTimers = [];
  var hudBootTime = 0;

  function clearHudTimers() {
    hudStageTimers.forEach(function (t) { clearTimeout(t); });
    hudStageTimers = [];
  }

  function formatClock(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function startHUDClock() {
    hudBootTime = 0;
    el.hudClock.textContent = "00:00";
    if (hudClockTimer) clearInterval(hudClockTimer);
    hudClockTimer = setInterval(function () {
      hudBootTime++;
      el.hudClock.textContent = formatClock(hudBootTime);
    }, 1000);
  }

  function stopHUDClock() {
    if (hudClockTimer) { clearInterval(hudClockTimer); hudClockTimer = null; }
  }

  /* 添加日志行 */
  function addHUDLog(text, cls) {
    var line = document.createElement("div");
    line.className = "hud-log-line" + (cls ? " " + cls : "");
    line.textContent = text;
    el.hudLog.appendChild(line);
    el.hudLog.scrollTop = el.hudLog.scrollHeight;
  }

  function clearHUDLog() {
    el.hudLog.innerHTML = "";
  }

  /* 显示 HUD */
  function showProstheticHUD(config) {
    config = config || {};
    clearHudTimers();
    clearHUDLog();
    stopHUDClock();

    // 重置信息面板
    el.hudDeviceName.textContent = "---";
    el.hudDeviceModel.textContent = "---";
    el.hudSigBars.textContent = "▯▯▯▯▯▯▯▯▯▯";
    el.hudSigPct.textContent = "0%";
    el.hudDeviceRange.textContent = "---";
    el.hudDeviceStatus.innerHTML = '<span class="hud-status-tag offline">DISCONNECTED</span>';
    el.hudSig.textContent = "SIG: ░░░░░░░░░░ 0%";
    el.hudRadarDot.classList.remove("show", "connected");
    el.hudRadarDotLabel.classList.remove("show");
    el.hudRadarDotLabel.textContent = "";
    el.hudBottombarHint.classList.remove("show");
    el.hudBottombarHint.textContent = "";

    var radarEl = el.prostheticHUD.querySelector(".hud-radar");
    if (radarEl) {
      radarEl.classList.remove("scanning", "connected");
    }

    el.prostheticHUD.classList.add("show");
    el.prostheticHUD.classList.remove("hide");
    el.prostheticHUD.setAttribute("aria-hidden", "false");
    startHUDClock();

    // 根据配置设定阶段
    var stage = config.stage || "boot";
    setProstheticHUDStage(stage, config);

    // 如果配置了自动推进（autoNext），在延迟后自动调用回调
    if (config.autoNext && typeof config.autoNext === "function") {
      var delay = config.delay || 2000;
      hudStageTimers.push(setTimeout(function () {
        config.autoNext();
      }, delay));
    }
  }

  /* 设置 HUD 阶段 */
  function setProstheticHUDStage(stage, data) {
    data = data || {};
    var radarEl = el.prostheticHUD.querySelector(".hud-radar");

    switch (stage) {
      case "boot":
        el.hudRadarLabel.textContent = "INIT";
        el.hudBottombarText.textContent = "INITIALIZING NEURAL LINK PROTOCOL...";
        addHUDLog("> Initializing Neural Link v2.1.7...", "highlight");
        addHUDLog("> Loading driver modules...");
        addHUDLog("> Checking security clearance...");
        addHUDLog("> Awaiting user command.", "");
        break;

      case "scanning":
        if (radarEl) radarEl.classList.add("scanning");
        el.hudRadarLabel.textContent = "SCANNING";
        el.hudSig.textContent = "SIG: ████░░░░░░ 42%";
        el.hudBottombarText.textContent = "SCANNING NEARBY DEVICES...";
        el.hudDeviceStatus.innerHTML = '<span class="hud-status-tag scanning">SCANNING</span>';
        addHUDLog("> Scanning for nearby prosthetic devices...", "highlight");
        addHUDLog("> Frequency: 2.4GHz / 5.8GHz band sweep", "");
        break;

      case "device_found":
        if (radarEl) radarEl.classList.add("scanning");
        el.hudRadarLabel.textContent = "DEVICE";
        el.hudRadarDot.classList.add("show");
        el.hudRadarDotLabel.classList.add("show");
        el.hudSig.textContent = "SIG: ████████░░ 87%";

        // 设置设备标记点位置
        if (data.dotX) el.hudRadarDot.style.left = data.dotX;
        if (data.dotY) el.hudRadarDot.style.top = data.dotY;
        el.hudRadarDotLabel.textContent = data.deviceLabel || "DEVICE_01";
        if (data.dotX) el.hudRadarDotLabel.style.left = (parseFloat(data.dotX) + 14) + "px";
        if (data.dotY) el.hudRadarDotLabel.style.top = (parseFloat(data.dotY) - 8) + "px";

        el.hudBottombarText.textContent = "DEVICE DETECTED ... ESTABLISHING LINK";
        el.hudDeviceStatus.innerHTML = '<span class="hud-status-tag scanning">DETECTED</span>';

        if (data.name) el.hudDeviceName.textContent = data.name;
        if (data.model) el.hudDeviceModel.textContent = data.model;
        if (data.signal) {
          var sigPct = data.signal;
          var bars = Math.round(sigPct / 10);
          var filledBars = "";
          for (var i = 0; i < 10; i++) {
            filledBars += i < bars ? "█" : "░";
          }
          el.hudSigBars.textContent = filledBars;
          el.hudSigPct.textContent = sigPct + "%";
          el.hudSig.textContent = "SIG: " + filledBars.slice(0, 10) + " " + sigPct + "%";
        }
        if (data.distance) el.hudDeviceRange.textContent = data.distance;

        addHUDLog("> Device detected: " + (data.name || "Unknown"), "highlight");
        addHUDLog("> Signal strength: " + (data.signal || "?") + "%", "");
        addHUDLog("> Establishing secure channel...", "");
        break;

      case "connected":
        if (radarEl) {
          radarEl.classList.remove("scanning");
          radarEl.classList.add("connected");
        }
        el.hudRadarLabel.textContent = "LINKED";
        el.hudRadarDot.classList.add("show", "connected");
        el.hudSig.textContent = "SIG: ██████████ 100%";
        el.hudSigBars.textContent = "██████████";
        el.hudSigPct.textContent = "100%";
        el.hudBottombarText.textContent = "NEURAL LINK ESTABLISHED";
        el.hudBottombarText.classList.add("ready");
        el.hudDeviceStatus.innerHTML = '<span class="hud-status-tag connected">CONNECTED</span>';

        if (data.name) el.hudDeviceName.textContent = data.name;
        if (data.model) el.hudDeviceModel.textContent = data.model;
        if (data.distance) el.hudDeviceRange.textContent = data.distance;

        el.hudBottombarHint.textContent = "PRESS [ENTER] TO ENGAGE";
        el.hudBottombarHint.classList.add("show");

        addHUDLog("> Neural link ESTABLISHED.", "success");
        addHUDLog("> Target: " + (data.name || "Unknown"), "success");
        addHUDLog("> Type: " + (data.model || "N/A"), "");
        break;

      case "quick":
        // 后续快速连接，只显示简短的界面
        if (radarEl) {
          radarEl.classList.add("connected");
        }
        el.hudRadarLabel.textContent = "LINKED";
        el.hudRadarDot.classList.add("show", "connected");
        el.hudSig.textContent = "SIG: ██████████ 100%";
        el.hudBottombarText.textContent = "NEURAL LINK ESTABLISHED";
        el.hudBottombarText.classList.add("ready");
        el.hudDeviceStatus.innerHTML = '<span class="hud-status-tag connected">CONNECTED</span>';

        if (data.name) {
          el.hudDeviceName.textContent = data.name;
          el.hudRadarDotLabel.classList.add("show");
          el.hudRadarDotLabel.textContent = data.name.split("·").pop() || data.name;
          if (data.dotX) {
            el.hudRadarDot.style.left = data.dotX;
            el.hudRadarDotLabel.style.left = (parseFloat(data.dotX) + 14) + "px";
          }
          if (data.dotY) {
            el.hudRadarDot.style.top = data.dotY;
            el.hudRadarDotLabel.style.top = (parseFloat(data.dotY) - 8) + "px";
          }
        }
        if (data.model) el.hudDeviceModel.textContent = data.model;
        if (data.signal) {
          el.hudSigBars.textContent = "█████████░";
          el.hudSigPct.textContent = data.signal + "%";
        }
        if (data.distance) el.hudDeviceRange.textContent = data.distance;

        addHUDLog("> LINK ESTABLISHED: " + (data.name || "Device"), "success");

        el.hudBottombarHint.textContent = "PRESS [ENTER] TO ENGAGE";
        el.hudBottombarHint.classList.add("show");
        break;
    }
  }

  /* 隐藏 HUD（带动画） */
  function hideProstheticHUD() {
    clearHudTimers();
    stopHUDClock();
    hideHUDActions();
    el.prostheticHUD.classList.add("hide");
    el.prostheticHUD.setAttribute("aria-hidden", "true");
    // 动画结束后移除 show
    hudStageTimers.push(setTimeout(function () {
      el.prostheticHUD.classList.remove("show");
      var radarEl = el.prostheticHUD.querySelector(".hud-radar");
      if (radarEl) {
        radarEl.classList.remove("scanning", "connected");
      }
    }, 500));
  }

  /* 渲染 HUD 选项按钮 */
  var hudChoiceLocked = false;
  function showHUDChoices(choices, onPick) {
    el.hudActions.innerHTML = "";
    if (!choices || !choices.length) {
      el.hudActions.classList.remove("show");
      return;
    }
    hudChoiceLocked = false;
    var buttons = [];
    choices.forEach(function (c, idx) {
      var btn = document.createElement("button");
      btn.className = "hud-action-btn";
      btn.textContent = c.label || c.text || "";
      btn.style.animationDelay = (idx * 120) + "ms";
      Input.on(btn, "click", function () {
        if (hudChoiceLocked) return;
        hudChoiceLocked = true;
        btn.classList.add("picked");
        buttons.forEach(function (b) { b.classList.add("locked"); });
        if (typeof onPick === "function") onPick(c, idx);
      });
      buttons.push(btn);
      el.hudActions.appendChild(btn);
    });
    el.hudActions.classList.add("show");
  }

  function hideHUDActions() {
    el.hudActions.classList.remove("show");
    el.hudActions.innerHTML = "";
    hudChoiceLocked = false;
  }

  /* HUD 打字机：向日志区逐字显示 */
  var hudTypeRaf = null;
  var hudTyping = false;
  function typeHUDText(text, onDone) {
    if (!text) {
      if (onDone) onDone();
      return;
    }
    // 取消前一个打字动画
    if (hudTyping) {
      hudTyping = false;
      if (hudTypeRaf) { cancelAnimationFrame(hudTypeRaf); hudTypeRaf = null; }
    }
    hudTyping = true;
    var full = text;
    var i = 0;
    var last = performance.now();
    var speed = 18;

    function step(now) {
      if (!hudTyping) return;
      var dt = now - last;
      if (dt >= speed) {
        var advance = Math.max(1, Math.floor(dt / speed));
        i = Math.min(full.length, i + advance);
        // 更新日志区的最后一行
        var currentText = full.slice(0, i);
        var lines = el.hudLog.children;
        if (lines.length === 0) {
          // 添加第一行
          var line = document.createElement("div");
          line.className = "hud-log-line highlight";
          line.textContent = currentText;
          el.hudLog.appendChild(line);
        } else {
          lines[lines.length - 1].textContent = currentText;
        }
        el.hudLog.scrollTop = el.hudLog.scrollHeight;
        last = now;
      }
      if (i >= full.length) {
        hudTyping = false;
        if (hudTypeRaf) cancelAnimationFrame(hudTypeRaf);
        hudTypeRaf = null;
        if (onDone) onDone();
        return;
      }
      hudTypeRaf = requestAnimationFrame(step);
    }
    hudTypeRaf = requestAnimationFrame(step);
  }

  function finishHUDType() {
    if (hudTyping) {
      hudTyping = false;
      if (hudTypeRaf) cancelAnimationFrame(hudTypeRaf);
      hudTypeRaf = null;
    }
  }

  /* ---------- 导出 ---------- */
  return {
    el: el,
    setMood: setMood,
    setBackgroundImage: setBackgroundImage,
    resetBackgroundImage: resetBackgroundImage,
    fadeOut: fadeOut,
    fadeIn: fadeIn,
    showDialog: showDialog,
    hideDialog: hideDialog,
    setSpeaker: setSpeaker,
    typeText: typeText,
    isTyping: isTyping,
    onDialogClick: onDialogClick,
    showChoices: showChoices,
    hideChoices: hideChoices,
    showToast: showToast,
    showProgressToast: showProgressToast,
    hideToast: hideToast,
    showPopup: showPopup,
    hidePopup: hidePopup,
    showMinigameLayer: showMinigameLayer,
    hideMinigameLayer: hideMinigameLayer,
    clearMinigameLayer: clearMinigameLayer,
    triggerShock: triggerShock,
    showChapterTitle: showChapterTitle,
    showKeyIcon: showKeyIcon,
    showProstheticHUD: showProstheticHUD,
    hideProstheticHUD: hideProstheticHUD,
    setProstheticHUDStage: setProstheticHUDStage,
    addHUDLog: addHUDLog,
    showHUDChoices: showHUDChoices,
    hideHUDActions: hideHUDActions,
    typeHUDText: typeHUDText,
    finishHUDType: finishHUDType,
    onStart: onStart
  };
})();
     