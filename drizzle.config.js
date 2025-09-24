import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';

console.log('DATABASE_URL:', process.env.DATABASE_URL); // Add this temporarily


export default defineConfig({
  out: './drizzle',
  schema: './models/index.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
