import fs from 'node:fs';
import path from 'node:path';

const targetFile = path.resolve(
  process.cwd(),
  'node_modules/@novnc/novnc/lib/util/browser.js'
);

const oldSnippet =
  'exports.supportsWebCodecsH264Decode = supportsWebCodecsH264Decode = await _checkWebCodecsH264DecodeSupport();';

const newSnippet = `exports.supportsWebCodecsH264Decode = supportsWebCodecsH264Decode = false;
_checkWebCodecsH264DecodeSupport().then(function (res) {
  exports.supportsWebCodecsH264Decode = supportsWebCodecsH264Decode = res;
});`;

if (!fs.existsSync(targetFile)) {
  console.log('[patch-novnc] Skip: target file not found:', targetFile);
  process.exit(0);
}

const source = fs.readFileSync(targetFile, 'utf8');

if (source.includes(newSnippet)) {
  console.log('[patch-novnc] Already patched');
  process.exit(0);
}

if (!source.includes(oldSnippet)) {
  console.warn('[patch-novnc] Expected source snippet not found, no changes made');
  process.exit(0);
}

const patched = source.replace(oldSnippet, newSnippet);
fs.writeFileSync(targetFile, patched, 'utf8');
console.log('[patch-novnc] Patched successfully');
