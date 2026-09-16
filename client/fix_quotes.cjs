const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src', 'components');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) {
            walk(fp);
        } else if (fp.endsWith('.jsx')) {
            let content = fs.readFileSync(fp, 'utf8');
            let modified = false;

            // Fix: `${API_BASE_URL}/api/...'  ->  `${API_BASE_URL}/api/...`
            // A backtick-started template literal that ends with single quote
            const regex1 = /`(\$\{API_BASE_URL\}\/api\/[^'`"]*?)'/g;
            if (regex1.test(content)) {
                content = content.replace(/`(\$\{API_BASE_URL\}\/api\/[^'`"]*?)'/g, '`$1`');
                modified = true;
            }

            // Fix: `${API_BASE_URL}/api/..."  ->  `${API_BASE_URL}/api/...`
            const regex2 = /`(\$\{API_BASE_URL\}\/api\/[^'`"]*?)"/g;
            if (regex2.test(content)) {
                content = content.replace(/`(\$\{API_BASE_URL\}\/api\/[^'`"]*?)"/g, '`$1`');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fp, content, 'utf8');
                console.log('Fixed mismatched quotes: ' + fp);
            }
        }
    }
}

walk(srcDir);
console.log('Done.');
