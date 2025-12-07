import 'dotenv/config'
import { defineConfig } from 'prisma/config';
import { env } from '@prisma/internals';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});