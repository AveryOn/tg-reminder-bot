import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { readdirSync, mkdirSync } from 'fs';
import { env } from '~/env';

/** Создать директорию для базы данных если не существует */
export function createDatabaseDir() {
  try {
    readdirSync(`./data/${env.DB_FILE_NAME}`)
  }
  catch (err) {
    // Если ошибка связанная с отсутствием директории то её необходимо создать
    if(err && (err as any)?.code === 'ENOENT') {
      console.warn('[INFO] Creating the database directory...')
      mkdirSync('./data/')
    }
  }
}

const sqlite = (() => {
  createDatabaseDir()
  return new Database(`./data/${env.DB_FILE_NAME}`);
})()
export const db = drizzle(sqlite, { schema });
