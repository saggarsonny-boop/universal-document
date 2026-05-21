const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    if (f === 'node_modules' || f === '.git' || f === '.next') return;
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const appsDir = 'C:\\Users\\Sonny Saggar\\.gemini\\antigravity\\scratch\\universal-document\\apps';

walkDir(appsDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove Priority Support
    content = content.replace(/<p[^>]*>\s*Need help\?\{' '\}\s*<a[^>]*>\s*Priority Support — from \$1\.99\/mo →\s*<\/a>\s*<\/p>\r?\n?/g, '');

    // Remove universaldocument.solutions in UDFooter
    content = content.replace(/<p[^>]*>\s*<a href="https:\/\/universaldocument\.solutions"[^>]*>universaldocument\.solutions<\/a>\s*\{' · '\}\s*<a href="mailto:press@universaldocument\.solutions"[^>]*>press@universaldocument\.solutions<\/a>\s*<\/p>\r?\n?/g, '');

    // Sometimes the press@universaldocument.solutions is just a standalone anchor in pricing/page.tsx
    content = content.replace(/<a href="mailto:press@universaldocument\.solutions[^>]*>[^<]*<\/a>\r?\n?/g, '');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed: ' + filePath);
    }
  }
});
