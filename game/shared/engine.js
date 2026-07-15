/* ============================================================================
 * 《密钥》· 通用引擎（engine.js）
 * ----------------------------------------------------------------------------
 * 加载 STORY 节点图，按节点 id 流转。各章节通过 GAME_CONFIG 配置。
 * 依赖：STORY (data.js), Renderer, Input, MiniGames
 * ========================================================================== */

(function () {
  "use strict";

  var STORY = window.STORY;
  var cfg = window.GAME_CONFIG || {};

  /* ---------- 权重状态 ---------- */
  window.gameState = {
    conscience: 0,
    infamy: 0
  };

  var currentMood = null;
  var currentNodeId = null;

  /* ---------- 按场景氛围加载背景图 ---------- */
  function loadBgForMood(mood) {
    var map = cfg.moodMap || {
      workstation: "../assets/images/bg-workstation.png",
      bedroom: "../assets/images/bg-bedroom.png",
      office: "../assets/images/bg-office.png"
    };
    if (map[mood]) {
      Renderer.setBackgroundImage(map[mood]);
    } else {
      Renderer.resetBackgroundImage();
    }
  }

  /* ---------- 渲染节点 ---------- */
  function renderNode(node) {
    Renderer.hideChoices();
    Renderer.hidePopup();
    Renderer.onDialogClick(null);

    if (node.toast) {
      if (node.toast.indexOf("{pct}") !== -1) {
        Renderer.showProgressToast(node.toast, 42, 1500);
      } else {
        Renderer.showToast(node.toast);
      }
    }

    if (node.type === "minigame") {
      Renderer.hideDialog();
      Renderer.showMinigameLayer();
      Renderer.clearMinigameLayer();
      var fn = window.MiniGames && window.MiniGames[node.minigame];
      if (typeof fn === "function") {
        fn(Renderer.el.minigame, node.config || {}, function () {
          onMinigameDone(node);
        });
      } else {
        onMinigameDone(node);
      }
      return;
    }

    Renderer.hideMinigameLayer();
    Renderer.showDialog();
    Renderer.setSpeaker(node.speaker);
    Renderer.typeText(node.text || "", function () {
      onTyped(node);
    });
  }

  /* ---------- 打字完成后的处理 ---------- */
  function onTyped(node) {
    if (node.type === "narration") {
      if (node.next === null || node.next === undefined) {
        chapterEndNodeId = currentNodeId;
        Renderer.onDialogClick(showEnd);
      } else {
        Renderer.onDialogClick(function () { goTo(node.next); });
      }
      return;
    }

    if (node.type === "dialog") {
      if (node.popup) {
        Renderer.showPopup(node.popup, function () { afterPopup(node); });
      } else {
        afterPopup(node);
      }
    }
  }

  /* ---------- 弹窗确认后：展示选项或推进 ---------- */
  function afterPopup(node) {
    if (node.choices && node.choices.length) {
      Renderer.showChoices(node.choices, function (choice) {
        applyWeight(choice);
        Renderer.hideChoices();
        goTo(choice.next);
      });
      Renderer.onDialogClick(null);
    } else if (node.next) {
      Renderer.onDialogClick(function () { goTo(node.next); });
    } else {
      Renderer.onDialogClick(null);
    }
  }

  /* ---------- 权重系统 ---------- */
  function applyWeight(choice) {
    if (!choice.weight) return;
    var state = window.gameState;
    if (choice.weight.conscience !== undefined) {
      state.conscience += choice.weight.conscience;
    }
    if (choice.weight.infamy !== undefined) {
      state.infamy += choice.weight.infamy;
    }
    console.log(
      "[权重] 良知:" + state.conscience +
      "  恶名:" + state.infamy +
      "  ← " + (choice.id || choice.label || choice.text || "?")
    );
  }

  /* ---------- 小游戏完成 ---------- */
  function onMinigameDone(node) {
    Renderer.hideMinigameLayer();
    goTo(node.onComplete);
  }

  /* ---------- 节点流转（含场景淡入淡出） ---------- */
  function goTo(id) {
    var node = STORY.nodes[id];
    if (!node) return;
    currentNodeId = id;

    if (id === "p_shutdown") {
      Renderer.showKeyIcon();
    }

    if (id === "p_reveal") {
      Renderer.triggerShock();
    }

    if (node.chapter) {
      Renderer.fadeOut(function () {
        currentMood = null;
        Renderer.showChapterTitle(
          node.chapter.num,
          node.chapter.name,
          node.chapter.subname,
          function () {
            currentMood = node.bg;
            Renderer.setMood(node.bg);
            loadBgForMood(node.bg);
            renderNode(node);
            Renderer.fadeIn();
          }
        );
      });
      return;
    }

    if (currentMood === null) {
      currentMood = node.bg;
      Renderer.setMood(node.bg);
      loadBgForMood(node.bg);
      renderNode(node);
      return;
    }

    if (node.bg && node.bg !== currentMood) {
      Renderer.fadeOut(function () {
        currentMood = node.bg;
        Renderer.setMood(node.bg);
        loadBgForMood(node.bg);
        renderNode(node);
        Renderer.fadeIn();
      });
    } else {
      renderNode(node);
    }
  }

  /* ---------- 结束 ---------- */
  var chapterEndNodeId = null;
  function showEnd() {
    Renderer.hideDialog();
    Renderer.hideChoices();
    var msg = cfg.endMessage || "— 本章 · 完 —　点击任意处重新接入";
    Renderer.showToast(msg, 6000);
    Renderer.onDialogClick(function () { location.reload(); });
  }

  /* ---------- 启动 ---------- */
  function startGame() {
    currentMood = null;
    goTo(cfg.startNode || STORY.start);
  }

  Renderer.onStart(startGame);
})();
