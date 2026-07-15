/* ============================================================================
 * 《密钥》· 序章 · 剧本数据
 * 节点：p_intro → c1_certify（章节过渡）
 * ========================================================================== */

window.STORY = {
  start: "p_intro",

  nodes: {
    /* ---------- 事件①：代码圈选 · 密钥发现 ---------- */
    p_intro: {
      type: "narration", bg: "workstation", speaker: "旁白",
      text: "深夜。公司办公区的大灯已经关了，只剩下你工位上一盏旧台灯亮着。屏幕的光映在你脸上，光标在代码行间跳动，一明一灭。",
      toast: "正在处理垃圾代码……进度 {pct}",
      next: "p_code_hint"
    },
    p_code_hint: {
      type: "narration", bg: "workstation", speaker: "旁白",
      text: "你机械地移动鼠标，框选带有灰色标记的代码行，拖进屏幕右下角的回收处理器。重复，再重复。像一个被编程好的机器。",
      next: "p_code"
    },
    p_code: {
      type: "minigame", bg: "workstation",
      minigame: "codeRecycle",
      config: {
        lines: [
          { t: "0x00A1  mov  r1, [heap+0x3F]", marked: false },
          { t: "0x00A2  cmp  r1, 0x00", marked: false },
          { t: "0x00A3  jz   __gc_collect", marked: false },
          { t: "0x00A4  push r2", marked: false },
          { t: "0x00A5  call alloc_pool        // dead ref", marked: true },
          { t: "0x00A6  pop  r2", marked: false },
          { t: "0x00A7  xor  r3, r3, 0xFF", marked: false },
          { t: "0x00A8  ret", marked: false },
          { t: "0x00B1  ld   [stale_ptr+0x0C]", marked: false },
          { t: "0x00B2  shl  r4, r4, 2", marked: false },
          { t: "0x00B3  jmp  __loop", marked: false },
          { t: "0x00B4  free null_block        // orphaned", marked: true },
          { t: "0x00B5  nop", marked: false },
          { t: "0x00B6  br   __flush", marked: false }
        ],
        rounds: 3,
        anomalyLine: "0x00C0  /* anomaly_detected.sys — locked */",
        prompt: "框选带灰色标记的代码行，拖入右下角回收处理器。"
      },
      onComplete: "p_error"
    },
    p_error: {
      type: "dialog", bg: "workstation", speaker: "系统",
      text: "第三轮时，你拖拽了一串看起来没什么不同的代码，屏幕忽然弹出一个报错框——",
      popup: {
        title: "文件操作失败",
        message: "无法移动此文件。\n该文件正在被其他进程使用。",
        confirmText: "确定"
      },
      choices: [{ text: "确定", next: "p_shutdown" }]
    },
    p_shutdown: {
      type: "narration", bg: "workstation", speaker: "旁白",
      text: "报错框消失了。但屏幕右下角多了一个陌生的图标，像一片灰色的影子，安安静静地躺在那里。你盯着看了两秒，没有点开，伸手关掉了屏幕。",
      toast: "密钥图标 · 已植入",
      next: "p_leave"
    },
    p_leave: {
      type: "narration", bg: "workstation", speaker: "旁白",
      text: "「明天再说吧。」你起身拿起外套，走进夜色里。城市霓虹在窗外流动。",
      next: "p_awake"
    },

    /* ---------- 事件②：连接经理 · 印章发现 ---------- */
    p_awake: {
      type: "narration", bg: "bedroom", speaker: "旁白",
      text: "你回到公寓时已经很晚了。狭小的卧室，窗外是永不熄灭的赛博城夜景。你穿着旧 T 恤躺靠在床上，翻来覆去睡不着。",
      next: "p_tap"
    },
    p_tap: {
      type: "dialog", bg: "bedroom", speaker: "你",
      text: "「睡不着……那图标到底是什么？」你打开超脑，又看到了那个陌生图标。你点了进去。",
      choices: [{ text: "点开图标", next: "p_scan" }]
    },
    p_scan: {
      type: "dialog", bg: "bedroom", speaker: "系统",
      text: "界面里只有一个按钮——【扫描附近设备】。你随手按了下去。",
      choices: [{ text: "【扫描附近设备】", next: "p_connected" }]
    },
    p_connected: {
      type: "dialog", bg: "bedroom", speaker: "系统",
      text: "正在扫描……设备列表刷新。",
      toast: "已连接：经理·张 的 HR-07 型义肢（右臂）。",
      choices: [{ text: "点击连接", next: "p_stamp_hint" }]
    },
    p_stamp_hint: {
      type: "narration", bg: "office", speaker: "旁白",
      text: "你犹豫了一下，然后点了连接。画面切换——你的视角忽然变成了俯视。你正坐在经理办公室那张宽大的皮椅上，桌面上堆着文件，旁边搁着一枚沉甸甸的印章。你低头，看到自己正握着一只金属手——义肢手，银灰色，关节处有精密啮合的纹理。",
      next: "p_stamp"
    },
    p_stamp: {
      type: "minigame", bg: "office",
      minigame: "stamp",
      config: {
        documents: [
          { name: "员工考勤表 · 林", own: false },
          { name: "调岗通知 · 王", own: false },
          { name: "绩效评估 · 赵", own: false },
          { name: "裁员报告 · ？", own: true }
        ],
        stampsRequired: 3,
        prompt: "拿起印章，对准文件，按下盖章。"
      },
      onComplete: "p_reveal"
    },
    p_reveal: {
      type: "narration", bg: "office", speaker: "旁白",
      text: "下一份文件摊开，你拿起印章，正要落下，目光扫到了右上角的名字。你的手悬在半空。那些字像是突然有了重量，压住了你的视线。",
      next: "p_reveal2"
    },
    p_reveal2: {
      type: "narration", bg: "office", speaker: "你",
      text: "「……等等。」「……这是我。这是我的裁员报告。」",
      next: "p_disconnect"
    },
    p_disconnect: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "你愣了很久。手慢慢放了下来，印章轻轻搁回桌面，发出瓷器与木头碰撞的轻响。你断开连接，关掉屏幕，躺回枕头上，盯着天花板，黑暗里什么也看不清。",
      next: "p_end"
    },
    p_end: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "「……这只是个游戏。」你闭上了眼睛。画面渐暗。",
      next: null
    }
  }
};

/* 引擎配置 */
window.GAME_CONFIG = {
  startNode: "p_intro",
  endMessage: "— 序章 · 完 —　点击任意处重新接入",
  moodMap: {
    workstation: "../assets/images/bg-workstation.png",
    bedroom: "../assets/images/bg-bedroom.png",
    office: "../assets/images/bg-office.png"
  }
};
