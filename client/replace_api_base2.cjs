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

    // We want to match:
    // `/api/...`  -> `${API_BASE_URL}/api/...`
    // '/api/...'  -> `${API_BASE_URL}/api/...`
    // "/api/..."  -> `${API_BASE_URL}/api/...`
    // BUT NOT `${API_BASE_URL}/api/...`

    // Regex to match string boundaries followed by /api/ that are NOT preceded by API_BASE_URL}
    // Negative lookbehind is not fully safe in all regex engines but node supports it: /(?<!\$\{API_BASE_URL\})(['"`])\/api\//g
    
    const regex = /(?<!\$\{API_BASE_URL\})\`\/api\//g;
    if (regex.test(content)) {
        content = content.replace(/(?<!\$\{API_BASE_URL\})\`\/api\//g, '`${API_BASE_URL}/api/');
        modified = true;
    }

    const regexSingle = /(?<!\$\{API_BASE_URL\})'\/api\//g;
    if (regexSingle.test(content)) {
        // since we are wrapping in backticks to use API_BASE_URL, we need to convert the whole string to template literal
        // it's easier to just do: '`${API_BASE_URL}/api/' + '...' if it was just '/api/...', but actually if we replace '/api/ with `${API_BASE_URL}/api/ we must change the closing quote to ` too.
        // It's simpler to just do: `${API_BASE_URL}` + '/api/...'
        // Wait, replacing '/api/ with `${API_BASE_URL}` + '/api/ is perfectly valid JS!
        // Let's do that for single and double quotes.
        content = content.replace(/(?<!\$\{API_BASE_URL\})'\/api\//g, "`${API_BASE_URL}` + '/api/");
        modified = true;
    }

    const regexDouble = /(?<!\$\{API_BASE_URL\})\"\/api\//g;
    if (regexDouble.test(content)) {
        content = content.replace(/(?<!\$\{API_BASE_URL\})\"\/api\//g, '`${API_BASE_URL}` + "/api/');
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
        console.log('Updated standalone API strings: ' + filePath);
    }
}

processDirectory(srcDir);
