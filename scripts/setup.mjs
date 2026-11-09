import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, openSync, closeSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error || result.status !== 0) {
    console.error(`\nInstallationsschritt fehlgeschlagen: ${command} ${args.join(' ')}`);
    process.exit(result.status || 1);
  }
}
const envFile = resolve(root, '.env');
if (!existsSync(envFile)) copyFileSync(resolve(root, '.env.example'), envFile);
mkdirSync(resolve(root, 'database'), { recursive: true });
const database = resolve(root, 'database/database.sqlite');
if (!existsSync(database)) closeSync(openSync(database, 'w'));
console.log('\n[1/4] Composer installiert Laravel-Pakete ...');
run('composer', ['install', '--no-interaction']);
if (!/^APP_KEY=\S+/m.test(readFileSync(envFile, 'utf8'))) {
  console.log('\n[2/4] Application-Key erzeugen ...');
  run('php', ['artisan', 'key:generate', '--force']);
} else {
  console.log('\n[2/4] Vorhandenen Application-Key beibehalten.');
}
console.log('\n[3/4] Datenbank-Migrationen ausführen ...');
run('php', ['artisan', 'migrate', '--force']);
console.log('\n[4/4] Synthetische Beispieldaten anlegen ...');
run('php', ['artisan', 'db:seed', '--force']);
console.log('\nBereit. Starte mit npm run dev und öffne http://127.0.0.1:8000');
