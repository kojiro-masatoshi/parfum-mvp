import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type { Perfume } from "./types";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, "perfume.db");
  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS perfumes (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      name TEXT NOT NULL,
      concentration TEXT NOT NULL,
      top_notes TEXT NOT NULL,
      middle_notes TEXT NOT NULL,
      base_notes TEXT NOT NULL,
      scent_family TEXT NOT NULL,
      intensity INTEGER NOT NULL,
      longevity INTEGER NOT NULL,
      season_tags TEXT NOT NULL,
      scene_tags TEXT NOT NULL,
      gender_orientation TEXT NOT NULL,
      price_yen INTEGER NOT NULL,
      description TEXT NOT NULL,
      perfumer TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS diagnosis_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      answers_json TEXT NOT NULL,
      recommended_ids TEXT NOT NULL
    );
  `);
}

interface PerfumeRow {
  id: string;
  brand: string;
  name: string;
  concentration: string;
  top_notes: string;
  middle_notes: string;
  base_notes: string;
  scent_family: string;
  intensity: number;
  longevity: number;
  season_tags: string;
  scene_tags: string;
  gender_orientation: string;
  price_yen: number;
  description: string;
  perfumer: string;
}

function rowToPerfume(row: PerfumeRow): Perfume {
  return {
    id: row.id,
    brand: row.brand,
    name: row.name,
    concentration: row.concentration as Perfume["concentration"],
    top_notes: JSON.parse(row.top_notes),
    middle_notes: JSON.parse(row.middle_notes),
    base_notes: JSON.parse(row.base_notes),
    scent_family: row.scent_family as Perfume["scent_family"],
    intensity: row.intensity,
    longevity: row.longevity,
    season_tags: JSON.parse(row.season_tags),
    scene_tags: JSON.parse(row.scene_tags),
    gender_orientation: row.gender_orientation as Perfume["gender_orientation"],
    price_yen: row.price_yen,
    description: row.description,
    perfumer: row.perfumer,
  };
}

export function getAllPerfumes(): Perfume[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM perfumes").all() as PerfumeRow[];
  return rows.map(rowToPerfume);
}

export function getPerfumeById(id: string): Perfume | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM perfumes WHERE id = ?").get(id) as
    | PerfumeRow
    | undefined;
  return row ? rowToPerfume(row) : null;
}

export function saveDiagnosisResult(
  answersJson: string,
  recommendedIds: string[],
): number {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO diagnosis_results (answers_json, recommended_ids) VALUES (?, ?)",
  );
  const info = stmt.run(answersJson, JSON.stringify(recommendedIds));
  return Number(info.lastInsertRowid);
}

export function upsertPerfume(p: Perfume): void {
  const db = getDb();
  db.prepare(
    `INSERT OR REPLACE INTO perfumes
      (id, brand, name, concentration, top_notes, middle_notes, base_notes,
       scent_family, intensity, longevity, season_tags, scene_tags,
       gender_orientation, price_yen, description, perfumer)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    p.id,
    p.brand,
    p.name,
    p.concentration,
    JSON.stringify(p.top_notes),
    JSON.stringify(p.middle_notes),
    JSON.stringify(p.base_notes),
    p.scent_family,
    p.intensity,
    p.longevity,
    JSON.stringify(p.season_tags),
    JSON.stringify(p.scene_tags),
    p.gender_orientation,
    p.price_yen,
    p.description,
    p.perfumer,
  );
}
