const fs = require('fs');

const lines = fs.readFileSync('server/index.js', 'utf8').split('\n');
const routes = [];

lines.forEach((l, i) => {
    const match = l.match(/app\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/);
    if (match) {
        routes.push(`${i + 1}: ${match[1].toUpperCase()} ${match[2]}`);
    }
});

fs.writeFileSync('routes_list.txt', routes.join('\n'));
console.log('Saved routes to routes_list.txt');
