const fs = require('fs');
const path = require('path');

const utilsDir = path.join(__dirname, 'apps/utilities/src/app');

const dirs = fs.readdirSync(utilsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== 'api' && dirent.name !== 'auth' && dirent.name !== 'components' && dirent.name !== 'pricing')
  .map(dirent => dirent.name);

let updated = 0;

dirs.forEach(engineName => {
  const pagePath = path.join(utilsDir, engineName, 'page.tsx');
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf-8');
    
    let originalLength = content.length;
    
    // Remove import
    content = content.replace(/import\s+TooltipTour\s+from\s+['"]@\/components\/TooltipTour['"];?\n?/g, '');
    
    // Remove component
    content = content.replace(/<TooltipTour\s+[^>]*\/>/g, '');
    
    if (content.length !== originalLength) {
      fs.writeFileSync(pagePath, content, 'utf-8');
      updated++;
    }
  }
});

console.log(`Successfully removed TooltipTour from ${updated} utility engines.`);
