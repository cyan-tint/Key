/* ============================================================================
 * 《密钥》· 引擎状态机（game.js）
 * ----------------------------------------------------------------------------
 * 加载 STORY 节点图，按节点 id 流转：
 *   narration → 打字机，点击推进
 *   dialog    → 打字机 + 可选阻塞弹窗 popup + 选项 choices
 *   minigame  → 启动对应小游戏，完成后回调 onComplete
 * 场景切换（mood 变化）统一先淡出 → 换内容 → 淡入。
 *
 * 权重系统（gameState）：
 *   每个选择影响"良知"（conscience）和"恶名"（infamy）值，
 *   权重记录存储在 gameState 中，后续场景可读取权重值触发不同文本。
 * ========================================================================== */

(function () {
  "use strict";

  const STORY = window.STORY;

  /* ---------- 权重状态 ---------- */
  window.gameState = {
    conscience: 0,   // 良知
    infamy: 0        // 恶名
  };

  let currentMood = null;
  let currentNodeId = null;

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

    // 小游戏节点
    if (node.type === "minigame") {
      Renderer.hideDialog();
      Renderer.showMinigameLayer();
      Renderer.clearMinigameLayer();
      const fn = window.MiniGames && window.MiniGames[node.minigame];
      if (typeof fn === "function") {
        fn(Renderer.el.minigame, node.config || {}, function () {
          onMinigameDone(node);
        });
      } else {
        onMinigameDone(node);
      }
      return;
    }

    // narration / dialog
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
        // 应用权重变化
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

  /* ---------- 权重系统：根据选择更新良知/恶名 ---------- */
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
    const node = STORY.nodes[id];
    if (!node) return;
    currentNodeId = id;

    // 特殊节点处理：密钥图标浮现
    if (id === "p_shutdown") {
      Renderer.showKeyIcon();
    }

    // 发现报告时触发震惊效果
    if (id === "p_reveal") {
      Renderer.triggerShock();
    }

    // 章节转场：先显示章节标题 → 再渐入目标场景
    if (node.chapter) {
      Renderer.fadeOut(function () {
        currentMood = null; // 强制 scenery 重设
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

  /* ---------- 按场景氛围加载背景图 ---------- */
  function loadBgForMood(mood) {
    var map = {
      workstation: "assets/images/bg-workstation.png",
      bedroom: "assets/images/bg-bedroom.png",
      office: "assets/images/bg-office.png"
    };
    if (map[mood]) {
      Renderer.setBackgroundImage(map[mood]);
    } else {
      Renderer.resetBackgroundImage();
    }
  }

  /* ---------- 结束 & 结局处理 ---------- */
  let chapterEndNodeId = null;
  function showEnd() {
    Renderer.hideChoices();

    // 结局节点：保留对话框文字，展示结局后点击任意处重新开始
    if (chapterEndNodeId && chapterEndNodeId.indexOf("ending_") === 0) {
      showEndingScreen(chapterEndNodeId);
      return;
    }

    Renderer.hideDialog();
    var msg = "— 本章 · 完 —　点击任意处重新接入";
    if (chapterEndNodeId && chapterEndNodeId.indexOf("c5_") === 0) {
      msg = "— 第五章 · 完 —　点击任意处重新接入";
    } else if (chapterEndNodeId && chapterEndNodeId.indexOf("c4_") === 0) {
      msg = "— 第四章 · 完 —　点击任意处重新接入";
    } else if (chapterEndNodeId && chapterEndNodeId.indexOf("c3_") === 0) {
      msg = "— 第三章 · 完 —　点击任意处重新接入";
    } else if (chapterEndNodeId && chapterEndNodeId.indexOf("c2_") === 0) {
      msg = "— 第二章 · 完 —　点击任意处重新接入";
    } else if (chapterEndNodeId && chapterEndNodeId.indexOf("c1_") === 0) {
      msg = "— 第一章 · 完 —　点击任意处重新接入";
    }
    Renderer.showToast(msg, 6000);
    Renderer.onDialogClick(function () { location.reload(); });
  }

  /* ---------- 结局屏幕 ---------- */
  function showEndingScreen(endingId) {
    // 保留对话框可见，展示结局文本
    Renderer.showDialog();
    Renderer.fadeIn();
    Renderer.showToast("— 全剧终 —　点击任意处重新开始", 8000);

    // 绑定全局点击重新开始
    var stage = document.getElementById("stage");
    function reloadGame() {
      stage.removeEventListener("click", reloadGame);
      location.reload();
    }
    stage.addEventListener("click", reloadGame);
  }

  /* ---------- 启动 ---------- */
  function startGame() {
    currentMood = null;
    goTo(STORY.start);
  }

  Renderer.onStart(startGame);
})();
