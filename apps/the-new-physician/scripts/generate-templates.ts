import fs from 'fs';
import path from 'path';
import { generateTemplate } from '../src/lib/pdf-pipeline';

const templates = [
  'first-72-hours-arrest',
  'supervision-compliance-tracker',
  'talking-to-kids-case'
];

async function main() {
  const outputDir = path.join(__dirname, '..', 'private-templates');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Generating master PDFs and greyscale proofs in: ${outputDir}`);

  for (const slug of templates) {
    try {
      // 1. Generate Color Master
      console.log(`Generating color master for: ${slug}...`);
      const colorBuffer = await generateTemplate(slug, { greyscale: false });
      const colorPath = path.join(outputDir, `${slug}.pdf`);
      fs.writeFileSync(colorPath, colorBuffer);
      console.log(`Saved: ${colorPath}`);

      // 2. Generate Greyscale Proof
      console.log(`Generating greyscale proof for: ${slug}...`);
      const greyBuffer = await generateTemplate(slug, { greyscale: true });
      const greyPath = path.join(outputDir, `${slug}-proof.pdf`);
      fs.writeFileSync(greyPath, greyBuffer);
      console.log(`Saved: ${greyPath}`);
    } catch (e) {
      console.error(`Error generating template ${slug}:`, e);
    }
  }

  console.log('All templates generated successfully!');
}

main().catch(console.error);
