const fs = require('fs');
const path = require('path');

const srcDir = path.join(process.cwd(), 'src', 'components');

const targetFiles = [
    'Resources.jsx',
    'Gallery.jsx',
    'Events.jsx',
    'Home.jsx',
    'Articles.jsx'
];
const categoriesDir = path.join(srcDir, 'categories');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (dir === categoriesDir && fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        } else if (dir === srcDir && targetFiles.includes(file)) {
            processFile(fullPath);
        } else if (stat.isDirectory()) {
            if (fullPath === categoriesDir) {
                processDirectory(fullPath);
            }
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check for `e.stopPropagation()` without `e.preventDefault()`
    // Using regex to safely inject e.preventDefault() before e.stopPropagation()
    // but only if it doesn't already have e.preventDefault() right before it.
    
    // Replace: onClick={(e) => e.stopPropagation()} 
    // With:    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    const regex1 = /onClick=\{\(e\)\s*=>\s*e\.stopPropagation\(\)\}/g;
    if (regex1.test(content)) {
        content = content.replace(regex1, 'onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}');
        modified = true;
    }

    // Replace: e.stopPropagation(); inside an onClick block but not preceded by e.preventDefault();
    // It's tricky to write a perfect regex for this, but we can just replace `e.stopPropagation();`
    // with `e.preventDefault();\n                              e.stopPropagation();` 
    // ONLY IF `e.preventDefault()` is not in the file or nearby.
    // Actually, simpler: replace all `e.stopPropagation();` with `e.preventDefault(); e.stopPropagation();`
    // but first replace `e.preventDefault(); e.stopPropagation();` with something else, then put it back to avoid doubling.
    
    // First, standardize to avoid duplicates
    content = content.replace(/e\.preventDefault\(\);\s*e\.stopPropagation\(\);/g, 'e.stopPropagation();');
    
    // Now replace `e.stopPropagation();` inside onClick handlers.
    // We only want to do this for buttons, but in these specific files it's safe to do globally
    const regex2 = /e\.stopPropagation\(\);/g;
    if (regex2.test(content)) {
        content = content.replace(regex2, 'e.preventDefault();\n                          e.stopPropagation();');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated click propagation: ' + filePath);
    }
}

processDirectory(srcDir);
