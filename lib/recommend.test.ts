import { describe, expect, it } from "vitest";
import { recommend, scorePerfume } from "./recommend";
import type { DiagnosisAnswers, Perfume } from "./types";

const basePerfumes: Perfume[] = [
  {
    id: "woody-strong",
    brand: "Test",
    name: "Strong Woody EDP",
    concentration: "EDP",
    top_notes: ["bergamot"],
    middle_notes: ["cedar"],
    base_notes: ["sandalwood"],
    scent_family: "ウッディ",
    intensity: 5,
    longevity: 5,
    season_tags: ["秋", "冬"],
    scene_tags: ["仕事", "フォーマル"],
    gender_orientation: "men",
    price_yen: 15000,
    description: "test",
    perfumer: "test",
  },
  {
    id: "citrus-light",
    brand: "Test",
    name: "Light Citrus Cologne",
    concentration: "Cologne",
    top_notes: ["lemon"],
    middle_notes: ["neroli"],
    base_notes: ["musk"],
    scent_family: "シトラス",
    intensity: 2,
    longevity: 2,
    season_tags: ["春", "夏"],
    scene_tags: ["休日", "仕事"],
    gender_orientation: "unisex",
    price_yen: 8000,
    description: "test",
    perfumer: "test",
  },
  {
    id: "gourmand-sweet",
    brand: "Test",
    name: "Sweet Gourmand EDP",
    concentration: "EDP",
    top_notes: ["pear"],
    middle_notes: ["jasmine"],
    base_notes: ["vanilla"],
    scent_family: "グルマン",
    intensity: 4,
    longevity: 5,
    season_tags: ["秋", "冬"],
    scene_tags: ["デート", "休日"],
    gender_orientation: "women",
    price_yen: 12000,
    description: "test",
    perfumer: "test",
  },
];

function mkAnswers(o: Partial<DiagnosisAnswers> = {}): DiagnosisAnswers {
  return {
    age: "30代",
    gender: "指定しない",
    diet: "バランス型",
    skin: "普通肌",
    metabolism: "普通",
    scenes: [],
    preferences: [],
    budget: "こだわらない",
    mbti: "わからない",
    ...o,
  };
}

describe("scorePerfume", () => {
  it("乾燥肌 × Parfum/EDP は Cologne より高スコア", () => {
    const dry = mkAnswers({ skin: "乾燥肌" });
    const edpScore = scorePerfume(basePerfumes[0], dry); // EDP
    const cologneScore = scorePerfume(basePerfumes[1], dry); // Cologne
    expect(edpScore).toBeGreaterThan(cologneScore);
  });

  it("脂性肌 × Cologne/EDT は Parfum/EDP より高スコア", () => {
    const oily = mkAnswers({ skin: "脂性肌" });
    const cologneScore = scorePerfume(basePerfumes[1], oily); // Cologne
    const edpScore = scorePerfume(basePerfumes[0], oily); // EDP
    expect(cologneScore).toBeGreaterThan(edpScore);
  });

  it("スコアは 0〜100 の範囲に収まる", () => {
    const a = mkAnswers({
      skin: "乾燥肌",
      metabolism: "低め",
      scenes: ["仕事", "デート", "休日", "フォーマル"],
      preferences: ["落ち着いた木の香り", "甘い"],
      diet: "スパイス多め",
      mbti: "INTJ",
      gender: "男性",
    });
    for (const p of basePerfumes) {
      const s = scorePerfume(p, a);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });

  it("シーン一致数に応じて scene スコアが増える", () => {
    const p = basePerfumes[0]; // scene_tags: 仕事/フォーマル
    const noMatch = scorePerfume(p, mkAnswers({ scenes: ["デート"] }));
    const oneMatch = scorePerfume(p, mkAnswers({ scenes: ["仕事"] }));
    const twoMatch = scorePerfume(p, mkAnswers({ scenes: ["仕事", "フォーマル"] }));
    expect(twoMatch).toBeGreaterThan(oneMatch);
    expect(oneMatch).toBeGreaterThan(noMatch);
  });
});

describe("recommend", () => {
  it("上位N件を返し、スコア降順でソートされる", () => {
    const a = mkAnswers({
      preferences: ["爽やか"],
      scenes: ["休日"],
      skin: "脂性肌",
    });
    const result = recommend(basePerfumes, a, 3);
    expect(result).toHaveLength(3);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
    }
    // 爽やか好み + 脂性肌 + 休日 → シトラス/Cologne が1位
    expect(result[0].perfume.id).toBe("citrus-light");
  });

  it("各結果に少なくとも1件の reason が付く", () => {
    const a = mkAnswers({ scenes: ["仕事"], preferences: ["落ち着いた木の香り"] });
    const result = recommend(basePerfumes, a, 3);
    for (const r of result) {
      expect(r.reasons.length).toBeGreaterThan(0);
    }
  });

  it("甘い好み + 乾燥肌 + デートはグルマンEDPを優先", () => {
    const a = mkAnswers({
      preferences: ["甘い"],
      skin: "乾燥肌",
      scenes: ["デート"],
      gender: "女性",
    });
    const result = recommend(basePerfumes, a, 1);
    expect(result[0].perfume.id).toBe("gourmand-sweet");
  });

  it("予算 〜¥15,000 は近い価格の商品を押し上げる", () => {
    // citrus-light: 8000円, woody-strong: 15000円, gourmand-sweet: 12000円
    // 「〜¥15,000」では 8000/12000 が直撃、15000 は境界で rank 1 扱い
    const cheap = basePerfumes[1]; // 8000
    const mid = basePerfumes[2]; // 12000
    const high = basePerfumes[0]; // 15000 → rank 1

    const a = mkAnswers({ budget: "〜¥15,000" });
    const cheapScore = scorePerfume(cheap, a);
    const midScore = scorePerfume(mid, a);
    const highScore = scorePerfume(high, a);
    expect(cheapScore).toBeGreaterThan(highScore);
    expect(midScore).toBeGreaterThan(highScore);
  });
});
