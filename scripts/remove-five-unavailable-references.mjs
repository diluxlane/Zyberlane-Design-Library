import { access, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const removedIds = new Set(['REF-011', 'REF-016', 'REF-018', 'REF-046', 'REF-058']);
const removedNames = new Set(['durga', 'gireesh-portfolio', 'GoT', 'siaara', 'VYRN']);

async function exists(target) {
  try { await access(target); return true; } catch { return false; }
}

async function readJson(relative) {
  return JSON.parse(await readFile(path.join(root, relative), 'utf8'));
}

async function writeJson(relative, value) {
  await writeFile(path.join(root, relative), JSON.stringify(value, null, 2) + '\n');
}

function itemMatches(item) {
  if (!item || typeof item !== 'object') return false;
  if (removedIds.has(item.id) || removedIds.has(item.reference)) return true;
  if (removedNames.has(item.repo) || removedNames.has(item.name)) return true;
  if (Array.isArray(item.referenceIds) && item.referenceIds.some(id => removedIds.has(id))) return true;
  if (typeof item.repository === 'string') {
    for (const name of removedNames) if (item.repository.includes(`/gireeshkumarreddy/${name}`)) return true;
  }
  return false;
}

// Catalogue and source inventory.
const catalogue = await readJson('data/catalogue.json');
catalogue.references = (catalogue.references || []).filter(item => !itemMatches(item));
catalogue.inventory = (catalogue.inventory || []).filter(item => !itemMatches(item));
catalogue.discoveredRepositories = catalogue.inventory.length;
catalogue.websiteRepositories = catalogue.inventory.filter(item => item.website === true).length;
catalogue.acceptedWebsiteRepositories = catalogue.inventory.filter(item => item.website === true && item.accepted === true).length;
await writeJson('data/catalogue.json', catalogue);

// Permanent registry: remove the five website mappings but keep allocation monotonic so gaps are never reused.
const registry = await readJson('data/reference-registry.json');
for (const [key, value] of Object.entries(registry.assignments || {})) {
  if (removedIds.has(value) || removedNames.has(key)) delete registry.assignments[key];
}
registry.rule = 'Append new IDs above highestIssuedId. Never renumber existing references or reuse gaps.';
registry.highestIssuedId = 'REF-059';
await writeJson('data/reference-registry.json', registry);

// Structured preview metadata.
for (const relative of ['data/preview-manifest.json', 'data/preview-snapshots.json', 'docs/preview-compatibility.json']) {
  const value = await readJson(relative);
  if (!Array.isArray(value)) throw new Error(`${relative} is not an array`);
  await writeJson(relative, value.filter(item => !itemMatches(item)));
}

const verificationPath = 'docs/preview-verification-2026-10-27.json';
if (await exists(path.join(root, verificationPath))) {
  const verification = await readJson(verificationPath);
  if (Array.isArray(verification.references)) verification.references = verification.references.filter(item => !itemMatches(item));
  await writeJson(verificationPath, verification);
}

const candidatePath = 'data/framework-preview-candidates.json';
if (await exists(path.join(root, candidatePath))) {
  const candidates = await readJson(candidatePath);
  if (Array.isArray(candidates.candidates)) candidates.candidates = candidates.candidates.filter(item => !itemMatches(item));
  if (Array.isArray(candidates.intentionallyNotBuilt)) candidates.intentionallyNotBuilt = candidates.intentionallyNotBuilt.filter(item => !itemMatches(item));
  await writeJson(candidatePath, candidates);
}

const frameworkResultsPath = 'docs/framework-preview-build-results-2026-10-27.json';
if (await exists(path.join(root, frameworkResultsPath))) {
  const results = await readJson(frameworkResultsPath);
  if (Array.isArray(results.results)) results.results = results.results.filter(item => !itemMatches(item));
  if (Array.isArray(results.intentionallyNotBuilt)) results.intentionallyNotBuilt = results.intentionallyNotBuilt.filter(item => !itemMatches(item));
  results.built = Array.isArray(results.results) ? results.results.filter(item => item.status === 'built').length : results.built;
  results.failed = Array.isArray(results.results) ? results.results.filter(item => item.status !== 'built').length : results.failed;
  await writeJson(frameworkResultsPath, results);
}

// Remove Vercel fallbacks for deleted references.
const vercel = await readJson('vercel.json');
if (Array.isArray(vercel.rewrites)) {
  vercel.rewrites = vercel.rewrites.filter(rule => ![...removedIds].some(id => String(rule.source || '').includes(id)));
}
await writeJson('vercel.json', vercel);

// Remove committed artifacts whose paths identify a deleted reference/repository.
async function removeNamedArtifacts(directory) {
  const absolute = path.join(root, directory);
  if (!(await exists(absolute))) return;
  for (const entry of await readdir(absolute, { withFileTypes: true })) {
    const full = path.join(absolute, entry.name);
    const shouldRemove = [...removedIds, ...removedNames].some(token => entry.name === token || entry.name.includes(token));
    if (shouldRemove) {
      await rm(full, { recursive: true, force: true });
      continue;
    }
    if (entry.isDirectory()) await removeNamedArtifacts(path.relative(root, full));
  }
}
for (const directory of ['public/previews', 'public/screenshots', 'encoded-assets']) await removeNamedArtifacts(directory);

// Keep documentation counts truthful after removal.
let readme = await readFile(path.join(root, 'README.md'), 'utf8');
readme = readme
  .replace('Discovery on 2026-10-24 found 68 accessible repositories. 59 contain a website implementation, including variants/redirects. 54 repository implementations were accepted; the six distinct landing-concepts sites receive separate IDs, making 59 catalogue entries.', 'The maintained library now contains 63 inventoried repositories. 54 contain a website implementation, including variants/redirects. 49 repository implementations are accepted; the six distinct landing-concepts sites receive separate IDs, making 54 catalogue entries.')
  .replace('The October 27 catalogue records 33 working, 21 partial and 5 unavailable previews.', 'The October 27 catalogue records 33 working and 21 partial previews, with no unavailable entries retained in the library.')
  .replace('Some source-only entries have no live preview because their required media or runtime is unavailable.', 'Every retained reference has at least a working or build-verified partial preview.')
  .replace('Unavailable previews must retain their actual reason; never substitute a generated image or claim a source-only build is working.', 'If a future reference cannot produce a usable preview, remove it from the maintained library rather than substituting a generated image or claiming it is working.');
await writeFile(path.join(root, 'README.md'), readme);

const architecturePath = path.join(root, 'docs/ARCHITECTURE.md');
if (await exists(architecturePath)) {
  let architecture = await readFile(architecturePath, 'utf8');
  const snapshots = await readJson('data/preview-snapshots.json');
  const manifest = await readJson('data/preview-manifest.json');
  const snapshotCount = snapshots.length;
  const sourceFileCount = manifest.length;
  architecture = architecture
    .replace(/The build restores \d+ immutable source text files across \d+ static snapshots, in addition to two original Vite builds\./, `The build restores ${sourceFileCount} immutable source text files across ${snapshotCount} static snapshots, in addition to two original Vite builds.`)
    .replace(/ REF-016 includes its original 946 KB data module, verified against its Git blob checksum\. No design logic was replaced\./, ' No design logic was replaced.')
    .replace(/It records 12 working openings, four partial previews and two unavailable openings\./, 'It records 12 working openings and four partial previews; the two unavailable references were removed from the maintained library.')
    .replace(/The catalogue totals are 33 working, five partial and 21 unavailable, including the previously checked external previews\./, 'The retained catalogue totals are 33 working and 21 partial previews; unavailable references are not retained.')
    .replace(/18 prepared central previews/g, '16 previously browser-checked central previews');
  await writeFile(architecturePath, architecture);
}

console.log('Removed five unavailable references from catalogue, inventory, preview metadata, rewrites and committed artifacts.');
