import { mkdir, readFile, writeFile } from 'node:fs/promises';
import openapiTS, { astToString } from 'openapi-typescript';

const source = process.argv[2] ?? process.env.API_SCHEMA_URL ?? 'http://127.0.0.1:5244/swagger/v1/swagger.json';
const schema = source.startsWith('http://') || source.startsWith('https://')
  ? new URL(source)
  : JSON.parse(await readFile(source, 'utf8'));

const ast = await openapiTS(schema);
const output = `/* eslint-disable */\n// Generated from the backend OpenAPI schema. Do not edit by hand.\n\n${astToString(ast)}\n`;
await mkdir('src/api', { recursive: true });
await writeFile('src/api/generated.ts', output, 'utf8');
