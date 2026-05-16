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

const originalBlock = `<div 
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-neutral-800 hover:border-[#D4AF37] transition-colors rounded-2xl p-16 text-center bg-[#111] cursor-pointer"
        >
          {file ? (
            <div className="space-y-2">
              <p className="text-emerald-400 font-mono text-lg">📄 {file.name}</p>
              <p className="text-neutral-500 text-xs">Ready for processing</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-neutral-300 font-medium">Drag & Drop a .uds file here</p>
              <p className="text-neutral-600 text-sm">or click to browse</p>
            </div>
          )}
        </div>`;

const newBlock = `<div className="relative border-2 border-dashed border-neutral-800 hover:border-[#D4AF37] transition-colors rounded-2xl p-16 text-center bg-[#111] cursor-pointer">
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => { if (e.target.files && e.target.files[0]) setFile(e.target.files[0]); }} />
          {file ? (
            <div className="space-y-2 pointer-events-none">
              <p className="text-emerald-400 font-mono text-lg">📄 {file.name}</p>
              <p className="text-neutral-500 text-xs">Ready for processing</p>
            </div>
          ) : (
            <div className="space-y-2 pointer-events-none">
              <p className="text-neutral-300 font-medium">Drag & Drop a file here</p>
              <p className="text-neutral-600 text-sm">or click to browse</p>
            </div>
          )}
        </div>`;

const dirs = fs.readdirSync(utilsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== 'api' && dirent.name !== 'auth' && dirent.name !== 'components' && dirent.name !== 'pricing')
  .map(dirent => dirent.name);

let updated = 0;

dirs.forEach(engineName => {
  const pagePath = path.join(utilsDir, engineName, 'page.tsx');
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf-8');
    if (content.includes(originalBlock)) {
      content = content.replace(originalBlock, newBlock);
      fs.writeFileSync(pagePath, content, 'utf-8');
      updated++;
    } else {
      console.log(`Warning: ${engineName} did not match exact block.`);
    }
  }
});

console.log(`Successfully patched ${updated} utility engines with exact file inputs.`);
