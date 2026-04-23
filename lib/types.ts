export type Concentration = "EDT" | "EDP" | "Parfum" | "Cologne";

export type ScentFamily =
  | "シトラス"
  | "フローラル"
  | "ウッディ"
  | "オリエンタル"
  | "フゼア"
  | "シプレ"
  | "グルマン"
  | "アクアティック";

export type Season = "春" | "夏" | "秋" | "冬";

export type Scene = "仕事" | "デート" | "休日" | "フォーマル";

export type GenderOrientation = "men" | "women" | "unisex";

export interface Perfume {
  id: string;
  brand: string;
  name: string;
  concentration: Concentration;
  top_notes: string[];
  middle_notes: string[];
  base_notes: string[];
  scent_family: ScentFamily;
  intensity: number; // 1-5
  longevity: number; // 1-5
  season_tags: Season[];
  scene_tags: Scene[];
  gender_orientation: GenderOrientation;
  price_yen: number;
  description: string;
  perfumer: string;
}

export type AgeGroup = "10代" | "20代" | "30代" | "40代" | "50代以上";
export type Gender = "男性" | "女性" | "指定しない";
export type DietType = "和食中心" | "洋食中心" | "スパイス多め" | "バランス型";
export type SkinType = "乾燥肌" | "普通肌" | "脂性肌" | "混合肌";
export type MetabolismLevel = "低め" | "普通" | "高め";
export type Preference =
  | "爽やか"
  | "甘い"
  | "落ち着いた木の香り"
  | "スパイシー"
  | "清潔感のある石鹸系"
  | "個性的・独特";

export type MBTI =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP"
  | "わからない";

export interface DiagnosisAnswers {
  age: AgeGroup;
  gender: Gender;
  diet: DietType;
  skin: SkinType;
  metabolism: MetabolismLevel;
  scenes: Scene[];
  preferences: Preference[];
  mbti: MBTI;
}

export interface Recommendation {
  perfume: Perfume;
  score: number;
  reasons: string[];
}
