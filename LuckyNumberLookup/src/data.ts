/** One row in the lucky number table: 4 phrases + result (吉/凶/中) */
export type LookupRow = {
  num: number;
  phrases: [string, string, string, string];
  result: "吉" | "凶" | "中";
};

/** Lookup table for numbers 1–81. Index 0 = number 1, index 80 = number 81. */
export const LOOKUP_TABLE: LookupRow[] = [
  { num: 1, phrases: ["大展宏图", "信用得固", "无边福界", "可获成功"], result: "吉" },
  { num: 2, phrases: ["根基不固", "遥遥欲坠", "一盛一衰", "劳而无功"], result: "凶" },
  { num: 3, phrases: ["根深蒂固", "蒸蒸日上", "如意吉祥", "白事顺逐"], result: "吉" },
  { num: 4, phrases: ["坎坷前途", "苦难折磨", "非有毅力", "难望成功"], result: "凶" },
  { num: 5, phrases: ["阴阳合和", "生意欣荣", "名利双收", "后福重重"], result: "吉" },
  { num: 6, phrases: ["万宝云集", "天降幸运", "立志奋发", "可成大功"], result: "吉" },
  { num: 7, phrases: ["专心经营", "和气致祥", "排除万难", "必获成功"], result: "吉" },
  { num: 8, phrases: ["努力发达", "贯彻志望", "不忘进退", "成功可期"], result: "吉" },
  { num: 9, phrases: ["虽抱奇才", "有才无命", "独营无力", "财力无望"], result: "凶" },
  { num: 10, phrases: ["乌云遮月", "暗淡无光", "空费心力", "徒劳无功"], result: "凶" },
  { num: 11, phrases: ["草木逢春", "枯叶沾露", "稳健著实", "必得人望"], result: "吉" },
  { num: 12, phrases: ["薄弱无力", "孤立无摇", "外祥内苦", "谋事难成"], result: "凶" },
  { num: 13, phrases: ["天赋吉运", "能得人望", "善用智慧", "必获成功"], result: "吉" },
  { num: 14, phrases: ["忍得苦难", "必有后福", "是成是败", "唯靠坚毅"], result: "中" },
  { num: 15, phrases: ["谦恭做事", "必得人和", "大事成就", "一定兴隆"], result: "吉" },
  { num: 16, phrases: ["能获众望", "成就大业", "名利双收", "盟主四方"], result: "吉" },
  { num: 17, phrases: ["排除万难", "有贵人助", "把握时机", "可获成功"], result: "吉" },
  { num: 18, phrases: ["经商做事", "顺利昌隆", "如能慎始", "白事亨通"], result: "吉" },
  { num: 19, phrases: ["成功虽早", "慎防亏空", "内外不合", "障碍重重"], result: "凶" },
  { num: 20, phrases: ["智高志大", "历尽艰难", "焦心忧劳", "进退两难"], result: "凶" },
  { num: 21, phrases: ["专心经营", "善用智慧", "霜雪梅花", "春来怒放"], result: "吉" },
  { num: 22, phrases: ["秋草逢霜", "怀才不遇", "忧愁怨苦", "事不如意"], result: "凶" },
  { num: 23, phrases: ["旭日升天", "名显四方", "渐次进展", "终成大业"], result: "吉" },
  { num: 24, phrases: ["锦绣前程", "须靠自力", "多用智谋", "能奏大功"], result: "吉" },
  { num: 25, phrases: ["天时地利", "再得人格", "讲信修睦", "即可成功"], result: "吉" },
  { num: 26, phrases: ["波澜起伏", "千变万化", "凌驾万难", "方可成功"], result: "中" },
  { num: 27, phrases: ["一成一败", "一盛一衰", "唯靠谨慎", "可守成功"], result: "中" },
  { num: 28, phrases: ["鱼临旱池", "难逃厄运", "此数大凶", "不如更换"], result: "凶" },
  { num: 29, phrases: ["如龙得云", "青云直上", "智谋奋进", "才略奏功"], result: "吉" },
  { num: 30, phrases: ["吉凶参半", "得失相伴", "投机取巧", "如赛一样"], result: "凶" },
  { num: 31, phrases: ["此数大吉", "名利双收", "渐进向上", "大业成就"], result: "吉" },
  { num: 32, phrases: ["池中之龙", "风云际会", "一跃上天", "成功可望"], result: "吉" },
  { num: 33, phrases: ["不可意气", "善用智慧", "如能慎始", "必可昌隆"], result: "吉" },
  { num: 34, phrases: ["灾难不绝", "难望成功", "此数大凶", "不如更换"], result: "凶" },
  { num: 35, phrases: ["中吉之数", "进退保守", "生意安稳", "成就可期"], result: "吉" },
  { num: 36, phrases: ["波澜重叠", "常陷穷困", "动不如静", "有才无命"], result: "凶" },
  { num: 37, phrases: ["逢凶化吉", "吉人天相", "风调雨顺", "生意兴隆"], result: "吉" },
  { num: 38, phrases: ["名虽可得", "利却难获", "艺界发展", "可望成功"], result: "中" },
  { num: 39, phrases: ["云开见月", "虽有劳碌", "光明坦途", "指日可期"], result: "吉" },
  { num: 40, phrases: ["一盛一衰", "浮沉不定", "知难而退", "自获天佑"], result: "中" },
  { num: 41, phrases: ["天赋吉运", "德望兼备", "继续努力", "前途无限"], result: "吉" },
  { num: 42, phrases: ["事业不专", "十九不成", "专心进取", "可望成功"], result: "中" },
  { num: 43, phrases: ["雨夜之花", "外祥内苦", "忍耐自重", "转凶为吉"], result: "中" },
  { num: 44, phrases: ["虽用心计", "事难遂愿", "贪功好进", "比招失败"], result: "凶" },
  { num: 45, phrases: ["杨柳遇春", "绿叶发枝", "冲破难关", "一举成名"], result: "吉" },
  { num: 46, phrases: ["坎坷不平", "艰难重重", "若无耐心", "难忘有成"], result: "凶" },
  { num: 47, phrases: ["有贵人助", "可成大业", "虽遇不幸", "沉浮不大"], result: "吉" },
  { num: 48, phrases: ["梅花逢时", "鹤立鸡群", "名利俱全", "繁荣富贵"], result: "吉" },
  { num: 49, phrases: ["遇吉则吉", "遇凶则凶", "唯靠谨慎", "逢凶化吉"], result: "中" },
  { num: 50, phrases: ["吉凶互见", "一成一败", "凶中有吉", "吉中有凶"], result: "中" },
  { num: 51, phrases: ["一盛一衰", "浮沉不常", "自重自处", "可保平安"], result: "中" },
  { num: 52, phrases: ["草木逢春", "雨过天晴", "渡过难关", "即获成功"], result: "吉" },
  { num: 53, phrases: ["盛衰参半", "外祥内苦", "先吉后凶", "先凶后吉"], result: "中" },
  { num: 54, phrases: ["虽倾全力", "难望成功", "次数大凶", "最好更改"], result: "凶" },
  { num: 55, phrases: ["外观昌隆", "内隐忧患", "克服难关", "开出泰运"], result: "中" },
  { num: 56, phrases: ["事与愿违", "终难成功", "欲速不达", "有始无终"], result: "凶" },
  { num: 57, phrases: ["努力经营", "时来运转", "旷野枯草", "春来开花"], result: "吉" },
  { num: 58, phrases: ["半凶半吉", "沉浮多端", "始凶终吉", "能保成功"], result: "中" },
  { num: 59, phrases: ["遇事犹疑", "难望成事", "大刀阔斧", "始可有成"], result: "凶" },
  { num: 60, phrases: ["黑暗无光", "心谜意乱", "出尔反尔", "难定方针"], result: "凶" },
  { num: 61, phrases: ["云遮半月", "百隐风波", "应自谨慎", "始保平安"], result: "中" },
  { num: 62, phrases: ["烦闷懊恼", "事事难展", "自防灾祸", "始免困境"], result: "凶" },
  { num: 63, phrases: ["万物化育", "繁荣之象", "专心一意", "可获成功"], result: "吉" },
  { num: 64, phrases: ["见异思迁", "十九不成", "徒劳无功", "不如更换"], result: "凶" },
  { num: 65, phrases: ["吉运自来", "能享盛名", "把握时机", "必获成功"], result: "吉" },
  { num: 66, phrases: ["黑夜慢长", "进退维谷", "内外不合", "信用缺乏"], result: "凶" },
  { num: 67, phrases: ["时来运转", "事事如意", "功成名就", "富贵自来"], result: "吉" },
  { num: 68, phrases: ["思虑周详", "计划力行", "不失先机", "可望成功"], result: "吉" },
  { num: 69, phrases: ["动摇不安", "常陷逆境", "不得时运", "难得利润"], result: "凶" },
  { num: 70, phrases: ["惨淡经营", "难免贫困", "此数不及", "最好改换"], result: "凶" },
  { num: 71, phrases: ["吉凶参半", "惟赖勇气", "贯彻力行", "始可成功"], result: "中" },
  { num: 72, phrases: ["厉害混淆", "凶多吉少", "得而复失", "难以安顿"], result: "凶" },
  { num: 73, phrases: ["安乐自来", "自然吉祥", "力行不懈", "终必成功"], result: "吉" },
  { num: 74, phrases: ["利不及费", "坐食山空", "如无智谋", "难忘成功"], result: "凶" },
  { num: 75, phrases: ["吉中带凶", "欲速不达", "进不如守", "可保安详"], result: "中" },
  { num: 76, phrases: ["此数大凶", "破产之象", "宜速更该", "以避厄运"], result: "凶" },
  { num: 77, phrases: ["先苦后甘", "先甘后苦", "如能守成", "不致失败"], result: "中" },
  { num: 78, phrases: ["有得有失", "华而不实", "需防劫材", "始保平安"], result: "中" },
  { num: 79, phrases: ["如走夜路", "前途无光", "希望不大", "劳而无功"], result: "凶" },
  { num: 80, phrases: ["得而复失", "枉费心机", "守成无贪", "可保安稳"], result: "中" },
  { num: 81, phrases: ["最极之数", "还本归元", "能得繁业", "发达成功"], result: "吉" },
];

/**
 * How the 1–81 lookup index is calculated:
 *
 * 1. Any number in 1–81 maps to itself (direct lookup).
 * 2. Any other positive integer: take remainder when divided by 81.
 *    - remainder 1–80 → use that as the index (1–80).
 *    - remainder 0   → use 81 (e.g. 81, 162, 243 all map to index 81).
 * 3. Formula: index = (value % 81) with the rule that 0 is treated as 81.
 *    For negative numbers we use ((value % 81) + 81) % 81 so the result
 *    is in 0–80, then 0 → 81, else use the remainder.
 *
 * Examples:
 *   - 1 → 1,  80 → 80,  81 → 81
 *   - 82 → 1 (82 % 81 = 1),  162 → 81 (162 % 81 = 0 → 81),  243 → 81
 *   - 0 → 81 (0 % 81 = 0 → 81)
 */
export function toLookupIndex(value: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  // Normalize modulo result to 0–80 even when n is negative.
  const r = ((n % 81) + 81) % 81;
  return r === 0 ? 81 : r;
}

/** Get the lookup row for a number (1–81). */
export function lookup(num: number): LookupRow {
  const index = toLookupIndex(num);
  return LOOKUP_TABLE[index - 1];
}
