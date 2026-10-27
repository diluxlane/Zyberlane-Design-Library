import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);
const resultsPath = path.resolve(root, args.get('--results') || '.generated/framework-preview-results.json');
const generatedRoot = path.resolve(root, args.get('--generated') || '.generated/framework-previews');
const results = JSON.parse(await readFile(resultsPath, 'utf8'));
const built = results.results.filter(item => item.status === 'built');

const cataloguePath = path.join(root, 'data/catalogue.json');
const catalogue = JSON.parse(await readFile(cataloguePath, 'utf8'));
const byId = new Map(catalogue.references.map(reference => [reference.id, reference]));

for (const result of built) {
  const reference = byId.get(result.id);
  if (!reference) throw new Error(`Missing catalogue reference ${result.id}`);
  const source = path.join(generatedRoot, result.id);
  const destination = path.join(root, 'public/previews', result.id);
  await rm(destination, { recursive: true, force: true });
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });

  reference.preview = `/previews/${result.id}/`;
  reference.previewType = 'local';
  reference.status = 'Partial';
  reference.thumbnail = null;
  reference.buildVerified = true;
  reference.preparedPreview = `/previews/${result.id}/`;
  reference.buildCheckedAt = result.finishedAt;
  reference.verificationScope = 'Pinned-source static build verified; browser rendering and hosted asset delivery still require visual verification.';
  reference.previewReason = 'Pinned source now builds into the existing centralized /previews/ host. This remains Partial until the rendered design and media are browser-verified.';
  reference.compatibilityNotes = result.compatibilityAdjustments;
  delete reference.checkedAt;
  delete reference.visualEvidence;
  delete reference.screenshotNote;
}

await writeFile(cataloguePath, JSON.stringify(catalogue, null, 2) + '\n');

const vercelPath = path.join(root, 'vercel.json');
const vercel = JSON.parse(await readFile(vercelPath, 'utf8'));
vercel.rewrites ||= [];
const existingSources = new Set(vercel.rewrites.map(rule => rule.source));
const newRules = [];
for (const result of built) {
  if (!result.assetRoot) continue;
  const source = `/previews/${result.id}/:path*`;
  if (existingSources.has(source)) continue;
  const repo = encodeURIComponent(result.repo);
  const rootPath = result.assetRoot.split('/').map(segment => encodeURIComponent(segment)).join('/');
  const destination = `https://raw.githubusercontent.com/gireeshkumarreddy/${repo}/${result.commit}/${rootPath}/:path*`;
  newRules.push({ source, destination });
  existingSources.add(source);
}
if (newRules.length) {
  const appRouteIndex = vercel.rewrites.findIndex(rule => rule.source === '/reference/:id');
  const index = appRouteIndex >= 0 ? appRouteIndex : vercel.rewrites.length;
  vercel.rewrites.splice(index, 0, ...newRules);
}
await writeFile(vercelPath, JSON.stringify(vercel, null, 2) + '\n');

const datedResults = path.join(root, 'docs/framework-preview-build-results-2026-10-27.json');
await writeFile(datedResults, JSON.stringify(results, null, 2) + '\n');

const counts = catalogue.references.reduce((acc, reference) => {
  acc[reference.status] = (acc[reference.status] || 0) + 1;
  return acc;
}, {});
const readmePath = path.join(root, 'README.md');
let readme = await readFile(readmePath, 'utf8');
readme = readme.replace(
  /The October 27 catalogue records \d+ working, \d+ partial and \d+ unavailable previews\.[^\n]*/,
  `The October 27 catalogue records ${counts.Working || 0} working, ${counts.Partial || 0} partial and ${counts.Unavailable || 0} unavailable previews. Framework-generated partial previews are build-verified inside this repository but remain Partial until browser rendering and hosted asset delivery are visually verified.`
);
const marker = '## Preview architecture';
if (!readme.includes('### Framework preview expansion')) {
  readme = readme.replace(marker, `### Framework preview expansion\n\nFramework-only references are prebuilt from immutable creator commits in GitHub Actions, then the generated static runtime is committed under \`public/previews/REF-NNN/\`. The existing Vercel project only serves those committed files; no additional Vercel projects or separate reference deployments are created. Original public media stays in the creator repository and is requested through the same commit-pinned fallback rewrite pattern already used by the central previews. Builds run with dependency install scripts disabled and a sanitized child-process environment. A successful build is marked Partial until browser QA verifies the rendered identity and media.\n\n${marker}`);
}
await writeFile(readmePath, readme);

console.log(`Applied ${built.length} centralized framework preview build(s).`);
console.log(`Catalogue: ${counts.Working || 0} Working, ${counts.Partial || 0} Partial, ${counts.Unavailable || 0} Unavailable.`);
