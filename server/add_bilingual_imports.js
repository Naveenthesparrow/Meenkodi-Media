// Script to batch-update all detail pages to bilingual
// This adds useBilingualContent import and wraps display fields with getContent

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const detailFiles = [
  'KingDetail.jsx',
  'FestivalDetail.jsx',
  'LiteratureDetail.jsx',
  'DanceDetail.jsx',
  'ClothingDetail.jsx',
  'AncientScienceDetail.jsx'
];

const detailsDir = path.join(__dirname, '../client/src/components/details');

console.log('🔄 Updating detail components for bilingual support...\n');

detailFiles.forEach(fileName => {
  const filePath = path.join(detailsDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipped ${fileName} (not found)`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import if not present
  if (!content.includes('useBilingualContent')) {
    content = content.replace(
      /^(import.*from ["']\.\.\/common\/MediaUpload["'];?\s*\n)/m,
      `$1import { useBilingualContent } from "../../utils/bilingualContent";\n`
    );
  }
  
  // Add getContent hook in component
  if (!content.includes('getContent = useBilingualContent()')) {
    content = content.replace(
      /(const\s+navigate\s*=\s*useNavigate\(\);)/,
      `$1\n  const getContent = useBilingualContent();`
    );
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${fileName}`);
});

console.log('\n✨ Bilingual imports added to all detail components!');
console.log('⚠️  Note: You still need to manually wrap display fields with getContent() and add EN/TA edit inputs.\n');
