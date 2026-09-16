const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src', 'components');
const apiUtilsPath = path.join(process.cwd(), 'src', 'utils', 'api');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if we need to replace
    const hasSingleQuoteFetch = content.includes("fetch('/api/");
    const hasBacktickFetch = content.includes("fetch(`/api/");
    
    if (!hasSingleQuoteFetch && !hasBacktickFetch) return;

    // Perform replacement
    if (hasSingleQuoteFetch) {
        content = content.replace(/fetch\('\/api\//g, 'fetch(`${API_BASE_URL}/api/');
        modified = true;
    }
    
    if (hasBacktickFetch) {
        content = content.replace(/fetch\(\`\/api\//g, 'fetch(`${API_BASE_URL}/api/');
        modified = true;
    }

    if (modified) {
        if (!content.includes('import API_BASE_URL')) {
            const relPath = path.relative(path.dirname(filePath), apiUtilsPath).replace(/\\\\/g, '/');
            const importStatement = `import API_BASE_URL from '${relPath.startsWith('.') ? relPath : './' + relPath}';\n`;
            
            const importMatches = [...content.matchAll(/^import .*$/gm)];
            if (importMatches.length > 0) {
                const lastMatch = importMatches[importMatches.length - 1];
                const insertPos = lastMatch.index + lastMatch[0].length + 1;
                content = content.slice(0, insertPos) + importStatement + content.slice(insertPos);
            } else {
                content = importStatement + content;
            }
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + filePath);
    }
}

processDirectory(srcDir);
