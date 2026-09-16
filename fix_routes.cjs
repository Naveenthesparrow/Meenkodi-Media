const fs = require('fs');

let content = fs.readFileSync('server/index.js', 'utf8');

// 1. Move PUT /api/gallery/:id
const putGalleryIdRegex = /app\.put\("\/api\/gallery\/:id"[\s\S]*?(?=\napp\.put\("\/api\/gallery\/folder\/:id")/m;
const putGalleryIdMatch = content.match(putGalleryIdRegex);
if (putGalleryIdMatch) {
    content = content.replace(putGalleryIdMatch[0], '');
    // Insert it before DELETE /api/gallery/:id
    content = content.replace(/app\.delete\("\/api\/gallery\/:id"/, putGalleryIdMatch[0] + '\napp.delete("/api/gallery/:id"');
    console.log('Moved PUT /api/gallery/:id');
}

// 2. Move DELETE /api/gallery/:id
const deleteGalleryIdRegex = /app\.delete\("\/api\/gallery\/:id"[\s\S]*?(?=\napp\.delete\("\/api\/gallery\/folder\/:id")/m;
const deleteGalleryIdMatch = content.match(deleteGalleryIdRegex);
if (deleteGalleryIdMatch) {
    content = content.replace(deleteGalleryIdMatch[0], '');
    // Insert it before the Research folders endpoints section
    content = content.replace(/\/\/ Research folders endpoints/, deleteGalleryIdMatch[0] + '\n// Research folders endpoints');
    console.log('Moved DELETE /api/gallery/:id');
}

// 3. Move PUT /api/seedsandfootprints/folders/:id
const putSeedsIdRegex = /app\.put\("\/api\/seedsandfootprints\/folders\/:id", ensureAdmin, researchUpload\.single\('coverPhoto'\)[\s\S]*?(?=\napp\.delete\("\/api\/seedsandfootprints\/folders\/:id")/m;
const putSeedsIdMatch = content.match(putSeedsIdRegex);
if (putSeedsIdMatch) {
    content = content.replace(putSeedsIdMatch[0], '');
    // Insert it before POST /api/events
    content = content.replace(/app\.post\("\/api\/events"/, putSeedsIdMatch[0] + '\napp.post("/api/events"');
    console.log('Moved PUT /api/seedsandfootprints/folders/:id');
}

fs.writeFileSync('server/index.js', content, 'utf8');
console.log('Routes reordered successfully.');
