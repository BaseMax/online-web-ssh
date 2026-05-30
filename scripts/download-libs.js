#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const libs = [
  {
    url: 'https://code.jquery.com/jquery-3.6.0.min.js',
    dest: 'static/js/jquery.min.js',
    name: 'jQuery'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    dest: 'static/js/bootstrap.bundle.min.js',
    name: 'Bootstrap Bundle'
  },

  // XTerm core
  {
    url: 'https://cdn.jsdelivr.net/npm/xterm/lib/xterm.js',
    dest: 'static/js/xterm.min.js',
    name: 'XTerm.js'
  },

  // Fit addon
  {
    url: 'https://cdn.jsdelivr.net/npm/xterm-addon-fit/lib/xterm-addon-fit.js',
    dest: 'static/js/xterm-addon-fit.min.js',
    name: 'XTerm Fit Addon'
  },

  // Bootstrap CSS
  {
    url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    dest: 'static/css/bootstrap.min.css',
    name: 'Bootstrap CSS'
  },

  // XTerm CSS
  {
    url: 'https://cdn.jsdelivr.net/npm/xterm/css/xterm.css',
    dest: 'static/css/xterm.min.css',
    name: 'XTerm CSS'
  }
];

function downloadFile(url, dest, name) {
  return new Promise((resolve, reject) => {
    const destPath = path.join(__dirname, '..', dest);
    const destDir = path.dirname(destPath);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const file = fs.createWriteStream(destPath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${name}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${name} to ${dest}`);
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('Downloading required libraries...\n');

  const errors = [];

  for (const lib of libs) {
    try {
      await downloadFile(lib.url, lib.dest, lib.name);
    } catch (error) {
      console.error(`✗ Error downloading ${lib.name}:`, error.message);
      errors.push({ lib: lib.name, error: error.message });
    }
  }

  console.log('\n-------------------------------------------');

  if (errors.length === 0) {
    console.log('✓ All libraries downloaded successfully!');
    console.log('\nYou can now open index.html in your browser.');
  } else {
    console.error(`\n✗ ${errors.length} download(s) failed:\n`);
    errors.forEach(err => {
      console.error(`  - ${err.lib}: ${err.error}`);
    });
    console.log('\nManual download instructions:');
    console.log('1. Copy each URL from package.json');
    console.log('2. Download the file');
    console.log('3. Save to the specified destination path');
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

downloadAll().catch(console.error);
