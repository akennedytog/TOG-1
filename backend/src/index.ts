import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function initDb() {
  const db = await open({
    filename: path.resolve(__dirname, '../news.db'),
    driver: sqlite3.Database
  });
  await db.exec(`CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    title TEXT,
    timestamp TEXT,
    source TEXT,
    status TEXT
  )`);
  return db;
}

async function main() {
  const db = await initDb();
  const app = express();
  const port = process.env.PORT || 3001;

  app.get('/news', async (req, res) => {
    const status = req.query.status || 'confirmed';
    const rows = await db.all('SELECT * FROM news WHERE status = ?', status);
    res.json(rows);
  });

  app.listen(port, () => console.log(`Backend listening on port ${port}`));
}

main().catch(err => console.error(err));