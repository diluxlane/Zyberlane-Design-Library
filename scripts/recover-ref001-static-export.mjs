import { spawn } from 'node:child_process';
import { access, cp, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rewritePreviewPaths } from './preview-paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);
const outputRoot = path.resolve(root, args.get('--output') || '.generated/framework-previews');
const resultsPath = path.resolve(root, args.get('--results') || '.generated/framework-preview-results.json');
const candidate = {
  id: 'REF-001',
  repo: '-Gireesh-Portfolio',
  commit: '4133a153bd3c29894ee3794097ee6434c90107cc',
};

async function exists(target) {
  try { await access(target); return true; } catch { return false; }
}

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
    npm_config_cache: path.join(tmpdir(), 'zyberlane-preview-npm-cache'),
    ...extra,
  };
  for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY', 'http_proxy', 'https_proxy', 'no_proxy']) {
    if (process.env[key]) env[key] = process.env[key];
  }
  return env;
}

function run(command, commandArgs, { cwd, timeoutMinutes = 15, env = safeEnv() } = {}) {
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

async function rewriteBuiltText(builtRoot, topNames) {
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
          after = after.replace(/<base\b[^>]*>/gi, '').replace(/(<head\b[^>]*>)/i, `$1\n<base href="/previews/${candidate.id}/">`);
        }
        if (after !== before) {
          await writeFile(full, after);
          changed++;
        }
      }
    }
  }
  await walk(builtRoot);
  return changed;
}

const results = JSON.parse(await readFile(resultsPath, 'utf8'));
const previous = results.results.find(item => item.id === candidate.id);
if (!previous || previous.status === 'built') {
  console.log('REF-001 does not require recovery.');
  process.exit(0);
}

const temp = await mkdtemp(path.join(tmpdir(), 'zyberlane-ref-001-recovery-'));
const archive = path.join(temp, 'source.tar.gz');
const sourceRoot = path.join(temp, 'source');
try {
  await mkdir(sourceRoot, { recursive: true });
  const response = await fetch(`https://codeload.github.com/gireeshkumarreddy/${candidate.repo}/tar.gz/${candidate.commit}`, { signal: AbortSignal.timeout(180_000) });
  if (!response.ok) throw new Error(`Source download failed with HTTP ${response.status}`);
  await writeFile(archive, Buffer.from(await response.arrayBuffer()));
  await run('tar', ['-xzf', archive, '-C', sourceRoot, '--strip-components=1'], { cwd: temp, timeoutMinutes: 4 });
  await run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: sourceRoot });

  const publicRoot = path.join(sourceRoot, 'public');
  const topNames = (await exists(publicRoot)) ? (await readdir(publicRoot, { withFileTypes: true })).map(entry => entry.name) : [];

  let patchedMetadata = 0;
  for (const relative of ['app/robots.ts', 'app/sitemap.ts', 'src/app/robots.ts', 'src/app/sitemap.ts']) {
    const file = path.join(sourceRoot, relative);
    if (!(await exists(file))) continue;
    const before = await readFile(file, 'utf8');
    if (/export\s+const\s+dynamic\s*=/.test(before)) continue;
    await writeFile(file, `${before.trimEnd()}\n\nexport const dynamic = "force-static";\n`);
    patchedMetadata++;
  }

  for (const configName of ['next.config.ts', 'next.config.mts', 'next.config.mjs', 'next.config.js', 'next.config.cjs']) {
    const original = path.join(sourceRoot, configName);
    if (!(await exists(original))) continue;
    const extension = path.extname(configName);
    await rename(original, path.join(sourceRoot, `next.config.source${extension}`));
    break;
  }
  const configSource = await exists(path.join(sourceRoot, 'next.config.source.ts'))
    ? "let source = (await import('./next.config.source.ts')).default ?? {};"
    : await exists(path.join(sourceRoot, 'next.config.source.mjs'))
      ? "let source = (await import('./next.config.source.mjs')).default ?? {};"
      : await exists(path.join(sourceRoot, 'next.config.source.js'))
        ? "let source = (await import('./next.config.source.js')).default ?? {};"
        : 'let source = {};';
  await writeFile(path.join(sourceRoot, 'next.config.mjs'), `${configSource}\nif (typeof source === 'function') source = await source('phase-production-build', { defaultConfig: {} });\nconst sourceImages = source && typeof source.images === 'object' ? source.images : {};\nexport default { ...(source || {}), output: 'export', trailingSlash: true, basePath: '/previews/${candidate.id}', assetPrefix: '/previews/${candidate.id}', images: { ...sourceImages, unoptimized: true } };\n`);

  const nextBin = path.join(sourceRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
  await run(process.execPath, [nextBin, 'build'], { cwd: sourceRoot, env: safeEnv({ NODE_ENV: 'production' }) });
  const builtRoot = path.join(sourceRoot, 'out');
  if (!(await exists(builtRoot))) throw new Error('Recovered REF-001 build did not produce out/.');
  const rewrittenFiles = await rewriteBuiltText(builtRoot, topNames);
  const destination = path.join(outputRoot, candidate.id);
  await rm(destination, { recursive: true, force: true });
  await cp(builtRoot, destination, { recursive: true });
  const compatibilityAdjustments = [
    `Marked ${patchedMetadata} robots/sitemap metadata route(s) force-static inside the isolated export workspace so Next.js can statically export metadata endpoints; the creator repository is unchanged.`,
    'Wrapped the pinned Next.js source with an isolated static-export config using the existing /previews/REF-NNN base path; no separate deployment was created.',
    'Kept the small original public asset set inside this preview output rather than introducing another hosting project or runtime dependency.'
  ];
  await writeFile(path.join(destination, 'SOURCE.md'), `# Original reference\n\nCreator: Gireesh Kumar Reddy\nRepository: https://github.com/gireeshkumarreddy/${candidate.repo}\nCommit: ${candidate.commit}\n\nCentralized authorized design-study preview. This is not a separate deployment or a Zyberlane client project.\n\n${compatibilityAdjustments.map(item => `- ${item}`).join('\n')}\n`);

  Object.assign(previous, {
    strategy: 'next-recovery',
    assetRoot: null,
    status: 'built',
    compatibilityAdjustments,
    rewrittenFiles,
    preview: `/previews/${candidate.id}/`,
    finishedAt: new Date().toISOString(),
  });
  delete previous.error;
  results.built = results.results.filter(item => item.status === 'built').length;
  results.failed = results.results.filter(item => item.status !== 'built').length;
  results.ref001Recovery = 'Static export succeeded after isolating robots/sitemap metadata as force-static; visual browser verification is still required.';
  await writeFile(resultsPath, JSON.stringify(results, null, 2) + '\n');
  console.log(`Recovered REF-001. Total: ${results.built} built, ${results.failed} failed.`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
