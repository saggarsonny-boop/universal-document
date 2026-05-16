const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const utilsDir = path.join(__dirname, 'apps/utilities/src/app');

// 1. Restore all page.tsx to their clean git state first
try {
  execSync('git checkout apps/utilities/src/app/*/page.tsx', { stdio: 'inherit' });
} catch (e) {
  console.log("Git checkout failed, maybe already clean or uncommitted.");
}

const targetOpenTag = `<div 
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-neutral-800 hover:border-[#D4AF37] transition-colors rounded-2xl p-16 text-center bg-[#111] cursor-pointer"
        >`;

const newOpenTag = `<div className="relative border-2 border-dashed border-neutral-800 hover:border-[#D4AF37] transition-colors rounded-2xl p-16 text-center bg-[#111] cursor-pointer">
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => { if (e.target.files && e.target.files[0]) setFile(e.target.files[0]); }} />`;

const dirs = fs.readdirSync(utilsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== 'api' && dirent.name !== 'auth' && dirent.name !== 'components' && dirent.name !== 'pricing')
  .map(dirent => dirent.name);

let updated = 0;

dirs.forEach(engineName => {
  const pagePath = path.join(utilsDir, engineName, 'page.tsx');
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf-8');
    if (content.includes(targetOpenTag)) {
      content = content.replace(targetOpenTag, newOpenTag);
      // Also update the text to be universal
      content = content.replace(/>Drag & Drop a \.uds file here</g, '>Drag & Drop a file here<');
      fs.writeFileSync(pagePath, content, 'utf-8');
      updated++;
    } else {
      console.log(`Warning: ${engineName} did not match open tag.`);
    }
  }
});

console.log(`Successfully patched ${updated} utility engines with file inputs.`);
