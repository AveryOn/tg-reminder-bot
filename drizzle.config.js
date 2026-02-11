/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const drizzle_kit_1 = require('drizzle-kit');
exports.default = (0, drizzle_kit_1.defineConfig)({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: `./data/${process.env.DB_FILE_NAME}`,
  },
});
