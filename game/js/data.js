/* ============================================================================
 * 《密钥》· 剧本数据（data.js）
 * ----------------------------------------------------------------------------
 * 引擎以「节点图」驱动：game.js 从 STORY.start 出发，按节点 id 取节点渲染，
 * 通过 next / choices[].next / minigame.onComplete 在节点间流转。
 *
 * 节点类型（type）：
 *   narration 旁白/打字机文本
 *     { type, bg, speaker?, text, toast?, next }
 *   dialog    对话（可带阻塞式弹窗 popup 与选项 choices）
 *     { type, bg, speaker?, text, toast?, popup?, choices:[{text,next}] }
 *   minigame  交互小游戏（由 minigames.js 实现，完成回调 onComplete）
 *     { type, bg, speaker?, text?, minigame, config?, onComplete }
 *
 * 章节转场：
 *   c1_certify 节点带有 chapter 属性，会触发黑屏 + 章节标题动画过渡。
 *
 * 通用字段：
 *   bg     场景氛围键，对应 renderer 的 data-mood
 *          （workstation / bedroom / office / dark / lobby / convenience）
 *   speaker 说话人名（可选，显示在对话框标签）
 *   text   打字机正文
 *   toast  顶部系统提示条文本（可选）
 *   next   下一节点 id；为 null 表示章节结束
 * ========================================================================== */

window.STORY = {
  start: "p_intro",

  nodes: {
    /* =============================================================
     * 序章 · 事件①：代码圈选 · 密钥发现
     * ========================================================= */

    p_intro: {
      type: "narration",
      bg: "workstation",
      speaker: "旁白",
      text:
        "深夜。公司办公区的大灯已经关了，只剩下你工位上一盏旧台灯亮着。" +
        "屏幕的光映在你脸上，光标在代码行间跳动，一明一灭。",
      toast: "正在处理垃圾代码……进度 {pct}",
      next: "p_code_hint"
    },

    p_code_hint: {
      type: "narration",
      bg: "workstation",
      speaker: "旁白",
      text:
        "你机械地移动鼠标，框选带有灰色标记的代码行，拖进屏幕右下角的回收处理器。" +
        "重复，再重复。像一个被编程好的机器。",
      next: "p_code"
    },

    p_code: {
      type: "minigame",
      bg: "workstation",
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
      type: "dialog",
      bg: "workstation",
      speaker: "系统",
      text:
        "第三轮时，你拖拽了一串看起来没什么不同的代码，屏幕忽然弹出一个报错框——",
      popup: {
        title: "文件操作失败",
        message: "无法移动此文件。\n该文件正在被其他进程使用。",
        confirmText: "确定"
      },
      choices: [
        { text: "确定", next: "p_shutdown" }
      ]
    },

    p_shutdown: {
      type: "narration",
      bg: "workstation",
      speaker: "旁白",
      text:
        "报错框消失了。但屏幕右下角多了一个陌生的图标，像一片灰色的影子，安安静静地躺在那里。" +
        "你盯着看了两秒，没有点开，伸手关掉了屏幕。",
      toast: "密钥图标 · 已植入",
      next: "p_leave"
    },

    p_leave: {
      type: "narration",
      bg: "workstation",
      speaker: "旁白",
      text: "你起身拿起外套，走进夜色里。城市霓虹在窗外流动。",
      next: "p_leave_thought"
    },

    p_leave_thought: {
      type: "narration",
      bg: "workstation",
      speaker: "你",
      text: "「明天再说吧。」",
      next: "p_awake"
    },

    /* =============================================================
     * 序章 · 事件②：连接经理 · 印章发现
     * ========================================================= */

    p_awake: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "你回到公寓时已经很晚了。狭小的卧室，窗外是永不熄灭的赛博城夜景。" +
        "你穿着旧 T 恤躺靠在床上，翻来覆去睡不着。",
      next: "p_tap_act"
    },

    p_tap_act: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text: "你打开超脑，又看到了那个陌生图标。你点了进去。",
      next: "p_tap"
    },

    p_tap: {
      type: "dialog",
      bg: "bedroom",
      speaker: "你",
      text: "「睡不着……那图标到底是什么？」",
      choices: [
        { text: "点开图标", next: "p_scan" }
      ]
    },

    p_scan: {
      type: "dialog",
      bg: "bedroom",
      speaker: "系统",
      text: "密钥程序启动。神经链接协议初始化完成。界面弹出——【扫描附近设备】。",
      hud: {
        stage: "boot",
        dotX: "62%",
        dotY: "38%"
      },
      choices: [
        { text: "【扫描附近设备】", next: "p_connected" }
      ]
    },

    p_connected: {
      type: "dialog",
      bg: "bedroom",
      speaker: "系统",
      text: "扫描中……信号捕捉成功。检测到一台可连接义肢设备。",
      toast: "已连接：经理·张 的 HR-07 型义肢（右臂）。",
      hud: {
        stage: "device_found",
        name: "经理·张",
        model: "HR-07 型义肢（右臂）",
        signal: 87,
        distance: "12.7m",
        dotX: "62%",
        dotY: "38%",
        deviceLabel: "DEV_01"
      },
      choices: [
        { text: "点击连接", next: "p_link_est" }
      ]
    },

    /* 神经链接建立成功（HUD 过场） */
    p_link_est: {
      type: "narration",
      bg: "bedroom",
      speaker: "系统",
      text: "神经链接已建立。正在同步视觉信号……链接稳定。",
      hud: {
        stage: "connected",
        name: "经理·张",
        model: "HR-07 型义肢（右臂）",
        signal: 100,
        distance: "12.7m",
        dotX: "62%",
        dotY: "38%",
        deviceLabel: "DEV_01"
      },
      next: "p_stamp_hint"
    },

    p_stamp_hint: {
      type: "narration",
      bg: "office",
      speaker: "旁白",
      text:
        "你犹豫了一下，然后点了连接。画面切换——你的视角忽然变成了俯视。" +
        "你正坐在经理办公室那张宽大的皮椅上，桌面上堆着文件，旁边搁着一枚沉甸甸的印章。" +
        "你低头，看到自己正握着一只金属手——义肢手，银灰色，关节处有精密啮合的纹理。",
      next: "p_stamp"
    },

    p_stamp: {
      type: "minigame",
      bg: "office",
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
      type: "narration",
      bg: "office",
      speaker: "旁白",
      text:
        "下一份文件摊开，你拿起印章，正要落下，目光扫到了右上角的名字。" +
        "你的手悬在半空。那些字像是突然有了重量，压住了你的视线。",
      next: "p_reveal2"
    },

    p_reveal2: {
      type: "narration",
      bg: "office",
      speaker: "你",
      text: "「……等等。」「……这是我。这是我的裁员报告。」",
      next: "p_disconnect"
    },

    p_disconnect: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "你愣了很久。手慢慢放了下来，印章轻轻搁回桌面，发出瓷器与木头碰撞的轻响。" +
        "你断开连接，关掉屏幕，躺回枕头上，盯着天花板，黑暗里什么也看不清。",
      next: "p_end"
    },

    p_end: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text: "你闭上了眼睛。画面渐暗。",
      next: "p_end_thought"
    },

    p_end_thought: {
      type: "narration",
      bg: "dark",
      speaker: "你",
      text: "「……这只是个游戏。」",
      next: "c1_certify"
    },

    /* =============================================================
     * 第一章 · 事件①：现实印证
     * ========================================================= */

    c1_certify: {
      type: "narration",
      bg: "lobby",
      speaker: "旁白",
      text:
        "次日早晨。公司大厅的公告屏上滚动着裁员名单，荧光蓝的字在灰白色墙壁上跳动。" +
        "你站在屏前，目光从名单顶端往下扫——没有你的名字。但老林的名字在倒数第三行。",
      toast: "翌日 08:42 · 公司大厅",
      chapter: {
        num: "第一章",
        name: "密钥 · 觉醒",
        subname: "THE KEY AWAKENS"
      },
      next: "c1_lin"
    },

    c1_lin: {
      type: "dialog",
      bg: "lobby",
      speaker: "旁白",
      text:
        "走廊尽头，老林抱着纸箱迎面走来。纸箱里有几本书、一个马克杯和一盆快枯死的绿萝。" +
        "他看见你，停了一下，腾出一只手拍了拍你的肩膀。",
      popup: null,
      choices: [
        { text: "……林哥。", next: "c1_lin_talk" }
      ]
    },

    c1_lin_talk: {
      type: "dialog",
      bg: "lobby",
      speaker: "老林",
      text:
        "「哟，你还在啊。下午走了。」他用下巴指了指纸箱。「你小子运气好，名单上没你。」",
      choices: [
        { text: "「嗯。你……」", next: "c1_lin_gone" }
      ]
    },

    c1_lin_gone: {
      type: "narration",
      bg: "lobby",
      speaker: "旁白",
      text:
        "他摆了摆手，从你身边走过。脚步声在走廊里慢慢变远。" +
        "你看着他的背影转进电梯间，纸箱上的绿萝叶子轻轻晃了一下。",
      next: "c1_drawer"
    },

    c1_drawer: {
      type: "narration",
      bg: "workstation",
      speaker: "旁白",
      text:
        "你回到工位，拉开抽屉。那份报告已经被抽走了，取而代之的是一张新的考勤表。" +
        "但你注意到纸面上多了一个模糊的红笔圈——正好圈在你名字的位置。" +
        "你合上抽屉，靠在椅背上，看着屏幕角落里那个安安静静的密钥图标。",
      next: "c1_drawer2"
    },

    c1_drawer2: {
      type: "narration",
      bg: "workstation",
      speaker: "你",
      text: "「……原来真的能改变。」",
      next: "c1_comp_intro"
    },

    /* =============================================================
     * 第一章 · 事件②：体恤金
     * ========================================================= */

    c1_comp_intro: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "当晚，你躺在床上，又打开了那个密钥界面。屏幕上多了一个【已连接设备】列表。" +
        "列表中显示着——「经理·张」，旁边有一行小字标注：「可重复连接」。你点了进去。",
      toast: "已连接设备 · 1 项",
      hud: {
        stage: "quick",
        name: "经理·张",
        model: "HR-07 型义肢（右臂）[历史连接]",
        signal: 91,
        distance: "11.5m",
        dotX: "60%",
        dotY: "40%",
        deviceLabel: "MGR_ZHANG"
      },
      next: "c1_comp_switch"
    },

    c1_comp_switch: {
      type: "narration",
      bg: "office",
      speaker: "旁白",
      text:
        "画面再次切到经理的义肢视角。桌面上摊着一份「遣散员工补偿金审批表」。" +
        "老林的名字在上面——补偿金额被改成了最低标准。",
      next: "c1_comp_game"
    },

    c1_comp_game: {
      type: "minigame",
      bg: "office",
      minigame: "adjustComp",
      config: {
        name: "林国强",
        defaultAmount: "最低",
        maxAmount: "两倍",
        prompt: "拖动滑块，把补偿金额调整为两倍标准。"
      },
      onComplete: "c1_comp_done"
    },

    c1_comp_done: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "你移动义肢手指，将金额从「最低」划到「两倍」。" +
        "系统弹出「修改已保存」。你断开连接，把超脑放在床头，关掉了灯。",
      next: "c1_comp_thought"
    },

    c1_comp_thought: {
      type: "narration",
      bg: "bedroom",
      speaker: "你",
      text: "「……这样对得起他了。」「今天算是做了件好事吧。」",
      next: "c1_debt_intro"
    },

    /* =============================================================
     * 第一章 · 事件③：赊账清除
     * ========================================================= */

    c1_debt_intro: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "第三天晚上。你又打开了密钥界面，这次你注意到了另一个按钮——" +
        "【随机连接附近义肢】。你犹豫了几秒，按了下去。",
      toast: "正在扫描附近设备……",
      hud: {
        stage: "quick",
        name: "便利店·陈",
        model: "义肢右臂（收银终端联动型）",
        signal: 92,
        distance: "8.3m",
        dotX: "55%",
        dotY: "42%",
        deviceLabel: "DEV_02"
      },
      next: "c1_connect_conv"
    },

    c1_connect_conv: {
      type: "narration",
      bg: "convenience",
      speaker: "系统",
      text:
        "画面切换。你的视角变成了便利店收银台。" +
        "老板正坐在柜台后面清点零钱，义肢手搭在终端面板上。" +
        "屏幕上显示着赊账记录页面——你在列表中间看到了自己的名字。",
      toast: "已连接：便利店·陈 的义肢右臂（收银终端联动型）",
      next: "c1_debt_game"
    },

    c1_debt_game: {
      type: "minigame",
      bg: "convenience",
      minigame: "clearDebt",
      config: {
        records: [
          { name: "王建国", amount: "¥156", own: false },
          { name: "赵晓梅", amount: "¥43", own: false },
          { name: "你", amount: "¥287", own: true },
          { name: "刘大伟", amount: "¥112", own: false },
          { name: "孙阿姨", amount: "¥65", own: false }
        ],
        prompt: "找到赊账记录中的自己的名字，点击「清除」。"
      },
      onComplete: "c1_debt_done"
    },

    c1_debt_done: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "数字「¥287」闪烁了两下，然后归零。" +
        "你断开连接，盯着屏幕上空掉的赊账行看了很久。",
      next: "c1_debt_thought"
    },

    c1_debt_thought: {
      type: "narration",
      bg: "bedroom",
      speaker: "你",
      text: "「……好，这下两清了。」「……反正他店那么大，少一笔赊账也不会发现。」",
      next: "c1_debt_thought_act"
    },

    c1_debt_thought_act: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text: "你关掉了灯。",
      next: "c1_police_intro"
    },

    /* =============================================================
     * 第一章 · 事件④：警察枪击
     * ========================================================= */

    c1_police_intro: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "几天后的一个深夜。你像往常一样躺在床上，打开了密钥界面。手指悬在" +
        "【随机连接附近义肢】上，轻轻按了下去。",
      hud: {
        stage: "quick",
        name: "警员·马",
        model: "XX-12 型执法义肢",
        signal: 78,
        distance: "22.4m",
        dotX: "70%",
        dotY: "30%",
        deviceLabel: "DEV_03"
      },
      next: "c1_shoot_connect"
    },

    c1_shoot_connect: {
      type: "narration",
      bg: "bedroom",
      speaker: "系统",
      text:
        "画面切换——视角剧烈晃动，有风声和远处急促的喊叫声。" +
        "你在一条昏暗的巷道里。义肢的手臂上有警徽的纹路，反射着远处霓虹的微光。",
      toast: "已连接：警员·马 XX-12 型执法义肢",
      next: "c1_shoot_game"
    },

    c1_shoot_game: {
      type: "minigame",
      bg: "bedroom",
      minigame: "shoot",
      config: {
        prompt: "瞄准巷道尽头的身影，扣下扳机。",
        hitResult: "一声枪响，有人倒下。信号中断……"
      },
      onComplete: "c1_end"
    },

    c1_end: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "枪声在巷道里回荡，画面猛地暗了下来。" +
        "你猛地从床上坐起，大口喘气。窗帘被风吹动，窗外隐约有警笛声逼近。" +
        "你低头看着自己的双手——没有血，没有硝烟，只是那双普通的、什么都没做的手。",
      next: "c1_end2"
    },

    c1_end2: {
      type: "narration",
      bg: "dark",
      speaker: "你",
      text:
        "「我刚才……开枪了？」「我杀了人？」" +
        "「……我只是想玩一下……我没想！」",
      next: "c2_certify"
    },

    /* =============================================================
     * 第二章 · 事件①：随机连接 · 被拉入巷道
     * ========================================================= */

    c2_certify: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "几天后的傍晚。你下班后独自走在街上，街道两旁的霓虹灯开始亮起，" +
        "空气里混着油烟和潮湿的混凝土气味。你停下脚步，四下看了看——没什么人注意你。" +
        "你打开密钥界面，点了一下随机连接。",
      toast: "熟练度达标 · 链接限制已解除",
      chapter: {
        num: "第二章",
        name: "密钥 · 代价",
        subname: "THE PRICE OF POWER"
      },
      next: "c2_connect"
    },

    c2_connect: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "画面切换。一股强烈的晕眩感传来——视角正在快速移动，视线上下颠簸，" +
        "显然是在奔跑。周围是逼仄的巷道，两侧是锈蚀的金属墙和密如蛛网的管线，" +
        "头顶晾晒的衣物在风里摆动。远处有孩子的哭声和断断续续的机器轰鸣。",
      toast: "已连接：医生·阿毅，义肢右臂（AX-07 医疗终端联动型）",
      hud: {
        stage: "quick",
        name: "医生·阿毅",
        model: "义肢右臂（AX-07 医疗终端联动型）",
        signal: 95,
        distance: "6.2m",
        dotX: "45%",
        dotY: "35%",
        deviceLabel: "DEV_04"
      },
      next: "c2_arrive"
    },

    c2_arrive: {
      type: "dialog",
      bg: "dark",
      speaker: "女人",
      text:
        "「快！这边！快点！」视角被一个女人拽着快步往前走。" +
        "她的手很紧，指甲陷进义肢的金属外壳里，发出轻微的刮擦声。",
      choices: [
        { text: "……", next: "c2_inside" }
      ]
    },

    c2_inside: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "你还没来得及想清楚，视角已经被拉进了一栋低矮的金属板房。" +
        "板房内部狭小昏暗，一盏旧灯泡挂在顶上，光线昏黄。" +
        "四壁贴满了泛黄的画纸，歪歪扭扭的蜡笔线条画着房子、太阳、三个人。" +
        "角落里有一张行军床，床上躺着一个人，面色灰白，呼吸急促，腹部缠着渗血的绷带。",
      next: "c2_face"
    },

    /* =============================================================
     * 第二章 · 事件②：看清面孔 · 沉默的瞬间
     * ========================================================= */

    c2_face: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "女人松开义肢手，快步走到床边蹲下，握住床上人的手。" +
        "你通过医生的眼睛，看清了床上人的脸——",
      next: "c2_face2_act"
    },

    c2_face2_act: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "那人的脸和你断开连接前看到的最后一幕重合了。" +
        "你感觉自己的呼吸变重了。",
      next: "c2_face2"
    },

    c2_face2: {
      type: "narration",
      bg: "dark",
      speaker: "你",
      text:
        "「是他。我开枪打的那个人。」「他没死……？」",
      next: "c2_talk"
    },

    /* =============================================================
     * 第二章 · 事件③：病人的恳求 · 床边的对话
     * ========================================================= */

    c2_talk: {
      type: "dialog",
      bg: "dark",
      speaker: "女人",
      text:
        "「阿毅医生，求你看看他……他前天被人打了，一直没醒……」",
      choices: [
        { text: "……", next: "c2_talk2" }
      ]
    },

    c2_talk2: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "女人被病人轻声劝出房间，临走前回头看了一眼医生，眼神复杂。" +
        "房间只剩下病人和医生（你的视角）。病人用尽力气撑起半个身子，" +
        "看着你，嘴唇干裂。",
      next: "c2_patient"
    },

    c2_patient: {
      type: "narration",
      bg: "dark",
      speaker: "病人",
      text:
        "「我没办法。我不是坏人。但我没办法。」" +
        "「我活不了多久了……我知道的。」" +
        "「阿毅医生，我知道你什么都看得明白。」" +
        "他伸出手，抓住医生的义肢手腕——金属和皮肤接触的声音在狭小的房间里格外清晰。" +
        "「帮我开一份死亡证明。说我是被警察打死的。那样我老婆孩子……能拿到赔偿金。」" +
        "他停顿了一下，声音更轻了。「就当……你什么都没看见。」",
      next: "c2_patient2"
    },

    c2_patient2: {
      type: "narration",
      bg: "dark",
      speaker: "你",
      text:
        "「他是在求我帮他死。不是治病，是帮他死得有价值。」" +
        "「那份报告是我开的枪。现在我又有机会决定他的结局。」",
      next: "c2_patient2_narr"
    },

    c2_patient2_narr: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "你通过医生的眼睛看着那张脸——那是一个你亲手伤害过的人。" +
        "现在这个人正在哀求一份「被正义杀死」的假证明。" +
        "你第一次觉得，自己在那间卧室里获得的「神权」，不是一件玩具了。",
      next: "c2_wife"
    },

    /* =============================================================
     * 第二章 · 事件④：妻子的折返 · 恳求与对峙
     * ========================================================= */

    c2_wife: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "女人没有真的离开。她在门外站了一会儿，又推门进来了。" +
        "她看了一眼丈夫，又看向医生，声音很小但很稳。",
      next: "c2_wife2"
    },

    c2_wife2: {
      type: "dialog",
      bg: "dark",
      speaker: "女人",
      text:
        "「阿毅医生……你别听他的。他胡说的。他这几天发烧，说胡话。」" +
        "她抬头看向你，眼眶是红的。" +
        "「他还能治。你治过的，你记得吗？上次我们隔壁老赵也是这样的伤，你把他救回来了。求求你……」",
      choices: [
        { text: "……", next: "c2_wife3" }
      ]
    },

    c2_wife3: {
      type: "dialog",
      bg: "dark",
      speaker: "女人",
      text:
        "她回头看了一眼床上的丈夫，又转回来。" +
        "「你说什么假证明……他只是一时糊涂。你帮他治，我……我还能筹钱的。我去借，我去……我去打工。你救救他。」" +
        "病人没有说话，只是看着你。房间安静了几秒，只有灯泡的电流声。",
      next: "doctor_choice"
    },

    /* =============================================================
     * 第二章 · 核心选择：医生的抉择
     * ========================================================= */

    doctor_choice: {
      type: "dialog",
      bg: "dark",
      speaker: "你",
      text:
        "灯泡的电流声在安静中格外清晰。女人含着泪看着你，病人在床上微弱地呼吸。" +
        "你的手——不，是医生的手——悬在半空。",
      choices: [
        {
          id: "heal",
          label: "🔬 医治",
          description: "选择救治病人",
          next: "c2_heal",
          weight: { conscience: 2 }
        },
        {
          id: "certificate",
          label: "📄 开具证明",
          description: "帮助病人'以死换赔偿'",
          next: "c2_certificate",
          weight: { infamy: 2 }
        },
        {
          id: "leave",
          label: "🚪 沉默离开",
          description: "断开连接，什么也不做",
          next: "c2_leave",
          weight: { conscience: -1, infamy: 1 }
        }
      ]
    },

    /* ---------- 分支 A：选择医治（手术交互） ---------- */

    c2_heal: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "女人被请到门外等候。你操控医生的义肢手，揭开病人腹部的绷带，" +
        "露出伤口。两副义肢手悬在伤口上方，金属关节微微转动，发出细密的机械声。",
      next: "c2_heal_game"
    },

    c2_heal_game: {
      type: "minigame",
      bg: "dark",
      minigame: "surgery",
      config: {
        fragments: 3,
        prompt: "点击伤口内的子弹碎片，夹取到托盘上。"
      },
      onComplete: "c2_heal_done"
    },

    c2_heal_done: {
      type: "narration",
      bg: "dark",
      speaker: "病人",
      text:
        "「……谢谢。」最后一次金属碎片落入托盘时，病人轻轻吐出一口气。" +
        "女人在门外哽咽着道谢。主角看着那双义肢手——" +
        "金属手指上沾着血迹，在灯光下暗红发亮。",
      next: "c2_faint"
    },

    /* ---------- 分支 B：选择开具证明（签字交互） ---------- */

    c2_certificate: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "病人闭上眼睛，女人在门外没有进来。你操控医生的义肢手，走到桌边，" +
        "打开义肢终端。屏幕亮起，显示一份死亡证明模板。",
      next: "c2_cert_game"
    },

    c2_cert_game: {
      type: "minigame",
      bg: "dark",
      minigame: "signCertificate",
      config: {
        patientName: "李国强",
        causeOfDeath: "警用器械误伤",
        prompt: "在签名栏拖拽滑动，签署死亡证明。"
      },
      onComplete: "c2_cert_done"
    },

    c2_cert_done: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "屏幕显示「已归档」。病人轻轻说了一声「谢谢」。主角断开连接前，" +
        "看到自己的义肢手——金属手指，指节上刻着编号 AX-07。",
      next: "c2_disconnect"
    },

    c2_disconnect: {
      type: "narration",
      bg: "bedroom",
      speaker: "你",
      text:
        "「我又杀了他一次。第一次是枪，这一次是笔。」" +
        "「我在这具身体里，做完了这件事。」",
      next: "c2_disconnect_act"
    },

    c2_disconnect_act: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "你断开连接，躺回床上。窗外的霓虹灯光透过窗帘照在天花板上，" +
        "像一道寂静的伤口。",
      next: "c2_faint"
    },

    /* ---------- 分支 C：选择沉默离开 ---------- */

    c2_leave: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "你没有回答任何人。你的意识从医生的义肢中抽离——" +
        "画面回到你自己的视角，你站在街头，周围车流和人流仍然在流动。" +
        "你站在那里，没有打开超脑。",
      next: "c2_leave_thought"
    },

    c2_leave_thought: {
      type: "narration",
      bg: "dark",
      speaker: "你",
      text:
        "「我什么都没做。我离开了。」" +
        "「我走了以后，他们怎么办？」",
      next: "c2_leave_thought_act"
    },

    c2_leave_thought_act: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "你站在那里很久。行人从你身边流过，没有人注意到你。" +
        "你最后看了一眼那个巷道的方向，然后转身走了。",
      next: "c2_faint"
    },

    /* =============================================================
     * 第二章 · 后半部分：结识少年 · 修复义肢
     * ========================================================= */

    /* ---------- 事件⑤：晕倒 · 被捡走 ---------- */

    c2_faint: {
      type: "narration",
      bg: "dark",
      speaker: "你",
      text: "「我在哪？」",
      next: "c2_faint_act"
    },

    c2_faint_act: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "断开连接后，意识瞬间抽离。眼前模糊，天旋地转。" +
        "你发现自己正躺在地上，头靠着某处坚硬的东西。" +
        "面前是一张凑得很近的脸，一双眼睛睁得很大。",
      next: "c2_boy"
    },

    c2_boy: {
      type: "dialog",
      bg: "dark",
      speaker: "少年",
      text:
        "「你醒啦？你刚才倒在路边，差点被一辆送货机器人碾过去。」" +
        "少年看起来十六七岁，头发有些乱，眼神很亮。他穿着一件洗得发白的旧工装外套。" +
        "你注意到——他的左手是自制的义肢，金属外壳粗糙，裸露的螺丝和线路清晰可见。" +
        "右手则是另一副义肢，外观更规整，外壳有划痕和修补的焊点。",
      choices: [
        { text: "「……谢了。我可能是太累了。」", next: "c2_hut" }
      ]
    },

    /* ---------- 事件⑥：小屋 · 机械狂热 ---------- */

    c2_hut: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "少年住的地方是一间极小的金属板房，但明显被精心打理过。" +
        "墙上挂着各种工具和零件，桌上摊着一块半成品电路板，旁边放着螺丝刀和焊枪。" +
        "角落有一台旧超脑，屏幕亮着，显示着看不懂的程序界面。" +
        "整个房间有一种「正在被一个人认真对待」的秩序感。",
      next: "c2_hut2"
    },

    c2_hut2: {
      type: "dialog",
      bg: "dark",
      speaker: "少年",
      text:
        "「你看这个。这是我从一个废弃回收站捡的，原来是一副超体公司报废的义肢。" +
        "我把它修好了装在自己手上——厉害吧？」他举起右手，手指灵活地张开又合拢，" +
        "但动作偶尔会卡顿一下。「超体公司做的东西确实厉害，就是修理起来很麻烦，" +
        "有些程序代码根本看不懂。」他的手再次卡顿，皱了皱眉。" +
        "你低头扫到那个义肢手腕内侧有一行灰色小字：编号 AX-1072。",
      choices: [
        { text: "「我回去之后看看能不能查到什么。」", next: "c2_go_home" }
      ]
    },

    /* ---------- 事件⑦：回家 · 编号搜索 ---------- */

    c2_go_home: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "你告辞离开，回到自己的公寓时已经是深夜。你坐到桌边，打开超脑。" +
        "屏幕角落的密钥界面还在——右下角多了一个新的文本框：" +
        "「输入义肢编号以搜索连接」。你想起那个少年义肢手腕上的编号 AX-1072。" +
        "犹豫了一下，把那串数字输入了搜索框。",
      toast: "正在搜索……已找到对应义肢。",
      hud: {
        stage: "quick",
        name: "少年（未知）",
        model: "义肢右臂 · AX-1072",
        signal: 64,
        distance: "3.6km",
        dotX: "35%",
        dotY: "55%",
        deviceLabel: "AX-1072"
      },
      next: "c2_repair_intro"
    },

    c2_repair_intro: {
      type: "narration",
      bg: "bedroom",
      speaker: "你",
      text: "「……他帮了我一次。我帮他解决这个卡顿，就当还人情了。」",
      next: "c2_repair_intro_act"
    },

    c2_repair_intro_act: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "你点了连接。画面切换——进入了少年的义肢视野。视角很低，因为少年的个子本就不高。" +
        "能看到少年正坐在桌边，还在埋头拆那块面板，完全没有察觉右臂的临时离线。",
      next: "c2_repair_game"
    },

    c2_repair_game: {
      type: "minigame",
      bg: "bedroom",
      minigame: "repairImplant",
      config: {
        modules: 3,
        prompt: "拖拽闪烁的故障代码块到回收区，修复义肢连接问题。"
      },
      onComplete: "c2_repair_done"
    },

    c2_repair_done: {
      type: "narration",
      bg: "bedroom",
      speaker: "系统",
      text: "「连接问题已修复。信号延迟：0.1 秒 → 0.01 秒。」",
      next: "c2_repair_done_act"
    },

    c2_repair_done_act: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "你断开连接，靠回椅背。窗外贫民窟方向传来模糊的车声。" +
        "你想起少年说话时那种亮晶晶的眼神。",
      next: "c2_repair_done_thought"
    },

    c2_repair_done_thought: {
      type: "narration",
      bg: "bedroom",
      speaker: "你",
      text: "「……没见识。」",
      next: "c2_repair_done_last"
    },

    c2_repair_done_last: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text: "你关掉了超脑，屏幕暗下去。",
      toast: "修复完成 · 第二章 · 完",
      next: "c3_certify"
    },

    /* =================================================================
     * 第三章 · 事件①：虚荣的提议 · 连接高管
     * ================================================================= */

    c3_certify: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "几天后的傍晚。你收到一条消息——来自贫民窟那个少年的超脑终端。" +
        "「今天又修好了一台旧引擎！你什么时候再来看看？」" +
        "你看了几秒，嘴角动了动，回了一句「挺厉害啊你」，然后放下超脑，靠回椅背。",
      toast: "新消息 · 来自：伙伴",
      chapter: {
        num: "第三章",
        name: "密钥 · 高层的窗",
        subname: "THE WINDOW ABOVE"
      },
      next: "c3_connect_exec"
    },

    c3_connect_exec: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "一个念头浮了上来——你忽然很想看看少年见到超体公司内部时那种兴奋到手足无措的表情。" +
        "你打开密钥界面，在搜索框里输入了关键词——「超体公司 高管 义肢编号」。" +
        "系统返回了一串列表，你随手点了一个看起来层级不低的编号。",
      toast: "正在搜索……已找到：超体公司高管 ×12",
      hud: {
        stage: "quick",
        name: "超体公司·高管",
        model: "EX-09 高管定制型义肢",
        signal: 96,
        distance: "1.2km",
        dotX: "58%",
        dotY: "28%",
        deviceLabel: "EXEC_01"
      },
      next: "c3_exec_bring"
    },

    c3_exec_bring: {
      type: "narration",
      bg: "lobby",
      speaker: "旁白",
      text:
        "画面切换。你发现自己接入的是一名高管的义肢视野——西装革履，站在公司大堂里，" +
        "周围是光洁的大理石地面和悬浮的全息标识。你透过高管的眼睛，看到少年正站在不远处，" +
        "满脸兴奋地四处张望。",
      next: "c3_boy_react"
    },

    c3_boy_react: {
      type: "dialog",
      bg: "lobby",
      speaker: "少年",
      text:
        "「你在哪？你说的那个高管呢？」少年压低声音，四处张望。" +
        "你操控高管的义肢手，朝他抬了一下，示意「过来」。",
      choices: [
        { text: "操控高管招了招手", next: "c3_boy_excite" }
      ]
    },

    c3_boy_excite: {
      type: "dialog",
      bg: "lobby",
      speaker: "少年",
      text:
        "少年转头看到那个高管正朝自己招手，眼睛一下亮了——「……就是那个人？你居然认识超体公司的高管？！」" +
        "他快步走了过去。你操控高管的嘴，语气平淡：「听说你对机械很有研究。走吧，带你看看。」" +
        "少年压低声音，像在对通讯那头的真你说：「……你也太厉害了吧，这种人都认识？」",
      choices: [
        { text: "「……还行吧。」", next: "c3_meeting" }
      ]
    },

    /* =================================================================
     * 第三章 · 事件②：突发会议 · CTO 登场
     * ================================================================= */

    c3_meeting: {
      type: "narration",
      bg: "lobby",
      speaker: "旁白",
      text:
        "高管正带着少年穿过一条宽敞的走廊，两侧是落地玻璃墙，外面可以看到超体公司总部的核心区域——" +
        "巨大的中庭悬挂着公司的 LOGO，全息投影在空中缓缓旋转。远处一个助理模样的人快步走近。",
      next: "c3_assistant"
    },

    c3_assistant: {
      type: "dialog",
      bg: "lobby",
      speaker: "助理",
      text:
        "「张总，CTO 临时召集会议，请您现在去一趟 A7 会议室。」" +
        "你还没反应过来，高管的脚已经自动转向了助理指的方向——这是义肢的「工作流程引导」。",
      popup: null,
      choices: [
        { text: "「你在这层随便转转，我很快出来。」", next: "c3_cto_enter" }
      ]
    },

    c3_cto_enter: {
      type: "narration",
      bg: "lobby",
      speaker: "旁白",
      text:
        "推开会议室大门，长桌两侧坐着十多位公司高层。你找到位置坐下。" +
        "几分钟后，门再次打开。走进来的是一个看上去不超过三十岁的年轻人，" +
        "穿着简单的白衬衫，没有任何公司徽章或身份标识，脸上挂着一种似是而非的淡笑。",
      next: "c3_cto_id"
    },

    c3_cto_id: {
      type: "narration",
      bg: "lobby",
      speaker: "你",
      text: "「他没有义肢？这个时代……高层里怎么可能有 0 义肢的人？」",
      next: "c3_cto_id_act"
    },

    c3_cto_id_act: {
      type: "narration",
      bg: "lobby",
      speaker: "旁白",
      text: "你注意到——CTO 的领口和手腕露出的皮肤，没有任何义肢接口的痕迹。",
      next: "c3_meeting_end"
    },

    c3_meeting_end: {
      type: "narration",
      bg: "lobby",
      speaker: "旁白",
      text:
        "会议内容冗长而枯燥。你心不在焉，目光几次偷瞄 CTO。" +
        "会议在毫无异样的气氛中结束了。高层们陆续起身离开，CTO 也站起来拿起了外套。" +
        "你松了一口气，打算趁乱离开去找少年。站起身正要往外走——",
      next: "c3_cto_stay"
    },

    /* =================================================================
     * 第三章 · 事件③：识破 · 对峙
     * ================================================================= */

    c3_cto_stay: {
      type: "dialog",
      bg: "lobby",
      speaker: "CTO",
      text:
        "「……张总，留一下。」CTO 的声音从身后传来，不高不低。" +
        "你停住了。他用余光看了一眼你的表情——似笑非笑，看不出任何敌意，也看不出任何善意。" +
        "会议室的门在其他高层身后缓缓合上。",
      popup: null,
      choices: [
        { text: "慢慢坐回去", next: "c3_confront" }
      ]
    },

    c3_confront: {
      type: "narration",
      bg: "lobby",
      speaker: "CTO",
      text:
        "「你不是张总。你是谁？」CTO 笑了一下——不是冷笑，是觉得有趣的那种笑。" +
        "「你不用说话。我只需要你听。」他走了两步，停在窗边，背对着你。" +
        "「我不知道你是怎么做到的。远程接入？信号劫持？还是别的什么手段……不重要。重要的是你做到了。」",
      next: "c3_confront2"
    },

    c3_confront2: {
      type: "narration",
      bg: "lobby",
      speaker: "CTO",
      text:
        "他转过身来。「那个小孩是你的人吧。我让人把他扣在楼下茶水间了。」" +
        "你心里猛地一沉。「……你想干什么？」" +
        "CTO 漫不经心地整理一下袖口——「我要你帮我做一件事。你做了，我当今天什么也没发生。" +
        "你不做——」他停顿了一下，「『偷窃公司商业机密』——这个罪名，你觉得怎么样？」" +
        "「放心，我对你的小把戏不感兴趣。我只需要你帮我一个小忙。」",
      next: "c3_vanity_choice"
    },

    c3_vanity_choice: {
      type: "dialog",
      bg: "lobby",
      speaker: "旁白",
      text:
        "会议室里只有你们两人。夕阳从落地窗斜射进来，在桌面上拉出一道长条形的光。" +
        "CTO 靠在桌沿上，双臂抱在胸前，目光平淡地看着你。",
      choices: [
        {
          id: "accept_cto",
          label: "🤝 答应",
          description: "同意帮 CTO 做事",
          next: "c3_accept",
          weight: { infamy: 1 }
        },
        {
          id: "reject_cto",
          label: "❌ 拒绝",
          description: "CTO 将威胁伙伴安全",
          next: "c3_reject",
          weight: { conscience: 1, infamy: 1 }
        }
      ]
    },

    c3_accept: {
      type: "narration",
      bg: "lobby",
      speaker: "你",
      text: "「……我答应你。但你要答应我一件事——帮我瞒住这个秘密。不能让公司追踪到我。」",
      next: "c3_accept_cto"
    },

    c3_accept_cto: {
      type: "narration",
      bg: "lobby",
      speaker: "旁白",
      text:
        "你沉默了很久，最后开口，声音干涩。" +
        "CTO 歪了一下头：「……你在跟我谈条件。" +
        "可以。你做的事我不管，今天的事也没有第四个人知道。」",
      next: "c3_strip"
    },

    c3_reject: {
      type: "narration",
      bg: "lobby",
      speaker: "CTO",
      text:
        "你刚要说不——CTO 已经微笑着拿起通讯器：「查一下刚才那个小孩的身份。」" +
        "你咬紧牙，胸口翻涌着愤怒和无力，但最终还是改了口。「……好。我帮你。」" +
        "CTO 放下通讯器，表情没有任何变化。「早该这样。」",
      next: "c3_strip"
    },

    /* =================================================================
     * 第三章 · 事件④：展示 · 真身
     * ================================================================= */

    c3_strip: {
      type: "narration",
      bg: "lobby",
      speaker: "旁白",
      text:
        "会议室里只剩两人。CTO 站在落地窗前，夕阳把他的轮廓拉成一道剪影。" +
        "他把外套放在桌上，背对你，解开了两颗纽扣。" +
        "「你是不是在想，我是一个完全没有义肢的纯人类？」",
      next: "c3_strip2"
    },

    c3_strip2: {
      type: "dialog",
      bg: "lobby",
      speaker: "CTO",
      text:
        "CTO 侧过头看了你一眼，嘴角带着笑：「……看一眼。」你偏过头，闭眼：「……你脱衣服干嘛？」" +
        "CTO 笑了一声：「你闭着眼睛怎么帮我做事？睁眼。」" +
        "你皱着眉，极其勉强地睁开一只眼，透过手指缝看了一眼——" +
        "夕阳下，CTO 的脖颈和锁骨下方覆盖着一层极薄的透明表皮，下面排列着精密到几乎看不见的金属接口。",
      choices: [
        { text: "「……你是改造过的。」", next: "c3_strip3" }
      ]
    },

    c3_strip3: {
      type: "narration",
      bg: "lobby",
      speaker: "CTO",
      text:
        "「我是第一批接受义体改造的人。从头到脚，百分之七十以上。」" +
        "他抬起右手，五指张开——动作平稳，但在最末端的一节指节处微微颤动了一下，" +
        "像一个齿轮卡了半拍。「但因为太早了，这些义肢做不了精细动作。」" +
        "「我需要你帮我取一样东西。一个芯片，锁在 A9 区的保险箱里。" +
        "我试过很多办法，但我的手指做不到那种精度的操作。你可以。」" +
        "「……为什么要我帮你？」「因为你已经在这里了。」",
      next: "c3_lab_intro"
    },

    /* =================================================================
     * 第三章 · 事件⑤：参观 · 人体实验
     * ================================================================= */

    c3_lab_intro: {
      type: "narration",
      bg: "lobby",
      speaker: "旁白",
      text:
        "CTO 打电话让人把少年带上来。少年站在走廊里，有些紧张，看到「高管」和 CTO 站在一起时，" +
        "明显愣了一下。CTO 拍了拍少年的肩膀，语气亲切得像一个带后辈参观的前辈——" +
        "「你不是喜欢机械吗？带你看点有意思的。」",
      next: "c3_lab_walk"
    },

    c3_lab_walk: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "CTO 走在前面，身后跟着「高管」（你）和少年。穿过一道又一道需要权限验证的门，" +
        "空气逐渐变冷，灯光也从暖黄变成了冷白。走廊两侧的玻璃窗里，可以看到一排排义肢正在被测试——" +
        "有的是手臂，有的是腿，有的是安装在脊椎上的外骨骼。",
      next: "c3_lab_horror"
    },

    c3_lab_horror: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "但越往里走，画面开始变得不对劲。有些义肢还连着神经组织，被放置在营养液里；" +
        "有一些甚至已经安装在人体上——那些人半躺在医疗椅上，眼睛半睁半闭，" +
        "看不出是有意识还是被药物抑制了。少年停下了脚步。",
      next: "c3_lab_boy_ask"
    },

    c3_lab_boy_ask: {
      type: "dialog",
      bg: "dark",
      speaker: "少年",
      text:
        "「……这些人是……？」少年的声音变了，那种刚进来时的兴奋已经被另一种更复杂的东西取代了。",
      choices: [
        { text: "……", next: "c3_lab_cto_answer" }
      ]
    },

    c3_lab_cto_answer: {
      type: "narration",
      bg: "dark",
      speaker: "CTO",
      text:
        "「义肢适配测试的志愿者。有的是签了协议的，有的是从地下市场回收的。」" +
        "「……他们还好吗？」「有些人会醒过来，有些人不会。这很正常。」" +
        "少年没有说话。他的目光停在一个女孩身上——大约十四五岁，左臂以下全部换成了义肢，" +
        "接口处还有未愈合的痕迹。她的手被固定在扶手上，手指时不时抽搐一下。",
      next: "c3_lab_silence"
    },

    c3_lab_silence: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "少年的手指攥紧了衣摆，破旧的布料被抓皱到看不出原本的形状。" +
        "CTO 像没有察觉气氛变化一样继续往前走：「……这边还有更多。」" +
        "你停在原地，看着少年站在那扇玻璃窗前面，看着里面那个女孩的手指一下一下地抽动。" +
        "你忽然想起 CTO 说的——「有些人会醒过来，有些人不会。」" +
        "你没有说出真相。你站在 CTO 和少年之间，像黑暗和黎明间的地平线，沉默，一言不发。",
      next: "c3_safe_intro"
    },

    /* =================================================================
     * 第三章 · 事件⑥：任务 · 保险箱
     * ================================================================= */

    c3_safe_intro: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "深夜。超体公司大楼 A9 区。走廊两侧的灯已经调暗，只有应急指示灯泛着淡淡的蓝光。" +
        "你独自一人——操控着高管的身体——站在一扇金属门前。CTO 的声音从高管的义肢通讯系统中传来，" +
        "清晰而平静：「密码锁我已经处理好了，你只需要伸手。」",
      toast: "CTO 通讯 · 加密频道",
      next: "c3_safe_game"
    },

    c3_safe_game: {
      type: "minigame",
      bg: "dark",
      minigame: "safeCrack",
      config: {
        layers: 3,
        prompt: "将手指移动到指定坐标点并保持稳定，缓慢拖拽滑块到目标位置。"
      },
      onComplete: "c3_crash"
    },

    c3_crash: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "芯片取出时，你的手指——不，是高管的手指——轻轻碰了一下芯片边缘。" +
        "你忽然意识到，这是一份你不应该碰的东西。你把它握在手里。" +
        "断开连接，画面切回自己的公寓。你坐在椅子上，盯着手里的超脑屏幕，" +
        "屏幕上还残留着刚才保险箱的界面——以及一行小字：「已取出。任务完成。」",
      toast: "已取出。任务完成。",
      next: "c3_crash2"
    },

    c3_crash2: {
      type: "narration",
      bg: "bedroom",
      speaker: "你",
      text:
        "你关上屏幕，坐在黑暗中很久没有动。你回想着今天看到的所有画面——" +
        "CTO 真身下那些藏在仿真皮肤里的接口、走廊里半昏迷的测试者、" +
        "那个十几岁的女孩手指抽搐的样子、少年站在玻璃窗前沉默的侧脸。" +
        "你试图告诉自己，这一切和你没关系，你只是一个「帮忙的人」。但你看到芯片的时候，你握住了它。" +
        "不管里面是什么，你都成了这一环的一部分。",
      next: "c3_crash3_act"
    },

    c3_crash3: {
      type: "narration",
      bg: "bedroom",
      speaker: "你",
      text: "「……我到底在做什么？」",
      toast: "第三章 · 完",
      next: "c4_certify"
    },

    c3_crash3_act: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "你打开超脑，屏幕亮起来，密钥界面还在。你看着那个熟悉的图标，" +
        "伸手想关掉——手指悬在屏幕上方，没有按下去。你关掉了超脑，把脸埋进手里。" +
        "窗外警笛声远远传来，你没有抬头看。",
      next: "c3_crash3"
    },

    /* =================================================================
     * 第四章 · 事件①：不速之客 · 昏暗小屋
     * ================================================================= */

    c4_certify: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "傍晚。贫民窟。少年的金属板房内亮着一盏旧灯泡，桌上摆着两瓶廉价啤酒和一袋花生。" +
        "少年正在兴奋地比划自己今天刚修好的一台旧引擎，你笑着听他说。",
      chapter: {
        num: "第四章",
        name: "密钥 · 酒桌与秘密",
        subname: "SECRETS OVER DRINKS"
      },
      next: "c4_knock"
    },

    c4_knock: {
      type: "dialog",
      bg: "dark",
      speaker: "旁白",
      text:
        "门外忽然传来脚步声——不是路过，是径直走向门口的。敲门声响起，不轻不重。" +
        "「……你约了人？」「没有。」门被从外面推开了。",
      choices: [
        { text: "……", next: "c4_cto_arrive" }
      ]
    },

    c4_cto_arrive: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "CTO 站在门口，穿着那件白衬衫，外套搭在手臂上，脸上挂着那副似笑非笑的神情。" +
        "他的目光扫过屋内，落在一脸警惕的你身上，然后挪开，环顾了一下这个狭小但整洁的空间。" +
        "「……原来你住这里。比我想象的干净。」你猛地站起来，把少年往自己身后挡了一下。",
      next: "c4_cto_tracker"
    },

    c4_cto_tracker: {
      type: "narration",
      bg: "dark",
      speaker: "CTO",
      text:
        "「你怎么找到这里的？」CTO 没有急着回答，跨过门槛走进来，自然地在一个小马扎上坐了下来。" +
        "「定位器。他右臂那只义肢内侧，我让人在检修时放了一枚微型信号标记。」他看了一眼少年，" +
        "语气里甚至带着一点歉意：「抱歉，当时只是备着，没想到真的会用上。」" +
        "少年愣住了，低头看着自己的右臂——那只他精心修复、当作骄傲的超体公司旧义肢。",
      next: "c4_cto_reassure"
    },

    c4_cto_reassure: {
      type: "narration",
      bg: "dark",
      speaker: "CTO",
      text:
        "「放心，我不是来追杀你的。我一个人来的，没带任何人。」" +
        "他停顿了一下，像是在等待你消化这句话。" +
        "「……今天不谈芯片的事。今天只是随便聊聊。」",
      next: "c4_chat"
    },

    /* =================================================================
     * 第四章 · 事件②：攀谈 · 警惕到松动
     * ================================================================= */

    c4_chat: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "最初十几分钟，气氛异常尴尬。你几乎不说话，目光一直盯着 CTO 的动作。" +
        "少年夹在中间，倒水、递酒，不知道该怎么开口。CTO 却毫不在意，安静地喝了一口水，" +
        "然后放下杯子，环视了一圈墙上挂着的工具和零件，目光落在少年桌上那半块电路板上。",
      next: "c4_chat2"
    },

    c4_chat2: {
      type: "dialog",
      bg: "dark",
      speaker: "CTO",
      text:
        "「……那是你自己改的？」「……嗯。我捡的旧板子，自己重新走了一下线。」" +
        "「走线不对，你第三组接口少焊了一个电阻，功率不够。」" +
        "少年一怔，低头看了看电路板，又看了看 CTO，张了张嘴没说出话来。" +
        "「你挺有天赋的。只是没人教过你。」",
      choices: [
        { text: "「……那你能教我吗？」", next: "c4_tech_talk" }
      ]
    },

    c4_tech_talk: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "CTO 居然笑了一下——不是那种似笑非笑，是真的笑了一下，很浅，但确实是真的。" +
        "「可以。下次带块正经板子给你。」" +
        "你在旁边看着这一切，手里的防备慢慢松了一些，但没有完全放下。" +
        "CTO 像是察觉到了你的变化，侧过头来看向你：「……你不用一直绷着。我想杀你，犯不着这么大费周折。」",
      next: "c4_truth"
    },

    /* =================================================================
     * 第四章 · 事件③：坦白 · 私生子的故事
     * ================================================================= */

    c4_truth: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "桌角的蜡烛被少年点上。酒喝了大半瓶，气氛比之前松弛了很多。" +
        "CTO 把外套放在一旁，靠着背后的墙坐着。少年晕乎乎地问——" +
        "「你们这种大公司的老板，是不是从小就很厉害？」CTO 低头沉默了一会儿。",
      next: "c4_truth2"
    },

    c4_truth2: {
      type: "narration",
      bg: "dark",
      speaker: "CTO",
      text:
        "「……我父亲是超体公司的创始人。他在外面留了很多私生子，我是其中一个。」" +
        "「他选人的标准很简单——谁的身体条件和神经系统最稳定，就留下。其他的一概不管。」" +
        "「我被选中了。因为是第一批义体改造的实验对象。『初代适配者』，档案里是这么写的。」" +
        "他抬起自己的右手，五指张开，又慢慢握紧——指节在最末端处轻微颤动了一下。",
      next: "c4_truth3"
    },

    c4_truth3: {
      type: "narration",
      bg: "dark",
      speaker: "CTO",
      text:
        "「我整个青少年时期，都在手术台上度过。换骨骼、换神经、换内脏，" +
        "直到百分之七十以上都不再是原来的东西。他从来没问过我想不想要这些……」" +
        "「现在他老了，身体撑不住了，想要肉体长寿。他想到的第一件事，是我。" +
        "我是他做过最成功的实验体——我的身体数据，是唯一一份超过五十年连续记录的完整资料。」" +
        "「他打算……把我拆了，用来配他的新身体。」",
      next: "c4_truth4"
    },

    c4_truth4: {
      type: "narration",
      bg: "dark",
      speaker: "CTO",
      text:
        "他重新抬起头，脸上那层淡笑又浮了上来，但这一次，你能看出那层笑下面压着的东西。" +
        "「……所以我说，我需要你帮我取那个芯片。不是因为我想升职加薪，是因为那个芯片里有我自己的原始身体数据——" +
        "他知道在哪里，但拿不到，因为那些数据锁在创始人的旧系统里，而创始人的权限钥匙，" +
        "只有他的直系血亲才能激活。他做不到，因为他不知道自己的亲生父亲到底是谁。而我查到了。」" +
        "「……我要在我父亲把我拆掉之前，毁掉那份数据。那样他就没有备份了。」",
      next: "c4_truth5"
    },

    c4_truth5: {
      type: "narration",
      bg: "dark",
      speaker: "CTO",
      text:
        "他看了一眼你，目光里第一次有了一种模糊的、像是请求的东西。" +
        "「你们是我第一次在晚上跟别人说这些。不是因为你们多厉害，是因为……" +
        "你们看起来像真的会听完的人。」",
      next: "c4_respond_choice"
    },

    c4_respond_choice: {
      type: "dialog",
      bg: "dark",
      speaker: "你",
      text:
        "蜡烛轻轻晃动。CTO 的手指停在桌面上，安静得像一尊雕塑。少年已经愣了很久。" +
        "你看着 CTO 的脸，第一次觉得这个人不只是「似笑非笑的危险家伙」。",
      choices: [
        {
          id: "comfort",
          label: "💬 安慰",
          description: "「……我们会听完的。」",
          next: "c4_boy_back"
        },
        {
          id: "question",
          label: "❓ 追问",
          description: "「……你为什么要告诉我们这些？」",
          next: "c4_boy_back"
        },
        {
          id: "silence",
          label: "🍺 沉默",
          description: "什么都没说，只是给他倒了杯酒",
          next: "c4_boy_back"
        }
      ]
    },

    /* =================================================================
     * 第四章 · 事件④：伙伴拿食物 · 密钥泄露
     * ================================================================= */

    c4_boy_back: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "少年站起来去了隔间翻找食物。房间里只剩下你和 CTO。安静中，CTO 放下酒杯，" +
        "目光落在你身上。「……你那个连接能力，不是靠设备做出来的吧？」" +
        "你抬眼看他，没有承认也没有否认。",
      next: "c4_key_leak"
    },

    c4_key_leak: {
      type: "narration",
      bg: "dark",
      speaker: "CTO",
      text:
        "「我查过系统日志。张总的义肢在没有任何外部信号的情况下被接入过——" +
        "那套系统我写的，我知道什么情况会留下痕迹，什么情况不会。你的操作方式，我从来没有见过。」" +
        "他停顿了一下。「那个密钥，你手上有一把，对吗？」" +
        "你沉默了很久。少年在隔间里翻东西的声音窸窸窣窣地传来。",
      next: "c4_key_leak2"
    },

    c4_key_leak2: {
      type: "narration",
      bg: "dark",
      speaker: "你",
      text: "「……你怎么知道钥匙的事？」",
      next: "c4_key_leak2_act"
    },

    c4_key_leak2_act: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "你的声音很小，带着一丝自己都没意识到的疲惫。" +
        "CTO 微微点头，像是得到了确认——" +
        "「我不确定。只是猜的。创始人的旧系统里，一直有一个『外部验证协议』的空槽。" +
        "我查了很久，不知道那是留给谁的。但看到你的操作方式之后，我想到了那个可能。我没想到……真的是。」",
      next: "c4_key_leak3"
    },

    c4_key_leak3: {
      type: "narration",
      bg: "dark",
      speaker: "你",
      text: "「……是。有一把。创始人的密钥，在我这里。」",
      next: "c4_key_leak3_act"
    },

    c4_key_leak3_act: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "你捏着酒杯，没有看他。你不知道自己为什么要说出来——也许是喝了酒，" +
        "也许是 CTO 刚才说的那些话让你觉得……这个人可能真的只是想要活下来。" +
        "CTO 沉默了一会儿，低声说：「……那你要藏好。他知道了，你会死得比我快。」",
      next: "c4_night"
    },

    /* =================================================================
     * 第四章 · 事件⑤：整夜 · 意外的放松 & 蒙太奇过渡
     * ================================================================= */

    c4_night: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "少年端着干粮从隔间走回来，嘻嘻哈哈地坐回桌边，完全没有察觉刚才的气氛变化。" +
        "之后的气氛变得奇妙地松弛。少年借着酒劲把自己组装义肢时出的丑都倒了出来，" +
        "CTO 居然一一给出改进建议，语气不再是高管的试探，而是「这个你该那样焊」的实在话。" +
        "你看着这一切，慢慢喝掉了自己那杯酒。",
      next: "c4_night_end"
    },

    c4_night_end: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "少年最后趴在桌上睡着了，手里还攥着半块没吃完的干粮。CTO 没有吵醒他，" +
        "站起来把外套重新穿上。他站在门口，背对着你，声音很轻——" +
        "「今晚的事……就到这里。明天醒来，你还是你，我还是我。」" +
        "他推开门，夜风灌进来。「……谢谢。」他走进夜色里，门在身后合上。",
      toast: "第四章 · 前半 · 完",
      next: "c4_montage"
    },

    c4_montage: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "接下来的几周里，类似的夜晚又发生了好几次。有时候你下班后直接拐进贫民窟，" +
        "有时候 CTO 先到，坐在门口抽烟等你们。少年在屋里烧了一个旧铁炉子，" +
        "三个人围着炉火坐，烟气从窗缝往外冒。你带过肉干，少年带过一台旧投影仪——" +
        "三个人坐在地上看一部画质粗糙的老电影。CTO 在中间睡着了，头歪向一侧。" +
        "少年对你比了一个「嘘」的手势。你没说话，把炉火调小了一点。",
      next: "c4_montage2"
    },

    c4_montage2: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "有一次 CTO 带来了一叠旧电路图，说是公司废弃项目里流出来的：「给你们当教材。」" +
        "少年一把抢过去，翻了两页就开始趴在桌上画笔记。你坐在旁边，看着他们两个，" +
        "觉得这一幕像某种从未想过会属于自己的日常。" +
        "你也带密钥去过 CTO 的办公室。CTO 的手指不灵活，你就在旁边替他点按那些需要精细控制的位置。" +
        "他看着屏幕上的代码，轻声说：「……如果你愿意一直拿着它，我可能是这个世界上最安全的人。」",
      next: "c4_montage3"
    },

    c4_montage3: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "「……你不想要吗？」「想。但我也想你活着。」" +
        "你没有回答，但把屏幕转向了 CTO 一些，好让他看得更清楚。" +
        "有一次少年在拆旧电机时被零件划伤了手背。CTO 从口袋里拿出一块干净的手帕递给他，" +
        "动作比平时慢了一点——你注意到 CTO 的手指末节又在颤。" +
        "你看着 CTO 垂下的手，什么也没说，但你心里知道——" +
        "这个人正在一天比一天更迫切地需要那个芯片。",
      next: "c4_morning"
    },

    /* =================================================================
     * 第四章 · 事件⑥：次日 · 细小的异常
     * ================================================================= */

    c4_morning: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "第二天早晨。你醒来时窗外天刚亮透。你像往常一样洗漱、换衣服、准备出门。" +
        "出门前，你习惯性地检查了一下自己的物品——然后注意到一个问题。" +
        "昨晚你放在桌上的那件外套，袖口内侧有一小片细微的亮银色粉末，" +
        "像是什么金属器件摩擦后留下的碎屑。你用指尖抹了一下，粉末很细，极少。",
      next: "c4_morning2"
    },

    c4_morning2: {
      type: "narration",
      bg: "bedroom",
      speaker: "你",
      text: "「昨晚回来的路上，我碰过什么金属的东西吗？」",
      next: "c4_morning2_narr"
    },

    c4_morning2_narr: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "你回忆了一遍昨晚的路径——" +
        "少年的板房、巷道、轨道车、公寓。沿途没有碰过任何需要伸手去碰的东西。" +
        "你想到另一种可能——这不是你在外面蹭到的。这是有人在夜间碰过你的外套，无意中留下的痕迹。" +
        "门锁是好的，房间里一切如常——但如果有人在你睡着之后进来过……",
      next: "c4_morning2_last"
    },

    c4_morning2_last: {
      type: "narration",
      bg: "bedroom",
      speaker: "你",
      text: "「……他们在确认我的住址。」",
      next: "c4_morning3"
    },

    c4_morning3: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "你把外套放在桌上，换了一件干净的。阳光照在脸上，但你觉得自己后背是凉的。" +
        "你走了几步，又停下来回头看了一眼房门——门上没有任何痕迹，锁也没有损坏。但你心里知道有人来过。" +
        "你没有联系 CTO，也没有联系少年。你只是继续往前走，手一直插在口袋里，攥着超脑——" +
        "像一个只有你自己知道的、小小的防御姿势。",
      toast: "第四章 · 完",
      next: "c5_certify"
    },

    /* =================================================================
     * 第五章 · 事件①：开除 · 毫无预兆
     * ================================================================= */

    c5_certify: {
      type: "narration",
      bg: "workstation",
      speaker: "旁白",
      text:
        "下午。公司办公室。主管把一份文件推到你的面前——没有解释，没有铺垫。",
      chapter: {
        num: "第五章",
        name: "密钥 · 终局",
        subname: "THE FINAL KEY"
      },
      next: "c5_fired"
    },

    c5_fired: {
      type: "dialog",
      bg: "workstation",
      speaker: "主管",
      text:
        "「公司结构调整，这是你的离职通知，补偿金按 N+1 走，今天下班前把工牌交到人事。」" +
        "你盯着那份文件看了很久。「……原因？」「我不知道。上面批的。」",
      choices: [
        { text: "收起文件，收拾东西", next: "c5_leave_office" }
      ]
    },

    c5_leave_office: {
      type: "narration",
      bg: "lobby",
      speaker: "旁白",
      text:
        "你没有争辩。你收拾了自己的桌面——东西不多，一个小盒子就装完了。" +
        "你走出公司大门时，阳光正烈。你站在门口停了一会儿，没有说话。" +
        "你没有怀疑 CTO——这个决定太快了，不像 CTO 的风格。但你心里隐约知道，这和最近的一切都有关系。",
      next: "c5_home_door"
    },

    c5_home_door: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "你回到公寓，楼道里的声控灯坏了，只有尽头窗户透进一点城市的光。" +
        "你拐过转角，站住了。走廊尽头正对着你房门的那面墙上，" +
        "被人用荧光喷漆喷了一行字——字迹潦草，但每一笔都压得很深，荧光绿在昏暗的走廊里幽幽发着光。",
      next: "c5_note"
    },

    c5_note: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "「人在我这。」你站在几米外，没有靠近。门锁是好的。你又看回那行字，" +
        "荧光绿映在你的瞳孔里，边缘处有一滴漆正顺着墙面慢慢往下滑。" +
        "你开了门，进屋，关门，但没有开灯。你站在门后，透过猫眼往外看了一眼——" +
        "走廊空空的，那行字还亮着。",
      next: "c5_cto_msg"
    },

    c5_cto_msg: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "然后你的超脑震了一下——一条语音消息，来自 CTO。你点开，放在耳边。" +
        "「别来公司。他们已经查到你的编号了。你把密钥毁了，然后躲起来。」" +
        "消息很短，然后断了。你放下超脑，又听了一遍。第二遍时，你注意到背景里有一个细微的、有规律的电子音——" +
        "「滴——滴——滴——」，节奏平稳。你认得那个声音——那是身体扫描仪运行时的信号音。",
      next: "c5_decision"
    },

    c5_decision: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "你站在公寓门口，手里攥着那张荧光字的照片，耳朵里是 CTO 的语音，" +
        "心里的结论只有一个——有人在等你。你穿上外套，把超脑收进口袋，推开房门。" +
        "荧光字还在墙上亮着。你没有犹豫太久。",
      toast: "目的地：超体公司总部",
      next: "c5_elevator"
    },

    /* =================================================================
     * 第五章 · 事件②：电梯 · 已经在等了
     * ================================================================= */

    c5_elevator: {
      type: "narration",
      bg: "lobby",
      speaker: "旁白",
      text:
        "超体公司总部，傍晚。玻璃幕墙外天色将暗未暗。你走进大厅，" +
        "正中间那部电梯的门正在缓缓合上——但在你靠近时又自动打开了，像是在等你。" +
        "电梯里空无一人。你走进去，面板上只亮着一个楼层：顶层。" +
        "你没有收到任何阻拦。电梯上升的时间比预想中长，你站在轿厢里，" +
        "看着楼层数字一格一格跳动，手放在口袋里，握着那枚密钥的存储装置。",
      next: "c5_suite"
    },

    /* =================================================================
     * 第五章 · 事件③：主理人 · 座位上的老人
     * ================================================================= */

    c5_suite: {
      type: "narration",
      bg: "office",
      speaker: "旁白",
      text:
        "电梯门打开。顶层走廊空无一人，只有尽头一扇敞开的大门，灯光从里面透出来。你走了进去。" +
        "顶层办公室。一面巨大的落地窗俯瞰整个城市，天色正从深蓝过渡到漆黑。",
      next: "c5_showdown"
    },

    c5_showdown: {
      type: "narration",
      bg: "office",
      speaker: "旁白",
      text:
        "房间中央放着一张老式木桌。桌后坐着一个老人——头发花白，身形枯瘦，穿着讲究的深色西装，" +
        "脸上的皮肤松弛但眼神异常锐利。他姿势很放松，像是等了很久。" +
        "CTO 站在他身后一侧，表情平静到近乎空茫，既没有看你，也没有看主理人，像一尊封了壳的雕塑。" +
        "伙伴被两个安保人员押在另一侧，被按在椅子上坐着，嘴角有一点血迹，衣服上有灰，" +
        "但眼睛还是亮的——看到你时张了张嘴，没有出声。",
      next: "c5_showdown2"
    },

    c5_showdown2: {
      type: "dialog",
      bg: "office",
      speaker: "主理人",
      text:
        "门在你身后缓缓合上。主理人没有站起来，他只是抬了一下手，示意那两把空椅子中的一把。" +
        "「坐。」你没有坐。他像是早就预料到你的反应，轻轻笑了一下，" +
        "把手放在桌面上，慢悠悠地开口——" +
        "「我不需要知道你是怎么做到的，也不需要知道那把钥匙到底是什么原理。我只需要你把它交给我。」",
      choices: [
        { text: "……", next: "c5_showdown3" }
      ]
    },

    c5_showdown3: {
      type: "dialog",
      bg: "office",
      speaker: "主理人",
      text:
        "他朝伙伴的方向微微偏了一下头。" +
        "「你把它给我，那个孩子可以走出这扇门。你不给——」" +
        "「他就留在这里。」他说得很随意，像在说一件微不足道的小事。" +
        "你看了一眼伙伴，又看了一眼 CTO——CTO 依然没有看你。" +
        "「……他为什么不动？他为什么不说话？」",
      choices: [
        {
          id: "give_key",
          label: "🔑 交出密钥",
          description: "把密钥放在桌上，换取伙伴的安全",
          next: "c5_give",
          weight: { conscience: 0 }
        },
        {
          id: "keep_key",
          label: "✋ 不交",
          description: "拒绝交出，伙伴面临危险",
          next: "c5_keep",
          weight: { conscience: 2, infamy: 0 }
        },
        {
          id: "fight",
          label: "⚡ 放手一搏",
          description: "联动多人的义肢，同时发起攻击",
          next: "c5_fight_game",
          weight: { conscience: 3, infamy: 1 }
        }
      ]
    },

    /* ---------- 分支 A：交出密钥 ---------- */

    c5_give: {
      type: "narration",
      bg: "office",
      speaker: "旁白",
      text:
        "你沉默了很久，然后把手伸进口袋，取出那枚密钥存储装置，放在桌上。" +
        "金属接触桌面时发出一声清脆的声响。主理人拿起密钥，端详了一下，" +
        "脸上那种从容的笑意没有消失，反而像是终于等到了这一刻的满意。",
      next: "c5_give2"
    },

    c5_give2: {
      type: "narration",
      bg: "office",
      speaker: "主理人",
      text:
        "「你做了一个明智的决定。不过，既然你已经到了这里——我不妨再给你一个选择。」" +
        "他偏了偏头，示意旁边的安保人员松开伙伴。伙伴被放开后踉跄了一下，" +
        "但没有走向门口，而是看向你，像是等你一起走。" +
        "「这份密钥背后的数据结构和权限协议——你应该明白它的价值。我把它收回去，" +
        "你变成普通人，回到原来的工位、原来的薪水。那是你本来应该走的路。」",
      next: "c5_give3"
    },

    c5_give3: {
      type: "dialog",
      bg: "office",
      speaker: "主理人",
      text:
        "「但如果你愿意留下来——你不是没有义肢吗。我可以给你装一副最好的，" +
        "比你现在能想象到的任何型号都要好。你会拥有你想要的权限、收入、社会位置。」" +
        "「那个孩子我放他走，分毫不伤。至于你——你可以选择不做那批被优化的员工。" +
        "你可以做那个参与优化的人。」" +
        "他说话的语气一直很轻，像是在描述一件确定会发生的事。" +
        "「你只需要告诉我——你想回到原来的生活，还是想要一个新的身份。」",
      choices: [
        {
          id: "accept_offer",
          label: "🏢 接受",
          description: "留在超体公司，获得财富和义肢",
          next: "ending_a1",
          weight: { conscience: -2, infamy: 3 }
        },
        {
          id: "reject_offer",
          label: "🚶 拒绝",
          description: "只要伙伴安全，转身离开",
          next: "ending_a2",
          weight: { conscience: 1 }
        }
      ]
    },

    /* ---------- 分支 B：不交 ---------- */

    c5_keep: {
      type: "narration",
      bg: "office",
      speaker: "旁白",
      text:
        "你没有动。你看着主理人的眼睛，声音不大但很稳：「不给。」" +
        "主理人脸上的笑没有消失，只是淡了一点。他朝安保人员点了一下头。" +
        "安保人员的手按住了伙伴的肩膀，伙伴咬紧牙没有出声，但肩膀在发抖。" +
        "你手里还有密钥，CTO 站在对面，没有动，没有看你，什么都没有。",
      next: "c5_keep_stare"
    },

    c5_keep_stare: {
      type: "narration",
      bg: "office",
      speaker: "旁白",
      text:
        "沉默蔓延了几秒。然后你看到主理人的右手——那只苍老的、没有任何义肢的手——" +
        "轻轻抬了一下。两个安保从门外走进来，把你和伙伴隔开。" +
        "你握紧了口袋里的密钥存储装置，感觉到金属的凉意贴在掌心。" +
        "你做出了选择。无论代价是什么。",
      toast: "",
      next: "ending_b"
    },

    /* ---------- 分支 C：放手一搏 ---------- */

    c5_fight_game: {
      type: "minigame",
      bg: "office",
      minigame: "multiTap",
      config: {
        targets: 4,
        timeLimit: 8000,
        prompt: "在限定时间内快速点击所有目标点，联动多人义肢发起冲击。"
      },
      onComplete: "c5_fight_done"
    },

    c5_fight_done: {
      type: "narration",
      bg: "office",
      speaker: "旁白",
      text:
        "你看着主理人那张老迈而从容的脸，又看了一眼 CTO 依然低垂的眼睛。" +
        "然后你闭上了眼睛——连接，搜索，锁定。" +
        "一道信号扰动在一瞬间扫过了大厅里每一个义肢接口。" +
        "安保人员的右臂微微抬起。CTO 的左手指节颤了一下。" +
        "主理人面前的杯子挪动了半寸。" +
        "就在这个空隙里，你向前迈了一步，伸手抓向桌面上的密钥。",
      toast: "",
      next: "ending_c"
    },

    /* =================================================================
     * 结局 A1：高位 · 熟悉的身影
     * ================================================================= */

    ending_a1: {
      type: "narration",
      bg: "office",
      speaker: "旁白",
      text:
        "你看着主理人掌心里的密钥，又看了一眼神情肃穆的 CTO。" +
        "「……我留下来可以。那个孩子的未来也要归我决定。」" +
        "主理人语气轻松：「可以谈。」",
      toast: "",
      next: "ending_a1_2"
    },

    ending_a1_2: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "几年后。超体公司总部，某层新建的科研实验室。玻璃幕墙外是城市不变的霓虹天际线。" +
        "你穿着深色外套，站在观察窗前，手里端着一杯温度刚好的咖啡。" +
        "你已经算是超体公司内部一个不算低的位置了。主理人兑现了承诺——" +
        "你拥有一副顶级义肢，从外表看不出任何痕迹。" +
        "少年被安排进一个定向培养计划，每隔几个月会发来一条简短的消息，语气和以前一样。",
      next: "ending_a1_3"
    },

    ending_a1_3: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "实验室里正在推进新的测试项目。你隔着玻璃看到一排排试验台，" +
        "上面躺着不同改造程度的身体。你以前会觉得这一幕刺眼，现在你已经习惯了。" +
        "你喝完最后一口咖啡，正要转身离开时——余光扫到靠角落的一个试验台。" +
        "那具研究体的颈部左侧，有一道极淡的疤痕——旧手术痕迹，" +
        "被仿真皮肤覆盖了薄薄一层。那道疤痕的形状和位置，" +
        "和你记忆里某一晚炉火旁看到的轮廓完全一致。",
      next: "ending_a1_4"
    },

    ending_a1_4: {
      type: "narration",
      bg: "dark",
      speaker: "你",
      text: "「……不可能是他。」",
      next: "ending_a1_4_narr"
    },

    ending_a1_4_narr: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "你走近了一步。玻璃上倒映出自己的影子，" +
        "和那具研究体的轮廓重叠在一起。侧面、下颌线、肩膀宽度——" +
        "你的视线扫过那些细节，像是扫描一样精准，但脑子拒绝给这些细节下结论。" +
        "你低头看了一眼自己手里的咖啡杯，手指握得很稳，没有抖。",
      next: "ending_a1_4_last"
    },

    ending_a1_4_last: {
      type: "narration",
      bg: "dark",
      speaker: "你",
      text: "「……我说过他会平安的。」",
      next: "ending_a1_5"
    },

    ending_a1_5: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "你没有再走近。你转身，把咖啡杯放进回收槽，走出了实验室。" +
        "走廊尽头的灯亮了一盏，照在你的肩膀上，你的影子在地面上拉得很长。" +
        "身后那间实验室的灯光缓缓暗下去。",
      toast: "— 结局 A1：高位 · 完 —",
      next: null
    },

    /* =================================================================
     * 结局 A2 / B：梦醒 · 什么都没有发生
     * ================================================================= */

    ending_a2: {
      type: "narration",
      bg: "office",
      speaker: "你",
      text: "「……把该放的人放了就好。别的我不要。」",
      next: "ending_a2_narr"
    },

    ending_a2_narr: {
      type: "narration",
      bg: "office",
      speaker: "旁白",
      text:
        "你看了伙伴一眼，摇了摇头。" +
        "主理人像在确认：「你确定？」",
      next: "ending_a2_last"
    },

    ending_a2_last: {
      type: "narration",
      bg: "office",
      speaker: "你",
      text: "「确定。」",
      next: "ending_a2_last_act"
    },

    ending_a2_last_act: {
      type: "narration",
      bg: "office",
      speaker: "旁白",
      text: "你没有回头看 CTO，转身朝门口走去。伙伴跟在你身后，两个人消失在走廊的光线里。",
      toast: "",
      next: "ending_a2_2"
    },

    ending_a2_2: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "回去之后的日子很长，也很短。你靠之前的积蓄活了一段时间，" +
        "后来找了一份不需要太多存在感的工作，收入不高，但也不至于饿死。" +
        "少年平安无事，但很少再联系了。你没有去找他，觉得没有必要。",
      next: "ending_a2_3"
    },

    ending_a2_3: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "一天傍晚，你洗完澡坐在床边，超脑屏幕亮着，上面显示着一条「已离职」的状态更新。" +
        "你准备关掉时，忽然感到一阵困意。你没有设闹钟，只是躺了下来，闭上了眼睛。",
      next: "ending_a2_4"
    },

    ending_a2_4: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "你做了一个梦。梦里还是那间板房，灯泡换了新的，比原来亮一些。" +
        "少年坐在桌边，嘴里咬着一根细电线，正低头焊一块板子，含糊不清地说着什么。" +
        "CTO 坐在他对面，拿着一个零件看了看，说「你焊反了」，少年「唔」了一声，拆了重来。" +
        "你坐在旁边，手边放着一杯酒，看着他们两个，什么也没说。" +
        "少年抬起头来喊你：「你发什么呆，酒都凉了。」CTO 没有抬头，但嘴角动了一下。",
      next: "ending_a2_5"
    },

    ending_a2_5: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "你想开口说话，但你发现自己发不出声音。你只是看着他们——一张熟悉的脸，另一张熟悉的脸。" +
        "灯光昏黄而温暖，桌上摊着零件和图纸，啤酒瓶倒了一个，没有人在意。" +
        "你意识到自己在做梦，也意识到这个梦会醒。但你有没有急着睁开眼睛。",
      next: "ending_a2_5_thought"
    },

    ending_a2_5_thought: {
      type: "narration",
      bg: "dark",
      speaker: "你",
      text: "「……能久一点就好了。」",
      next: "ending_a2_6"
    },

    ending_a2_6: {
      type: "narration",
      bg: "bedroom",
      speaker: "旁白",
      text:
        "然后你醒了。窗帘缝里透进来一点灰白色的天光，不知道是早晨还是傍晚。" +
        "你躺着没有动，看着天花板，呼吸很平。过了很久，你翻了个身，" +
        "把脸埋进枕头里，没有再睡。空荡的房间里，超脑屏幕已经黑了，" +
        "窗外是城市不变的、灰白色的天空。",
      toast: "— 结局 A2/B：梦醒 · 完 —",
      next: null
    },

    ending_b: {
      type: "narration",
      bg: "office",
      speaker: "旁白",
      text:
        "你被按在了椅子上。密钥存储装置从你口袋中被取走。" +
        "主理人拿在手里端详了片刻，然后抬起头看向 CTO，微微点了一下头。" +
        "你没有看到 CTO 的表情。一切都结束得太快，快到你甚至没有来得及想清楚。" +
        "你的意识被切断前，最后看到的画面是——少年被安保人员带出房间，" +
        "他回头看了你一眼。那个眼神里没有责备，只有一种你以前从未在那张年轻的脸上看到过的东西。" +
        "像是告别。",
      toast: "",
      next: "ending_a2_2"
    },

    /* =================================================================
     * 结局 C：放手一搏 · 未完成的画面 + 夜归人
     * ================================================================= */

    ending_c: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "画面切断了。黑屏持续了数秒。然后黑屏上缓缓出现一行小字——",
      toast: "",
      next: "ending_c_black"
    },

    ending_c_black: {
      type: "narration",
      bg: "dark",
      speaker: "",
      text:
        "没有人知道那天晚上那间办公室里发生了什么。",
      toast: "— — —",
      next: "ending_c_return"
    },

    ending_c_return: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "一段时间之后。贫民窟那间小屋，灯泡换了新的，比原来亮一些。门开着，" +
        "屋内的光斜斜地铺在门口的泥地上。CTO 坐在桌边，面前摊着一块拆了一半的旧电路板，" +
        "焊枪搁在手边，但他没有在动手——只是安静地坐着，像是在等某个时间点。",
      next: "ending_c_boy_arrive"
    },

    ending_c_boy_arrive: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "远处传来脚步声。由远及近，不紧不慢。CTO 没有抬头，但听了一会儿，" +
        "嘴角有一丝难以察觉的松动。脚步声更近了，然后多了一道——更轻快、更碎，" +
        "像是一路小跑过来的。少年从夜色里冒出来，手里拎着两瓶酒，" +
        "还没进屋就喊起来——「你看我带什么来了——便利店最后一瓶那个贵的！老板说我再赊账就打断我腿，但我跑得快！」",
      next: "ending_c_boy_in"
    },

    ending_c_boy_in: {
      type: "dialog",
      bg: "dark",
      speaker: "CTO",
      text:
        "他像一阵风刮进屋，把酒往桌上一放。CTO 抬眼看他，声音里有一层极淡的笑意——" +
        "「跑得快也没见你把那节电路焊对过。」少年正要反驳，忽然顿住了——他转过头，看向门外。",
      choices: [
        { text: "……", next: "ending_c_you_arrive" }
      ]
    },

    ending_c_you_arrive: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "夜色里又多了一道脚步声。比少年的步子慢一些，沉一些，像是走了很长的一段路才来到这里。" +
        "那道身影从暗处走进屋前的灯光里，轮廓逐渐清晰。CTO 也侧过头，看到了那个身影——" +
        "他没有站起来，但搭在桌沿的手指微微收拢了一下。",
      next: "ending_c_you_speak_act"
    },

    ending_c_you_speak_act: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "少年张了张嘴，一时没找到合适的话——「……你……你怎么……」" +
        "你走进门，把那句话接了过去。语气很轻，像是随手捡起一个再普通不过的话题——",
      next: "ending_c_you_speak"
    },

    ending_c_you_speak: {
      type: "dialog",
      bg: "dark",
      speaker: "你",
      text: "「……路过。顺便看看你们还活着没。」",
      choices: [
        { text: "坐下来", next: "ending_c_final" }
      ]
    },

    ending_c_final: {
      type: "narration",
      bg: "dark",
      speaker: "旁白",
      text:
        "少年愣了两秒，然后猛地别过脸去，假装在看桌上的电路板。" +
        "CTO 低下头，把那块拆了一半的板子翻了个面，像是在找一条不存在的线路，" +
        "没有让任何人看清他的表情。炉火烧得很暖，门没有关，夜风从外面灌进来，" +
        "吹得灯泡微微晃动，屋内的光影也跟着晃了一下，落在三个人的肩膀上。" +
        "没有人再说话。但酒瓶已经被打开了。" +
        "桌面上三只杯子被推到一起，炉火在墙上投出暖暖的轮廓。" +
        "屋外的夜色仍然又深又长，但屋内的灯亮着。",
      toast: "— 结局 C：夜归人 · 完 —",
      next: null
    }
  }
};
