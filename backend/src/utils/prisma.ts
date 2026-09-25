import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

let connectionString = process.env.DATABASE_URL || '';

if (connectionString.startsWith('prisma+postgres://')) {
  try {
    const urlObj = new URL(connectionString);
    const apiKeyBase64 = urlObj.searchParams.get('api_key') || '';
    if (apiKeyBase64) {
      const decoded = Buffer.from(apiKeyBase64, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      connectionString = parsed.databaseUrl.replace('localhost', '127.0.0.1');
    }
  } catch (e) {
    console.error('Failed to parse Prisma Postgres API key', e);
  }
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
