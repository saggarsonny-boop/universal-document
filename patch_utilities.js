const fs = require('fs');
const path = require('path');

const utilsDir = path.join(__dirname, 'apps/utilities/src/app');

function toTitleCase(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const dropzoneRegex = /<div\s+onDrop=\{handleDrop\}\s+onDragOver=\{\(e\)\s*=>\s*e\.preventDefault\(\)\}\s+className="border-2 border-dashed border-neutral-800 hover:border-\[#D4AF37\] transition-colors rounded-2xl p-16 text-center bg-\[#111\] cursor-pointer"\s*>([\s\S]*?)<\/div>/;

const dirs = fs.readdirSync(utilsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name !== 'api' && dirent.name !== 'auth' && dirent.name !== 'components' && dirent.name !== 'pricing')
  .map(dirent => dirent.name);

let updated = 0;

dirs.forEach(engineName => {
  const pagePath = path.join(utilsDir, engineName, 'page.tsx');
  const layoutPath = path.join(utilsDir, engineName, 'layout.tsx');

  // 1. Generate SEO layout.tsx
  if (!fs.existsSync(layoutPath)) {
    const title = toTitleCase(engineName);
    const layoutContent = `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${title} | Universal Document Utilities",
  description: "AI-Powered Universal Document ${title} engine.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
`;
    fs.writeFileSync(layoutPath, layoutContent, 'utf-8');
  }

  // 2. Patch page.tsx file drop spot
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf-8');
    
    // Check if it already has the input overlay
    if (!content.includes('<input type="file"')) {
      const newDropzone = `<div className="relative border-2 border-dashed border-neutral-800 hover:border-[#D4AF37] transition-colors rounded-2xl p-16 text-center bg-[#111] cursor-pointer">
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

      content = content.replace(dropzoneRegex, newDropzone);
      
      // Also update "Drag & Drop a .uds file here" to just "file" in case the regex missed it due to string differences
      content = content.replace(/>Drag & Drop a \.uds file here</g, '>Drag & Drop a file here<');
      
      fs.writeFileSync(pagePath, content, 'utf-8');
      updated++;
    }
  }
});

console.log(`Successfully patched ${updated} utility engines with file inputs and generated SEO layouts.`);
