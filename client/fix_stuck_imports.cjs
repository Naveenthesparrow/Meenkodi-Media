const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src', 'components');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) walk(fp);
        else if (fp.endsWith('.jsx')) {
            let content = fs.readFileSync(fp, 'utf8');
            let modified = false;

            // Pattern: import {\nimport API_BASE_URL...;\n  SomeIcon,
            // This means the API_BASE_URL import is stuck between `import {` and icons
            const brokenPattern = /import \{[\r\n]+import API_BASE_URL from ['"][^'"]+['"];?[\r\n]+/g;
            if (brokenPattern.test(content)) {
                // Extract the API_BASE_URL import line
                const match = content.match(/import API_BASE_URL from ['"][^'"]+['"];?/);
                const apiImport = match ? match[0] : null;
                
                // Remove it from where it's stuck
                content = content.replace(/import \{[\r\n]+import API_BASE_URL from ['"][^'"]+['"];?[\r\n]+/, 'import {\n');
                
                // Add it after the closing of the import block it was stuck in
                if (apiImport) {
                    // Find the next `} from '@mui/icons-material';` or similar closing
                    content = content.replace(
                        /\} from ['"]@mui\/icons-material['"];?/,
                        (m) => m + '\n' + apiImport + ';'
                    );
                }
                modified = true;
                console.log('Fixed stuck import in: ' + fp);
            }

            // Also check: lines where import API_BASE_URL is glued to end of another import line
            // e.g.: import SEO from "../common/SEO";\rimport API_BASE_URL
            const gluedOnSameLine = /^(import .+ from ['"][^'"]+['"];?)\r?(import API_BASE_URL .+)$/gm;
            const gluedMatches = [...content.matchAll(gluedOnSameLine)];
            if (gluedMatches.length > 0) {
                for (const gm of gluedMatches) {
                    content = content.replace(gm[0], gm[1] + '\n' + gm[2]);
                    modified = true;
                    console.log('Fixed same-line glued import in: ' + fp);
                }
            }

            if (modified) {
                fs.writeFileSync(fp, content, 'utf8');
            }
        }
    }
}

walk(srcDir);
console.log('Done checking all files.');
