import fs from 'node:fs';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env', quiet: true });

if (!process.env.DATABASE_URL) {
  loadEnv({ path: '.env.local', quiet: true });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

if (!databaseUrl.startsWith('file:')) {
  process.exit(0);
}

const filePath = databaseUrl.slice('file:'.length).split('?')[0];
const databasePath = path.isAbsolute(filePath)
  ? filePath
  : path.resolve(process.cwd(), filePath);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

if (!fs.existsSync(databasePath)) {
  fs.closeSync(fs.openSync(databasePath, 'a'));
}
