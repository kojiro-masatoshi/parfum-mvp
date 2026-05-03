import type { ScentFamily } from "./types";

export interface ScentTheme {
  accent: string; // 線・強調に使う中軸色（= mid と同義に扱う）
  tint: string; // 単色面用の極淡色
  // メッシュ用パレット: 上層(明) / 中軸 / 下層(深) / 中間ニュアンス
  light: string;
  mid: string;
  deep: string;
  shimmer: string;
  label: string; // 欧文ラベル
  poem: string; // 系統を示す短い情景
}

export const SCENT_THEMES: Record<ScentFamily, ScentTheme> = {
  シトラス: {
    accent: "#C98A17",
    tint: "#FBF4E2",
    light: "#FCEBB8",
    mid: "#D9971C",
    deep: "#6B4D0E",
    shimmer: "#E8B36B",
    label: "Citrus",
    poem: "陽の粒、朝の透明。",
  },
  フローラル: {
    accent: "#B95774",
    tint: "#FAEEF1",
    light: "#F5D6E1",
    mid: "#C0617D",
    deep: "#5C2A3E",
    shimmer: "#D8A0B5",
    label: "Floral",
    poem: "花弁の内側、白い光。",
  },
  ウッディ: {
    accent: "#6B4226",
    tint: "#F4EDE5",
    light: "#D8B894",
    mid: "#7A4E2E",
    deep: "#2F1A0E",
    shimmer: "#A07B57",
    label: "Woody",
    poem: "乾いた樹、静かな芯。",
  },
  オリエンタル: {
    accent: "#8B1E3F",
    tint: "#F8EAEE",
    light: "#E2B5C0",
    mid: "#9A2A4A",
    deep: "#3E0E1C",
    shimmer: "#C26680",
    label: "Oriental",
    poem: "香炉の煙、夜の記憶。",
  },
  フゼア: {
    accent: "#466B46",
    tint: "#ECF1EC",
    light: "#C5D5B6",
    mid: "#52784F",
    deep: "#1F3024",
    shimmer: "#7A9B6A",
    label: "Fougère",
    poem: "野のハーブ、風の余白。",
  },
  シプレ: {
    accent: "#4A5C3A",
    tint: "#EEF1E8",
    light: "#C3CCAE",
    mid: "#566B43",
    deep: "#1F2818",
    shimmer: "#7C8A60",
    label: "Chypre",
    poem: "苔むす石、書斎の翳り。",
  },
  グルマン: {
    accent: "#A6714E",
    tint: "#F6ECE2",
    light: "#EBCBA8",
    mid: "#B47E58",
    deep: "#4D2E1A",
    shimmer: "#D09C72",
    label: "Gourmand",
    poem: "キャラメルの湯気、台所の午後。",
  },
  アクアティック: {
    accent: "#34708F",
    tint: "#E8F0F5",
    light: "#BFDCE6",
    mid: "#3D7E9F",
    deep: "#142F44",
    shimmer: "#6F9DB6",
    label: "Aquatic",
    poem: "潮の匂い、崖の上の散歩。",
  },
};

export function themeOf(family: ScentFamily): ScentTheme {
  return SCENT_THEMES[family];
}

/**
 * 香水カード用のメッシュグラデーション。
 *
 * 中明度の light / shimmer / mid の3色だけを使い、いずれも低不透明度・
 * 大きな楕円・長いフェードで境界を溶かす。深い色 (deep) は本体には
 * 入れず（中央が暗くなり「汚れ」に見えるため）、アクセント線専用。
 *
 * `seed` は perfume.id を渡してカードごとに楕円の中心を微妙にずらす用途。
 */
export function meshGradientFor(theme: ScentTheme, seed = ""): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const r = (n: number, span: number) => ((h >> n) & 0xff) / 255 * span;
  // 振れ幅は最小限（カードごとに違うが大きく違いすぎない）
  const lx = 75 + r(0, 20); // light X (75..95)
  const ly = 10 + r(4, 25); // light Y (10..35)
  const sx = 25 + r(8, 30); // shimmer X (25..55)
  const sy = 45 + r(12, 25); // shimmer Y (45..70)
  const mx = 80 + r(16, 20); // mid X (80..100)
  const my = 75 + r(20, 25); // mid Y (75..100)

  return [
    // 上層: light を大きくふんわり
    `radial-gradient(ellipse 130% 110% at ${lx}% ${ly}%, ${theme.light}b3 0%, ${theme.light}00 75%)`,
    // 中央: shimmer を大きく低彩度で
    `radial-gradient(ellipse 110% 110% at ${sx}% ${sy}%, ${theme.shimmer}80 0%, ${theme.shimmer}00 80%)`,
    // 下層: mid をごく薄く（深色は使わない）
    `radial-gradient(ellipse 120% 100% at ${mx}% ${my}%, ${theme.mid}55 0%, ${theme.mid}00 75%)`,
    // ベース: tint → light の優しい線形
    `linear-gradient(135deg, ${theme.tint} 0%, ${theme.light}99 100%)`,
  ].join(", ");
}
