import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const roots = ['app', 'components', 'lib'];
const forbiddenPatterns = [
  { pattern: /\bdebugger\b/, message: 'debugger statement' },
  { pattern: /console\.log\s*\(/, message: 'console.log in shipped frontend code' }
];

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') {
        continue;
      }
      files.push(...await collectFiles(entryPath));
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

const failures = [];

for (const root of roots) {
  const files = await collectFiles(root);

  for (const file of files) {
    const source = await readFile(file, 'utf8');

    forbiddenPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(source)) {
        failures.push(`${file}: ${message}`);
      }
    });
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('Frontend architecture lint passed.');
