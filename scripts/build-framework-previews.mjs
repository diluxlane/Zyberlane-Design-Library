import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rewritePreviewPaths } from './preview-paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);
const outputRoot = path.resolve(root, args.get('--output') || '.generated/framework-previews');
const resultsPath = path.resolve(root, args.get('--results') || '.generated/framework-preview-results.json');
const manifestPath = path.resolve(root, args.get('--manifest') || 'data/framework-preview-candidates.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

const npmCache = path.join(tmpdir(), 'zyberlane-preview-npm-cache');
await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
await mkdir(path.dirname(resultsPath), { recursive: true });
await mkdir(npmCache, { recursive: true });

function safeEnv(extra = {}) {
  const env = {
    PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
    HOME: process.env.HOME || tmpdir(),
    TMPDIR: process.env.RUNNER_TEMP || tmpdir(),
    CI: '1',
    NEXT_TELEMETRY_DISABLED: '1',
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    npm_config_ignore_scripts: 'true',
    npm_config_cache: npmCache,
    ...extra,
  };
  for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY', 'http_proxy', 'https_proxy', 'no_proxy']) {
    if (process.env[key]) env[key] = process.env[key];
  }
  return env;
}

async function exists(target) {
  try { await access(target); return true; } catch { return false; }
}

function run(command, commandArgs, { cwd, timeoutMinutes = 12, env = safeEnv() } = {}) {
  return new Promise((resolve, reject) => {
    console.log(`$ ${command} ${commandArgs.join(' ')}`);
    const child = spawn(command, commandArgs, { cwd, env, stdio: 'inherit' });
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5000).unref();
    }, timeoutMinutes * 60_000);
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('exit', (code, signal) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code ?? signal}`));
    });
  });
}

async function download(url, destination, attempts = 3) {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(180_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await writeFile(destination, Buffer.from(await response.arrayBuffer()));
      return;
    } catch (error) {
      last = error;
      if (attempt < attempts) await new Promise(resolve => setTimeout(resolve, attempt * 1500));
    }
  }
  throw last;
}

async function publicEntries(sourceRoot, assetRoot) {
  if (!assetRoot) return [];
  const directory = path.join(sourceRoot, assetRoot);
  if (!(await exists(directory))) return [];
  return Promise.all((await readdir(directory, { withFileTypes: true })).map(entry => ({
    name: entry.name,
    type: entry.isDirectory() ? 'dir' : 'file',
  })));
}

async function installDependencies(sourceRoot, timeoutMinutes) {
  const packageJson = JSON.parse(await readFile(path.join(sourceRoot, 'package.json'), 'utf8'));
  const packageManager = String(packageJson.packageManager || '');
  if (await exists(path.join(sourceRoot, 'pnpm-lock.yaml'))) {
    const match = packageManager.match(/^pnpm@([^+\s]+)/);
    const version = match?.[1] || '10';
    await run('npx', ['--yes', `pnpm@${version}`, 'install', '--frozen-lockfile', '--ignore-scripts'], {
      cwd: sourceRoot,
      timeoutMinutes,
    });
    return { packageManager: `pnpm@${version}`, install: 'pnpm install --frozen-lockfile --ignore-scripts' };
  }
  if (await exists(path.join(sourceRoot, 'package-lock.json'))) {
    await run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: sourceRoot, timeoutMinutes });
    return { packageManager: 'npm', install: 'npm ci --ignore-scripts' };
  }
  await run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false'], {
    cwd: sourceRoot,
    timeoutMinutes,
  });
  return { packageManager: 'npm', install: 'npm install --ignore-scripts' };
}

async function configureNextStaticExport(sourceRoot, id) {
  const configNames = ['next.config.ts', 'next.config.mts', 'next.config.mjs', 'next.config.js', 'next.config.cjs'];
  let originalName = null;
  for (const name of configNames) {
    if (await exists(path.join(sourceRoot, name))) { originalName = name; break; }
  }
  let importStatement = 'let source = {};';
  if (originalName) {
    const extension = path.extname(originalName);
    const renamed = `next.config.source${extension}`;
    await rename(path.join(sourceRoot, originalName), path.join(sourceRoot, renamed));
    importStatement = `let source = (await import('./${renamed}')).default ?? {};\nif (typeof source === 'function') source = await source('phase-production-build', { defaultConfig: {} });`;
  }
  const basePath = `/previews/${id}`;
  const wrapper = `${importStatement}\nconst sourceImages = source && typeof source.images === 'object' ? source.images : {};\nexport default {\n  ...(source || {}),\n  output: 'export',\n  trailingSlash: true,\n  basePath: '${basePath}',\n  assetPrefix: '${basePath}',\n  images: { ...sourceImages, unoptimized: true },\n};\n`;
  await writeFile(path.join(sourceRoot, 'next.config.mjs'), wrapper);
}

async function hashFile(file) {
  const bytes = await readFile(file);
  return createHash('sha256').update(bytes).digest('hex');
}

async function removeCopiedPublic(sourceRoot, builtRoot, assetRoot) {
  if (!assetRoot) return 0;
  const publicRoot = path.join(sourceRoot, assetRoot);
  if (!(await exists(publicRoot))) return 0;
  let removed = 0;
  async function walk(relative = '') {
    const sourceDir = path.join(publicRoot, relative);
    for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
      const next = path.join(relative, entry.name);
      if (entry.isDirectory()) await walk(next);
      else if (entry.isFile()) {
        const candidate = path.join(builtRoot, next);
        if (!(await exists(candidate))) continue;
        try {
          const [left, right] = await Promise.all([stat(path.join(publicRoot, next)), stat(candidate)]);
          if (left.size !== right.size) continue;
          const [a, b] = await Promise.all([hashFile(path.join(publicRoot, next)), hashFile(candidate)]);
          if (a === b) { await rm(candidate, { force: true }); removed++; }
        } catch { /* keep generated output on uncertainty */ }
      }
    }
  }
  await walk();
  return removed;
}

async function rewriteBuiltText(builtRoot, candidate, assetEntries) {
  const topNames = assetEntries.map(entry => entry.name);
  const snapshot = { id: candidate.id, repo: candidate.repo, topNames };
  let changed = 0;
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && /\.(?:html|css|js|mjs|json|map|txt|xml|webmanifest)$/i.test(entry.name)) {
        const before = await readFile(full, 'utf8');
        let after = rewritePreviewPaths(before, snapshot);
        if (entry.name.endsWith('.html')) {
          const base = `/previews/${candidate.id}/`;
          after = after.replace(/<base\b[^>]*>/gi, '').replace(/(<head\b[^>]*>)/i, `$1\n<base href="${base}">`);
        }
        if (after !== before) { await writeFile(full, after); changed++; }
      }
    }
  }
  await walk(builtRoot);
  return changed;
}

async function buildCandidate(candidate) {
  const started = new Date().toISOString();
  const temp = await mkdtemp(path.join(tmpdir(), `zyberlane-${candidate.id.toLowerCase()}-`));
  const archive = path.join(temp, 'source.tar.gz');
  const sourceRoot = path.join(temp, 'source');
  const timeoutMinutes = candidate.timeoutMinutes || 12;
  const result = {
    id: candidate.id,
    repo: candidate.repo,
    commit: candidate.commit,
    strategy: candidate.strategy,
    assetRoot: candidate.assetRoot,
    startedAt: started,
    status: 'failed',
    compatibilityAdjustments: [],
  };
  try {
    await mkdir(sourceRoot, { recursive: true });
    const url = `https://codeload.github.com/gireeshkumarreddy/${encodeURIComponent(candidate.repo)}/tar.gz/${candidate.commit}`;
    console.log(`\n=== ${candidate.id} ${candidate.repo} (${candidate.strategy}) ===`);
    await download(url, archive);
    await run('tar', ['-xzf', archive, '-C', sourceRoot, '--strip-components=1'], { cwd: temp, timeoutMinutes: 4 });
    const assetEntries = await publicEntries(sourceRoot, candidate.assetRoot);
    result.assetEntries = assetEntries;
    const installed = await installDependencies(sourceRoot, timeoutMinutes);
    result.packageManager = installed.packageManager;
    result.install = installed.install;

    let builtRoot;
    if (candidate.strategy === 'vite') {
      await run('npm', ['run', 'build', '--', '--base=./', '--assetsDir=_preview'], {
        cwd: sourceRoot,
        timeoutMinutes,
        env: safeEnv({ NODE_ENV: 'production' }),
      });
      builtRoot = path.join(sourceRoot, 'dist');
      if (!(await exists(builtRoot))) throw new Error('Vite build completed without a dist/ output directory');
      result.compatibilityAdjustments.push('Built the pinned original Vite frontend with a relative base and isolated _preview runtime bundle directory so it can run below the existing /previews/REF-NNN/ host path without colliding with original public assets.');
    } else if (candidate.strategy === 'next') {
      await configureNextStaticExport(sourceRoot, candidate.id);
      const nextBin = path.join(sourceRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
      if (!(await exists(nextBin))) throw new Error('Next.js is not installed in this source snapshot');
      await run(process.execPath, [nextBin, 'build'], {
        cwd: sourceRoot,
        timeoutMinutes,
        env: safeEnv({ NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1' }),
      });
      builtRoot = path.join(sourceRoot, 'out');
      if (!(await exists(builtRoot))) throw new Error('Next.js build completed without an out/ static-export directory');
      result.compatibilityAdjustments.push('Wrapped the pinned Next.js/Vinext-compatible source with an isolated static-export config using the existing /previews/REF-NNN base path; no source repository was modified.');
      result.compatibilityAdjustments.push('Next image optimization is disabled only for this static reference export so original public assets can remain on the pinned source fallback.');
    } else {
      throw new Error(`Unsupported strategy ${candidate.strategy}`);
    }

    const removedPublicFiles = await removeCopiedPublic(sourceRoot, builtRoot, candidate.assetRoot);
    if (removedPublicFiles) result.compatibilityAdjustments.push(`Removed ${removedPublicFiles} byte-identical public asset copies from the generated output; the existing host can request those files from the immutable source commit instead.`);
    const rewrittenFiles = await rewriteBuiltText(builtRoot, candidate, assetEntries);
    result.rewrittenFiles = rewrittenFiles;

    const destination = path.join(outputRoot, candidate.id);
    await rm(destination, { recursive: true, force: true });
    await cp(builtRoot, destination, { recursive: true });
    await writeFile(path.join(destination, 'SOURCE.md'), `# Original reference\n\nCreator: Gireesh Kumar Reddy\nRepository: https://github.com/gireeshkumarreddy/${candidate.repo}\nCommit: ${candidate.commit}\n\nCentralized authorized design-study preview. This is not a separate deployment or a Zyberlane client project.\n\n${result.compatibilityAdjustments.map(item => `- ${item}`).join('\n')}\n`);
    result.status = 'built';
    result.preview = `/previews/${candidate.id}/`;
    result.finishedAt = new Date().toISOString();
    console.log(`Built ${candidate.id}`);
  } catch (error) {
    result.error = String(error?.stack || error);
    result.finishedAt = new Date().toISOString();
    console.error(`FAILED ${candidate.id}: ${error?.message || error}`);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
  return result;
}

const results = [];
for (const candidate of manifest.candidates) results.push(await buildCandidate(candidate));
const summary = {
  date: new Date().toISOString(),
  sourceManifest: path.relative(root, manifestPath),
  hostingModel: 'One existing Zyberlane Design Reference Library Vercel project; generated previews are committed under public/previews and served as /previews/REF-NNN/.',
  built: results.filter(item => item.status === 'built').length,
  failed: results.filter(item => item.status !== 'built').length,
  results,
  intentionallyNotBuilt: manifest.intentionallyNotBuilt,
};
await writeFile(resultsPath, JSON.stringify(summary, null, 2) + '\n');
console.log(`\nFramework preview build complete: ${summary.built} built, ${summary.failed} failed.`);
