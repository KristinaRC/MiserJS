import fs from 'node:fs';
import path from 'node:path';
import packageJSON from '../package.json' with { type: 'json' };
import {exit} from 'node:process';
import { execFileSync } from 'node:child_process';
import pc from 'picocolors';

process.on('uncaughtException', (err) => {
  console.log(`${err.message}`);
  exit(1);
});

// Define paths.

const __dirname = import.meta.dirname;
const distDir = 'dist';
const packageRootPath = path.join(__dirname, "../");
const packageDistPath = path.join(packageRootPath, distDir);
const publishRootPath = path.join(packageRootPath, 'publishTemp');
const publishDistPath = path.join(publishRootPath, distDir);

console.log(`Package Root Path: ${packageRootPath}`);
console.log(`Package Dist Path: ${packageDistPath}`);
console.log(`Package Publish Temp Dir Path: ${publishRootPath}`);
console.log(`Package Publish Temp Dist Path: ${publishDistPath}`);

// devDependencies and scripts fields get pulled out separately, leaving the rest (...) in cleanedPackageJSON.
const { devDependencies, scripts, ...cleanedPackageJSON } = packageJSON;

if (fs.existsSync(publishRootPath)) {
  fs.rmSync(publishRootPath, { recursive: true });
  console.log('Publish temp directory was deleted.');
}

// Copy dist/* files to temporary publish directory.

fs.cpSync(packageDistPath, publishDistPath, { preserveTimestamps: true, recursive: true});

// Write the modified package.json

fs.writeFileSync(path.join(publishRootPath, 'package.json'), JSON.stringify(cleanedPackageJSON,null,2), { mode: 0o644, flush: true});

// Create fresh package-lock.json 

const npmInstallResult = execFileSync('npm', ['install', '--save', '--package-lock-only'], {
  cwd: publishRootPath,
  stdio: 'pipe',
  encoding: 'utf8'
});

console.log(`NPM Install Command Result: ${npmInstallResult}`);

// Copy LICENSE and README
const addFiles = ['LICENSE.md', 'README.md'];

for (const file of addFiles) {
  fs.copyFileSync(path.join(packageRootPath, file), path.join(publishRootPath, file), fs.constants.COPYFILE_FICLONE);
}