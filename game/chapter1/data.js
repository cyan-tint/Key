/* ============================================================================
 * 《密钥》· 第一章 · 剧本数据
 * 节点：c1_certify → c2_certify（章节过渡）
 * ========================================================================== */

window.STORY = {
  start: "c1_certify",

  nodes: {
    /* ---------- 事件①：现实印证 ---------- */
    c1_certify: {
      type: "narration", bg: "lobby", speaker: "旁白",
      text: "次日早晨。公司大厅的公告屏上滚动着裁员名单，荧光蓝的字在灰白色墙壁上跳动。你站在屏前，目光从名单顶端往下扫——没有你的名字。但老林的名字在倒数第三行。",
      toast: "翌日 08:42 · 公司大厅",
      chapter: { num: "第一章", name: "密钥 · 觉醒", subname: "THE KEY AWAKENS" },
      next: "c1_lin"
    },
    c1_lin: {
      type: "dialog", bg: "lobby", speaker: "旁白",
      text: "走廊尽头，老林抱着纸箱迎面走来。纸箱里有几本书、一个马克杯和一盆快枯死的绿萝。他看见你，停了一下，腾出一只手拍了拍你的肩膀。",
      popup: null,
      choices: [{ text: "……林哥。", next: "c1_lin_talk" }]
    },
    c1_lin_talk: {
      type: "dialog", bg: "lobby", speaker: "老林",
      text: "「哟，你还在啊。下午走了。」他用下巴指了指纸箱。「你小子运气好，名单上没你。」",
      choices: [{ text: "「嗯。你……」", next: "c1_lin_gone" }]
    },
    c1_lin_gone: {
      type: "narration", bg: "lobby", speaker: "旁白",
      text: "他摆了摆手，从你身边走过。脚步声在走廊里慢慢变远。你看着他的背影转进电梯间，纸箱上的绿萝叶子轻轻晃了一下。",
      next: "c1_drawer"
    },
    c1_drawer: {
      type: "narration", bg: "workstation", speaker: "旁白",
      text: "你回到工位，拉开抽屉。那份报告已经被抽走了，取而代之的是一张新的考勤表。但你注意到纸面上多了一个模糊的红笔圈——正好圈在你名字的位置。你合上抽屉，靠在椅背上，看着屏幕角落里那个安安静静的密钥图标。",
      next: "c1_drawer2"
    },
    c1_drawer2: {
      type: "narration", bg: "workstation", speaker: "你",
      text: "「……原来真的能改变。」",
      next: "c1_comp_intro"
    },

    /* ---------- 事件②：体恤金 ---------- */
    c1_comp_intro: {
      type: "narration", bg: "bedroom", speaker: "旁白",
      text: "当晚，你躺在床上，又打开了那个密钥界面。屏幕上多了一个【已连接设备】列表。列表中显示着——「经理·张」，旁边有一行小字标注：「可重复连接」。你点了进去。",
      toast: "已连接设备 · 1 项",
      next: "c1_comp_switch"
    },
    c1_comp_switch: {
      type: "narration", bg: "office", speaker: "旁白",
      text: "画面再次切到经理的义肢视角。桌面上摊着一份「遣散员工补偿金审批表」。老林的名字在上面——补偿金额被改成了最低标准。",
      next: "c1_comp_game"
    },
    c1_comp_game: {
      type: "minigame", bg: "office",
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
      type: "narration", bg: "bedroom", speaker: "旁白",
      text: "你移动义肢手指，将金额从「最低」划到「两倍」。系统弹出「修改已保存」。你断开连接，把超脑放在床头，关掉了灯。",
      next: "c1_comp_thought"
    },
    c1_comp_thought: {
      type: "narration", bg: "bedroom", speaker: "你",
      text: "「……这样对得起他了。」「今天算是做了件好事吧。」",
      next: "c1_debt_intro"
    },

    /* ---------- 事件③：赊账清除 ---------- */
    c1_debt_intro: {
      type: "narration", bg: "bedroom", speaker: "旁白",
      text: "第三天晚上。你又打开了密钥界面，这次你注意到了另一个按钮——【随机连接附近义肢】。你犹豫了几秒，按了下去。",
      toast: "正在扫描附近设备……",
      next: "c1_connect_conv"
    },
    c1_connect_conv: {
      type: "narration", bg: "convenience", speaker: "系统",
      text: "画面切换。你的视角变成了便利店收银台。老板正坐在柜台后面清点零钱，义肢手搭在终端面板上。屏幕上显示着赊账记录页面——你在列表中间看到了自己的名字。",
      toast: "已连接：便利店·陈 的义肢右臂（收银终端联动型）",
      next: "c1_debt_game"
    },
    c1_debt_game: {
      type: "minigame", bg: "convenience",
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
      type: "narration", bg: "bedroom", speaker: "旁白",
      text: "数字「¥287」闪烁了两下，然后归零。你断开连接，盯着屏幕上空掉的赊账行看了很久。",
      next: "c1_debt_thought"
    },
    c1_debt_thought: {
      type: "narration", bg: "bedroom", speaker: "你",
      text: "「……好，这下两清了。」「……反正他店那么大，少一笔赊账也不会发现。」你关掉了灯。",
      next: "c1_police_intro"
    },

    /* ---------- 事件④：警察枪击 ---------- */
    c1_police_intro: {
      type: "narration", bg: "bedroom", speaker: "旁白",
      text: "几天后的一个深夜。你像往常一样躺在床上，打开了密钥界面。手指悬在【随机连接附近义肢】上，轻轻按了下去。",
      next: "c1_shoot_connect"
    },
    c1_shoot_connect: {
      type: "narration", bg: "bedroom", speaker: "系统",
      text: "画面切换——视角剧烈晃动，有风声和远处急促的喊叫声。你在一条昏暗的巷道里。义肢的手臂上有警徽的纹路，反射着远处霓虹的微光。",
      toast: "已连接：警员·马 XX-12 型执法义肢",
      next: "c1_shoot_game"
    },
    c1_shoot_game: {
      type: "minigame", bg: "bedroom",
      minigame: "shoot",
      config: {
        prompt: "瞄准巷道尽头的身影，扣下扳机。",
        hitResult: "一声枪响，有人倒下。信号中断……"
      },
      onComplete: "c1_end"
    },
    c1_end: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "枪声在巷道里回荡，画面猛地暗了下来。你猛地从床上坐起，大口喘气。窗帘被风吹动，窗外隐约有警笛声逼近。你低头看着自己的双手——没有血，没有硝烟，只是那双普通的、什么都没做的手。",
      next: "c1_end2"
    },
    c1_end2: {
      type: "narration", bg: "dark", speaker: "你",
      text: "「我刚才……开枪了？」「我杀了人？」「……我只是想玩一下……我没想！」",
      next: null
    }
  }
};

/* 引擎配置 */
window.GAME_CONFIG = {
  startNode: "c1_certify",
  endMessage: "— 第一章 · 完 —　点击任意处重新接入",
  moodMap: {
    workstation: "../assets/images/bg-workstation.png",
    bedroom: "../assets/images/bg-bedroom.png",
    office: "../assets/images/bg-office.png"
  }
};
