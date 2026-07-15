/* ============================================================================
 * 《密钥》· 第二章 · 剧本数据
 * 节点：c2_certify → c2_repair_done
 * ========================================================================== */

window.STORY = {
  start: "c2_certify",

  nodes: {
    /* ---------- 事件①：随机连接 · 被拉入巷道 ---------- */
    c2_certify: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "几天后的傍晚。你下班后独自走在街上，街道两旁的霓虹灯开始亮起，空气里混着油烟和潮湿的混凝土气味。你停下脚步，四下看了看——没什么人注意你。你打开密钥界面，点了一下随机连接。",
      toast: "熟练度达标 · 链接限制已解除",
      chapter: { num: "第二章", name: "密钥 · 代价", subname: "THE PRICE OF POWER" },
      next: "c2_connect"
    },
    c2_connect: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "画面切换。一股强烈的晕眩感传来——视角正在快速移动，视线上下颠簸，显然是在奔跑。周围是逼仄的巷道，两侧是锈蚀的金属墙和密如蛛网的管线，头顶晾晒的衣物在风里摆动。远处有孩子的哭声和断断续续的机器轰鸣。",
      toast: "已连接：医生·阿毅，义肢右臂（AX-07 医疗终端联动型）",
      next: "c2_arrive"
    },
    c2_arrive: {
      type: "dialog", bg: "dark", speaker: "女人",
      text: "「快！这边！快点！」视角被一个女人拽着快步往前走。她的手很紧，指甲陷进义肢的金属外壳里，发出轻微的刮擦声。",
      choices: [{ text: "……", next: "c2_inside" }]
    },
    c2_inside: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "你还没来得及想清楚，视角已经被拉进了一栋低矮的金属板房。板房内部狭小昏暗，一盏旧灯泡挂在顶上，光线昏黄。四壁贴满了泛黄的画纸，歪歪扭扭的蜡笔线条画着房子、太阳、三个人。角落里有一张行军床，床上躺着一个人，面色灰白，呼吸急促，腹部缠着渗血的绷带。",
      next: "c2_face"
    },

    /* ---------- 事件②：看清面孔 ---------- */
    c2_face: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "女人松开义肢手，快步走到床边蹲下，握住床上人的手。你通过医生的眼睛，看清了床上人的脸——",
      next: "c2_face2"
    },
    c2_face2: {
      type: "narration", bg: "dark", speaker: "你",
      text: "「是他。我开枪打的那个人。」「他没死……？」那人的脸和你断开连接前看到的最后一幕重合了。你感觉自己的呼吸变重了。",
      next: "c2_talk"
    },

    /* ---------- 事件③：床边的对话 ---------- */
    c2_talk: {
      type: "dialog", bg: "dark", speaker: "女人",
      text: "「阿毅医生，求你看看他……他前天被人打了，一直没醒……」",
      choices: [{ text: "……", next: "c2_talk2" }]
    },
    c2_talk2: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "女人被病人轻声劝出房间，临走前回头看了一眼医生，眼神复杂。房间只剩下病人和医生（你的视角）。病人用尽力气撑起半个身子，看着你，嘴唇干裂。",
      next: "c2_patient"
    },
    c2_patient: {
      type: "narration", bg: "dark", speaker: "病人",
      text: "「我没办法。我不是坏人。但我没办法。」「我活不了多久了……我知道的。」「阿毅医生，我知道你什么都看得明白。」他伸出手，抓住医生的义肢手腕——金属和皮肤接触的声音在狭小的房间里格外清晰。「帮我开一份死亡证明。说我是被警察打死的。那样我老婆孩子……能拿到赔偿金。」他停顿了一下，声音更轻了。「就当……你什么都没看见。」",
      next: "c2_patient2"
    },
    c2_patient2: {
      type: "narration", bg: "dark", speaker: "你",
      text: "你通过医生的眼睛看着那张脸——那是一个你亲手伤害过的人。现在这个人正在哀求一份「被正义杀死」的假证明。「他是在求我帮他死。不是治病，是帮他死得有价值。」「那份报告是我开的枪。现在我又有机会决定他的结局。」你第一次觉得，自己在那间卧室里获得的「神权」，不是一件玩具了。",
      next: "c2_wife"
    },

    /* ---------- 事件④：妻子的折返 ---------- */
    c2_wife: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "女人没有真的离开。她在门外站了一会儿，又推门进来了。她看了一眼丈夫，又看向医生，声音很小但很稳。",
      next: "c2_wife2"
    },
    c2_wife2: {
      type: "dialog", bg: "dark", speaker: "女人",
      text: "「阿毅医生……你别听他的。他胡说的。他这几天发烧，说胡话。」她抬头看向你，眼眶是红的。「他还能治。你治过的，你记得吗？上次我们隔壁老赵也是这样的伤，你把他救回来了。求求你……」",
      choices: [{ text: "……", next: "c2_wife3" }]
    },
    c2_wife3: {
      type: "dialog", bg: "dark", speaker: "女人",
      text: "她回头看了一眼床上的丈夫，又转回来。「你说什么假证明……他只是一时糊涂。你帮他治，我……我还能筹钱的。我去借，我去……我去打工。你救救他。」病人没有说话，只是看着你。房间安静了几秒，只有灯泡的电流声。",
      next: "doctor_choice"
    },

    /* ---------- 核心选择 ---------- */
    doctor_choice: {
      type: "dialog", bg: "dark", speaker: "你",
      text: "灯泡的电流声在安静中格外清晰。女人含着泪看着你，病人在床上微弱地呼吸。你的手——不，是医生的手——悬在半空。",
      choices: [
        { id: "heal", label: "🔬 医治", description: "选择救治病人", next: "c2_heal", weight: { conscience: 2 } },
        { id: "certificate", label: "📄 开具证明", description: "帮助病人'以死换赔偿'", next: "c2_certificate", weight: { infamy: 2 } },
        { id: "leave", label: "🚪 沉默离开", description: "断开连接，什么也不做", next: "c2_leave", weight: { conscience: -1, infamy: 1 } }
      ]
    },

    /* ---------- 分支 A：医治 ---------- */
    c2_heal: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "女人被请到门外等候。你操控医生的义肢手，揭开病人腹部的绷带，露出伤口。两副义肢手悬在伤口上方，金属关节微微转动，发出细密的机械声。",
      next: "c2_heal_game"
    },
    c2_heal_game: {
      type: "minigame", bg: "dark", minigame: "surgery",
      config: { fragments: 3, prompt: "点击伤口内的子弹碎片，夹取到托盘上。" },
      onComplete: "c2_heal_done"
    },
    c2_heal_done: {
      type: "narration", bg: "dark", speaker: "病人",
      text: "「……谢谢。」最后一次金属碎片落入托盘时，病人轻轻吐出一口气。女人在门外哽咽着道谢。主角看着那双义肢手——金属手指上沾着血迹，在灯光下暗红发亮。",
      next: "c2_faint"
    },

    /* ---------- 分支 B：开具证明 ---------- */
    c2_certificate: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "病人闭上眼睛，女人在门外没有进来。你操控医生的义肢手，走到桌边，打开义肢终端。屏幕亮起，显示一份死亡证明模板。",
      next: "c2_cert_game"
    },
    c2_cert_game: {
      type: "minigame", bg: "dark", minigame: "signCertificate",
      config: {
        patientName: "李国强",
        causeOfDeath: "警用器械误伤",
        prompt: "在签名栏拖拽滑动，签署死亡证明。"
      },
      onComplete: "c2_cert_done"
    },
    c2_cert_done: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "屏幕显示「已归档」。病人轻轻说了一声「谢谢」。主角断开连接前，看到自己的义肢手——金属手指，指节上刻着编号 AX-07。",
      next: "c2_disconnect"
    },
    c2_disconnect: {
      type: "narration", bg: "bedroom", speaker: "你",
      text: "「我又杀了他一次。第一次是枪，这一次是笔。」「我在这具身体里，做完了这件事。」你断开连接，躺回床上。窗外的霓虹灯光透过窗帘照在天花板上，像一道寂静的伤口。",
      next: "c2_faint"
    },

    /* ---------- 分支 C：沉默离开 ---------- */
    c2_leave: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "你没有回答任何人。你的意识从医生的义肢中抽离——画面回到你自己的视角，你站在街头，周围车流和人流仍然在流动。你站在那里，没有打开超脑。",
      next: "c2_leave_thought"
    },
    c2_leave_thought: {
      type: "narration", bg: "dark", speaker: "你",
      text: "「我什么都没做。我离开了。」「我走了以后，他们怎么办？」你站在那里很久。行人从你身边流过，没有人注意到你。你最后看了一眼那个巷道的方向，然后转身走了。",
      next: "c2_faint"
    },

    /* ---------- 事件⑤：晕倒 · 被捡走 ---------- */
    c2_faint: {
      type: "narration", bg: "dark", speaker: "你",
      text: "「我在哪？」断开连接后，意识瞬间抽离。眼前模糊，天旋地转。你发现自己正躺在地上，头靠着某处坚硬的东西。面前是一张凑得很近的脸，一双眼睛睁得很大。",
      next: "c2_boy"
    },
    c2_boy: {
      type: "dialog", bg: "dark", speaker: "少年",
      text: "「你醒啦？你刚才倒在路边，差点被一辆送货机器人碾过去。」少年看起来十六七岁，头发有些乱，眼神很亮。他穿着一件洗得发白的旧工装外套。你注意到——他的左手是自制的义肢，金属外壳粗糙，裸露的螺丝和线路清晰可见。右手则是另一副义肢，外观更规整，外壳有划痕和修补的焊点。",
      choices: [{ text: "「……谢了。我可能是太累了。」", next: "c2_hut" }]
    },

    /* ---------- 事件⑥：小屋 ---------- */
    c2_hut: {
      type: "narration", bg: "dark", speaker: "旁白",
      text: "少年住的地方是一间极小的金属板房，但明显被精心打理过。墙上挂着各种工具和零件，桌上摊着一块半成品电路板，旁边放着螺丝刀和焊枪。角落有一台旧超脑，屏幕亮着，显示着看不懂的程序界面。整个房间有一种「正在被一个人认真对待」的秩序感。",
      next: "c2_hut2"
    },
    c2_hut2: {
      type: "dialog", bg: "dark", speaker: "少年",
      text: "「你看这个。这是我从一个废弃回收站捡的，原来是一副超体公司报废的义肢。我把它修好了装在自己手上——厉害吧？」他举起右手，手指灵活地张开又合拢，但动作偶尔会卡顿一下。「超体公司做的东西确实厉害，就是修理起来很麻烦，有些程序代码根本看不懂。」他的手再次卡顿，皱了皱眉。你低头扫到那个义肢手腕内侧有一行灰色小字：编号 AX-1072。",
      choices: [{ text: "「我回去之后看看能不能查到什么。」", next: "c2_go_home" }]
    },

    /* ---------- 事件⑦：回家 · 编号搜索 ---------- */
    c2_go_home: {
      type: "narration", bg: "bedroom", speaker: "旁白",
      text: "你告辞离开，回到自己的公寓时已经是深夜。你坐到桌边，打开超脑。屏幕角落的密钥界面还在——右下角多了一个新的文本框：「输入义肢编号以搜索连接」。你想起那个少年义肢手腕上的编号 AX-1072。犹豫了一下，把那串数字输入了搜索框。",
      toast: "正在搜索……已找到对应义肢。",
      next: "c2_repair_intro"
    },
    c2_repair_intro: {
      type: "narration", bg: "bedroom", speaker: "你",
      text: "「……他帮了我一次。我帮他解决这个卡顿，就当还人情了。」你点了连接。画面切换——进入了少年的义肢视野。视角很低，因为少年的个子本就不高。能看到少年正坐在桌边，还在埋头拆那块面板，完全没有察觉右臂的临时离线。",
      next: "c2_repair_game"
    },
    c2_repair_game: {
      type: "minigame", bg: "bedroom",
      minigame: "repairImplant",
      config: {
        modules: 3,
        prompt: "拖拽闪烁的故障代码块到回收区，修复义肢连接问题。"
      },
      onComplete: "c2_repair_done"
    },
    c2_repair_done: {
      type: "narration", bg: "bedroom", speaker: "系统",
      text: "「连接问题已修复。信号延迟：0.1 秒 → 0.01 秒。」你断开连接，靠回椅背。窗外贫民窟方向传来模糊的车声。你想起少年说话时那种亮晶晶的眼神。「……没见识。」你关掉了超脑，屏幕暗下去。",
      toast: "修复完成 · 第二章 · 完",
      next: null
    }
  }
};

/* 引擎配置 */
window.GAME_CONFIG = {
  startNode: "c2_certify",
  endMessage: "— 第二章 · 完 —　点击任意处重新接入",
  moodMap: {
    workstation: "../assets/images/bg-workstation.png",
    bedroom: "../assets/images/bg-bedroom.png",
    office: "../assets/images/bg-office.png"
  }
};
