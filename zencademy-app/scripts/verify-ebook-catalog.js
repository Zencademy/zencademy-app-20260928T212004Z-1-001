const fs = require('fs');
const t = fs.readFileSync('lib/ebookContent/catalog.ts', 'utf8');
const ids = [...t.matchAll(/^\s+'(\d+)': \{/gm)].map((m) => m[1]);
const pages = [...t.matchAll(/pages: (\d+)/g)].map((m) => +m[1]);
console.log({ books: ids.length, first: ids[0], last: ids[ids.length - 1], pages: pages[0] });
