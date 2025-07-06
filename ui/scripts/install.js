import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

async function main() {
  const homeDir = os.homedir();
  const uiDir = path.join(homeDir, '.taskmaster', 'ui');

  if (existsSync(uiDir)) {
    console.error(`Installation directory already exists at ${uiDir}. Aborting to avoid overwriting.`);
    return;
  }

  await fs.mkdir(uiDir, { recursive: true });
  const sourceDir = process.cwd();
  await fs.cp(sourceDir, uiDir, {
    recursive: true,
    filter: src => {
      const rel = path.relative(sourceDir, src);
      if (!rel) return true;
      if (rel.startsWith('.git')) return false;
      if (rel.startsWith('node_modules')) return false;
      if (rel.startsWith('dist')) return false;
      return true;
    }
  });
  console.log(`Copied files to ${uiDir}`);

  const packageJsonPath = path.join(uiDir, 'package.json');
  if (existsSync(packageJsonPath)) {
    console.log('Installing npm dependencies...');
    await new Promise((resolve, reject) => {
      const child = spawn('npm', ['install'], { cwd: uiDir, stdio: 'inherit' });
      child.on('error', err => {
        reject(new Error(`Failed to start npm install: ${err.message}`));
      });
      child.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`npm install exited with code ${code}`));
      });
    });
  }
  console.log(`Taskmaster UI installed at ${uiDir}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
