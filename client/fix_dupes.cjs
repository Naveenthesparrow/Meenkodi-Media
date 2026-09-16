const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src', 'components');
let fixCount = 0;

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) walk(fp);
        else if (fp.endsWith('.jsx')) {
            let content = fs.readFileSync(fp, 'utf8');
            let modified = false;

            // Count how many times API_BASE_URL is imported
            const matches = content.match(/import\s+(?:\{?\s*)?API_BASE_URL(?:\s*\}?)?\s+from\s+['"][^'"]+['"]/g);
            if (matches && matches.length > 1) {
                console.log('DUPLICATE in ' + fp + ': ' + matches.length + ' imports');
                // Keep only the first one, remove all others
                let first = true;
                content = content.replace(/import\s+(?:\{?\s*)?API_BASE_URL(?:\s*\}?)?\s+from\s+['"][^'"]+['"];?\n?/g, (match) => {
                    if (first) { first = false; return match; }
                    return '';
                });
                modified = true;
            }

            // Fix named import { API_BASE_URL } to default import API_BASE_URL
            if (content.includes('import { API_BASE_URL }')) {
                content = content.replace(/import \{ API_BASE_URL \}/g, 'import API_BASE_URL');
                console.log('Fixed named->default import in ' + fp);
                modified = true;
            }

            // Fix imports glued to end of previous line (no newline before import)
            // e.g.: import SEO from "../common/SEO";\rimport API_BASE_URL from ...
            const gluedRegex = /([^\n])(import API_BASE_URL)/g;
            if (gluedRegex.test(content)) {
                content = content.replace(/([^\n])(import API_BASE_URL)/g, '$1\n$2');
                console.log('Fixed glued import in ' + fp);
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fp, content, 'utf8');
                fixCount++;
            }
        }
    }
}

walk(srcDir);
console.log('Fixed ' + fixCount + ' files.');
