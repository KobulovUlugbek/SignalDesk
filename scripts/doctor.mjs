import { spawnSync } from 'node:child_process';

function command(name, args) {
  const result = spawnSync(name, args, { encoding: 'utf8', shell: process.platform === 'win32' });
  if (result.error || result.status !== 0) {
    console.log(`✗ ${name}: nicht verfügbar`);
    return null;
  }
  console.log(`✓ ${name}: ${result.stdout.trim().split('\n')[0]}`);
  return result.stdout;
}
const nodeVersion = process.versions.node;
console.log(`✓ Node.js: ${nodeVersion}`);
command('npm', ['--version']);
const php = command('php', ['--version']);
const composer = command('composer', ['--version']);
if (php) {
  const extensions = command('php', ['-m']) ?? '';
  const required = ['pdo_sqlite', 'mbstring', 'dom', 'xml', 'fileinfo', 'openssl'];
  for (const name of required) console.log(`${extensions.split('\n').some((line) => line.trim().toLowerCase() === name) ? '✓' : '✗'} PHP-Erweiterung: ${name}`);
}
console.log(composer ? '\nInstallationsbereit: npm install && npm run setup && npm run dev' : '\nComposer 2 muss für das Laravel-Backend installiert werden.');
