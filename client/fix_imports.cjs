const fs = require('fs');
const path = require('path');
const srcDir = path.join(process.cwd(), 'src', 'components');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Fix backslashes in API_BASE_URL imports
            const regex = /import API_BASE_URL from ['"](.*?)['"]/g;
            content = content.replace(regex, (match, p1) => {
                const fixed = p1.replace(/\\/g, '/');
                if (fixed !== p1) { modified = true; }
                return "import API_BASE_URL from '" + fixed + "'";
            });
            
            // Fix double imports on same line just in case
            if (content.includes(";import API_BASE_URL")) {
                content = content.replace(/;import API_BASE_URL/g, ";\nimport API_BASE_URL");
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed imports in ' + fullPath);
            }
        }
    }
}
processDirectory(srcDir);
