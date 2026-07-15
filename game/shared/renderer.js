/* ============================================================================
 * 《密钥》· 渲染器（renderer.js）
 * ----------------------------------------------------------------------------
 * 负责所有 DOM 表现层逻辑，被引擎与 minigames 调用：
 *   - 场景氛围 / 背景图
 *   - 淡入淡出
 *   - 打字机（rAF 驱动，点击快进 / 跳过）
 *   - 选项按钮
 *   - 中心报错弹窗
 *   - 系统提示条
 *   - 小游戏覆盖层显隐
 * ========================================================================== */

window.Renderer = (function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    scene: $("scene"),
    sceneBg: document.querySelector(".scene-bg"),
    minigame: $("minigame-layer"),
    toast: $("sys-toast"),
    choices: $("choices"),
    dialog: $("dialog"),
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
    stage: $("stage")
  };

  /* ---------- 打字机状态 ---------- */
  var typing = false;
  var rafId = null;
  var fullText = "";
  var onTypeDone = null;
  var dialogClickHandler = null;

  /* ---------- 场景氛围 / 背景 ---------- */
  function setMood(mood) {
    el.scene.setAttribute("data-mood", mood || "dark");
  }

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
    if (name === "你" || name === "我") {
      el.dialog.classList.add("me-mode");
    } else {
      el.dialog.classList.remove("me-mode");
    }
  }

  /* ---------- 打字机 ---------- */
  function typeText(text, onDone) {
    fullText = text || "";
    onTypeDone = onDone || null;
    el.text.textContent = "";
    el.cursor.classList.remove("hidden");
    el.hint.classList.remove("show");
    typing = true;

    var i = 0;
    var last = performance.now();
    var speed = 24;

    function step(now) {
      if (!typing) return;
      var dt = now - last;
      if (dt >= speed) {
        var advance = Math.max(1, Math.floor(dt / speed));
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
    if (!typing && el.text.textContent === fullText) return;
    typing = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    el.text.textContent = fullText;
    el.cursor.classList.add("hidden");
    el.hint.classList.add("show");
    var cb = onTypeDone;
    onTypeDone = null;
    if (cb) cb();
  }

  function isTyping() { return typing; }

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

  function showProgressToast(template, targetPct, duration) {
    if (!template) return;
    targetPct = targetPct || 42;
    var dur = duration || 1500;
    var start = performance.now();
    el.toast.classList.add("show");
    function tick(now) {
      var elapsed = now - start;
      var pct = Math.min(targetPct, Math.round((elapsed / dur) * targetPct));
      el.toast.textContent = template.replace("{pct}", pct + "%");
      if (pct < targetPct) {
        requestAnimationFrame(tick);
      } else {
        if (el.toast._timer) clearTimeout(el.toast._timer);
        el.toast._timer = setTimeout(function () {
          el.toast.classList.remove("show");
        }, 1800);
      }
    }
    requestAnimationFrame(tick);
  }

  /* ---------- 中心弹窗 ---------- */
  function showPopup(opts, onConfirm) {
    opts = opts || {};
    el.popupTitle.textContent = opts.title || "系统提示";
    el.popupMsg.innerHTML = (opts.message || "").replace(/\n/g, "<br>");
    el.popupActions.innerHTML = "";

    var confirmText = opts.confirmText || "确定";
    var btn = document.createElement("button");
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

  /* ---------- 震惊效果 ---------- */
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
    onStart: onStart
  };
})();
