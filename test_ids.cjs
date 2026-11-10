const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const matches = [...html.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
console.log('Total getElementById calls:', matches.length);
const uniqueIds = [...new Set(matches)];

const missingIds = [];
for (const id of uniqueIds) {
  // Ignore dynamic IDs like inv-diff-badge-*, inv-impact-val-*, sort-icon-*
  if (id.startsWith('inv-diff-badge-') || id.startsWith('inv-impact-val-') || id.startsWith('sort-icon-')) {
    continue;
  }
  if (!html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
    missingIds.push(id);
  }
}
console.log('Missing static IDs in HTML:', missingIds);
