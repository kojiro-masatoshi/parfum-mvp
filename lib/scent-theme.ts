import type { ScentFamily } from "./types";

export interface ScentTheme {
  accent: string; // 線・強調に使う深い色
  tint: string; // 広い面に敷く極淡い色
  label: string; // 英語ラベル（欧文タイポのために）
  poem: string; // 系統を示す短い情景
}

export const SCENT_THEMES: Record<ScentFamily, ScentTheme> = {
  シトラス: {
    accent: "#C98A17",
    tint: "#FBF4E2",
    label: "Citrus",
    poem: "陽の粒、朝の透明。",
  },
  フローラル: {
    accent: "#B95774",
    tint: "#FAEEF1",
    label: "Floral",
    poem: "花弁の内側、白い光。",
  },
  ウッディ: {
    accent: "#6B4226",
    tint: "#F4EDE5",
    label: "Woody",
    poem: "乾いた樹、静かな芯。",
  },
  オリエンタル: {
    accent: "#8B1E3F",
    tint: "#F8EAEE",
    label: "Oriental",
    poem: "香炉の煙、夜の記憶。",
  },
  フゼア: {
    accent: "#466B46",
    tint: "#ECF1EC",
    label: "Fougère",
    poem: "野のハーブ、風の余白。",
  },
  シプレ: {
    accent: "#4A5C3A",
    tint: "#EEF1E8",
    label: "Chypre",
    poem: "苔むす石、書斎の翳り。",
  },
  グルマン: {
    accent: "#A6714E",
    tint: "#F6ECE2",
    label: "Gourmand",
    poem: "キャラメルの湯気、台所の午後。",
  },
  アクアティック: {
    accent: "#34708F",
    tint: "#E8F0F5",
    label: "Aquatic",
    poem: "潮の匂い、崖の上の散歩。",
  },
};

export function themeOf(family: ScentFamily): ScentTheme {
  return SCENT_THEMES[family];
}
