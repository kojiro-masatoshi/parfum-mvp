import type {
  DiagnosisAnswers,
  MBTI,
  Perfume,
  Preference,
  Recommendation,
  ScentFamily,
} from "./types";

// --- スコア計算: 合計 100 点満点 ---
const MAX_SCORES = {
  skinConcentration: 25,
  metabolismIntensity: 15,
  dietFamily: 10,
  scene: 20,
  preference: 20,
  gender: 10,
  mbti: 10,
} as const;

// 好み回答 → 相性の良い系統
const PREFERENCE_FAMILY_MAP: Record<Preference, ScentFamily[]> = {
  爽やか: ["シトラス", "アクアティック", "フゼア"],
  甘い: ["グルマン", "オリエンタル", "フローラル"],
  落ち着いた木の香り: ["ウッディ", "シプレ"],
  スパイシー: ["オリエンタル", "ウッディ"],
  清潔感のある石鹸系: ["フローラル", "フゼア", "アクアティック"],
  "個性的・独特": ["オリエンタル", "シプレ", "グルマン"],
};

// MBTI → 相性の良い系統（簡易マッピング）
const MBTI_FAMILY_MAP: Record<Exclude<MBTI, "わからない">, ScentFamily[]> = {
  INTJ: ["ウッディ", "シプレ"],
  INTP: ["ウッディ", "アクアティック"],
  ENTJ: ["シプレ", "ウッディ"],
  ENTP: ["シトラス", "オリエンタル"],
  INFJ: ["オリエンタル", "フローラル"],
  INFP: ["フローラル", "グルマン"],
  ENFJ: ["フローラル", "フゼア"],
  ENFP: ["シトラス", "フローラル"],
  ISTJ: ["フゼア", "ウッディ"],
  ISFJ: ["フローラル", "グルマン"],
  ESTJ: ["フゼア", "シプレ"],
  ESFJ: ["フローラル", "グルマン"],
  ISTP: ["ウッディ", "アクアティック"],
  ISFP: ["フローラル", "アクアティック"],
  ESTP: ["シトラス", "フゼア"],
  ESFP: ["グルマン", "フローラル"],
};

function scoreSkinConcentration(p: Perfume, a: DiagnosisAnswers): number {
  // 乾燥肌: Parfum/EDP を優位に、脂性肌: EDT/Cologne を優位に
  const c = p.concentration;
  if (a.skin === "乾燥肌") {
    if (c === "Parfum") return 25;
    if (c === "EDP") return 20;
    if (c === "EDT") return 10;
    return 5; // Cologne
  }
  if (a.skin === "脂性肌") {
    if (c === "Cologne") return 25;
    if (c === "EDT") return 20;
    if (c === "EDP") return 10;
    return 5; // Parfum
  }
  if (a.skin === "混合肌") {
    if (c === "EDP" || c === "EDT") return 22;
    return 15;
  }
  // 普通肌
  return 18;
}

function scoreMetabolismIntensity(p: Perfume, a: DiagnosisAnswers): number {
  // 高め: intensity 1-3 優位、低め: intensity 3-5 優位
  if (a.metabolism === "高め") {
    if (p.intensity <= 2) return 15;
    if (p.intensity === 3) return 12;
    if (p.intensity === 4) return 6;
    return 2;
  }
  if (a.metabolism === "低め") {
    if (p.intensity >= 4) return 15;
    if (p.intensity === 3) return 12;
    if (p.intensity === 2) return 6;
    return 2;
  }
  // 普通
  if (p.intensity === 3) return 15;
  if (p.intensity === 2 || p.intensity === 4) return 10;
  return 6;
}

function scoreDietFamily(p: Perfume, a: DiagnosisAnswers): number {
  const f = p.scent_family;
  if (a.diet === "スパイス多め") {
    if (f === "オリエンタル" || f === "ウッディ") return 10;
    return 3;
  }
  if (a.diet === "和食中心") {
    if (f === "シトラス" || f === "アクアティック") return 10;
    return 3;
  }
  if (a.diet === "洋食中心") {
    if (f === "フローラル" || f === "グルマン" || f === "シプレ") return 8;
    return 4;
  }
  // バランス型
  return 6;
}

function scoreScene(p: Perfume, a: DiagnosisAnswers): number {
  if (a.scenes.length === 0) return 0;
  const hits = a.scenes.filter((s) => p.scene_tags.includes(s)).length;
  return Math.min(20, hits * 5 + (hits > 0 ? 5 : 0));
}

function collectAllowedFamilies(prefs: Preference[]): Set<ScentFamily> {
  const allowed = new Set<ScentFamily>();
  for (const pref of prefs) {
    const fams = PREFERENCE_FAMILY_MAP[pref];
    if (!fams) continue; // 未知の好み値は無視（境界入力の防御）
    for (const fam of fams) allowed.add(fam);
  }
  return allowed;
}

function scorePreference(p: Perfume, a: DiagnosisAnswers): number {
  if (!a.preferences || a.preferences.length === 0) return 0;
  const allowed = collectAllowedFamilies(a.preferences);
  if (allowed.size === 0) return 0;
  return allowed.has(p.scent_family) ? 20 : 4;
}

function scoreGender(p: Perfume, a: DiagnosisAnswers): number {
  if (p.gender_orientation === "unisex") {
    // unisex は常時ベース加点 +5、一致があれば +10
    if (a.gender === "指定しない") return 10;
    return 8;
  }
  if (a.gender === "男性" && p.gender_orientation === "men") return 10;
  if (a.gender === "女性" && p.gender_orientation === "women") return 10;
  if (a.gender === "指定しない") return 5;
  return 2;
}

function scoreMbti(p: Perfume, a: DiagnosisAnswers): number {
  if (!a.mbti || a.mbti === "わからない") return 5;
  const families = MBTI_FAMILY_MAP[a.mbti];
  if (!families) return 5;
  return families.includes(p.scent_family) ? 10 : 3;
}

export function scorePerfume(p: Perfume, a: DiagnosisAnswers): number {
  const total =
    scoreSkinConcentration(p, a) +
    scoreMetabolismIntensity(p, a) +
    scoreDietFamily(p, a) +
    scoreScene(p, a) +
    scorePreference(p, a) +
    scoreGender(p, a) +
    scoreMbti(p, a);
  return Math.min(100, total);
}

function buildReasons(p: Perfume, a: DiagnosisAnswers): string[] {
  const reasons: string[] = [];

  if (a.skin === "乾燥肌" && (p.concentration === "Parfum" || p.concentration === "EDP")) {
    reasons.push(`${a.skin}には香り残りの良い${p.concentration}がよく馴染みます。`);
  }
  if (a.skin === "脂性肌" && (p.concentration === "EDT" || p.concentration === "Cologne")) {
    reasons.push(`${a.skin}の方には軽やかな${p.concentration}が重くなりすぎません。`);
  }

  const sceneHits = a.scenes.filter((s) => p.scene_tags.includes(s));
  if (sceneHits.length > 0) {
    reasons.push(`${sceneHits.join("・")}のシーンに相性の良い設計です。`);
  }

  const allowed = collectAllowedFamilies(a.preferences ?? []);
  if (allowed.has(p.scent_family) && (a.preferences?.length ?? 0) > 0) {
    reasons.push(`お好みの方向性（${a.preferences.join("/")}）に沿う${p.scent_family}系。`);
  }

  if (a.diet === "スパイス多め" && (p.scent_family === "オリエンタル" || p.scent_family === "ウッディ")) {
    reasons.push("スパイスを楽しむ食生活には、香りにも深みのある系統がよく映えます。");
  }
  if (a.diet === "和食中心" && (p.scent_family === "シトラス" || p.scent_family === "アクアティック")) {
    reasons.push("繊細な和食の余韻を壊さない、透明感のある系統です。");
  }

  if (a.metabolism === "高め" && p.intensity <= 3) {
    reasons.push("代謝が高い方には、過剰にならない控えめな香り立ちが整います。");
  }
  if (a.metabolism === "低め" && p.intensity >= 4) {
    reasons.push("香りの立ち上がりがゆっくりな方に、しっかりとした主張がちょうど良く届きます。");
  }

  if (a.mbti !== "わからない" && MBTI_FAMILY_MAP[a.mbti].includes(p.scent_family)) {
    reasons.push(`${a.mbti}タイプの印象と響き合う${p.scent_family}の輪郭。`);
  }

  if (reasons.length === 0) {
    reasons.push(`${p.scent_family}の中でも扱いやすく、最初の1本に向きます。`);
  }
  return reasons.slice(0, 2);
}

export function recommend(
  perfumes: Perfume[],
  answers: DiagnosisAnswers,
  topN = 5,
): Recommendation[] {
  const scored = perfumes.map((p) => ({
    perfume: p,
    score: scorePerfume(p, answers),
    reasons: buildReasons(p, answers),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}
