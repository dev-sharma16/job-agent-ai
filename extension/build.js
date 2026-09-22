const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const isWatch = process.argv.includes('--watch');
const isZip = process.argv.includes('--zip');

const outDir = path.join(__dirname, 'dist');

async function build() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Copy static files
  copyStaticFiles();

  // Build background script
  await esbuild.build({
    entryPoints: ['src/background/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'es2020',
    outfile: path.join(outDir, 'background.js'),
    format: 'esm',
    external: ['chrome'],
    sourcemap: true
  });

  // Build content scripts - Universal scraper for all career sites
  await esbuild.build({
    entryPoints: ['src/content/universal.ts'],
    bundle: true,
    platform: 'node',
    target: 'es2020',
    outfile: path.join(outDir, 'content/universal.js'),
    format: 'iife',
    globalName: 'UniversalScraper',
    external: ['chrome'],
    sourcemap: true
  });

  // Build popup
  await esbuild.build({
    entryPoints: ['src/popup/popup.ts'],
    bundle: true,
    platform: 'node',
    target: 'es2020',
    outfile: path.join(outDir, 'popup.js'),
    format: 'iife',
    external: ['chrome'],
    sourcemap: true
  });

  // Copy manifest
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
  manifest.background = { service_worker: 'background.js', type: 'module' };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // Copy icons (create PNGs from SVG)
  await copyIcons();

  if (isWatch) {
    console.log('Watching for changes...');
  }

  if (isZip) {
    createZip();
  }
}

function copyStaticFiles() {
  const staticFiles = ['popup.html'];
  staticFiles.forEach(file => {
    fs.copyFileSync(path.join(__dirname, file), path.join(outDir, file));
  });

  // Create content directory
  if (!fs.existsSync(path.join(outDir, 'content'))) {
    fs.mkdirSync(path.join(outDir, 'content'), { recursive: true });
  }
}

async function copyIcons() {
  const iconsDir = path.join(outDir, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const src = path.join(__dirname, 'icons', 'icon.svg');
  if (!fs.existsSync(src)) return;

  const sizes = [16, 32, 48, 128];
  for (const size of sizes) {
    const dest = path.join(iconsDir, `icon${size}.png`);
    await sharp(src)
      .resize(size, size)
      .png()
      .toFile(dest);
  }
}

function createZip() {
  try {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();
    zip.addLocalFolder(outDir);
    zip.writeZip(path.join(__dirname, 'autojob-extension.zip'));
    console.log('Extension packaged as autojob-extension.zip');
  } catch {
    console.log('adm-zip not installed, skipping zip creation. Run: npm install adm-zip');
  }
}

build().catch(() => process.exit(1));