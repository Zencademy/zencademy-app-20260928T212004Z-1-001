const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'app', '(tabs)', 'EbookScreen.tsx');
let t = fs.readFileSync(p, 'utf8');

t = t.replace(/status: 'under-development'/g, "status: 'available'");
t = t.replace(/pages: 0, \/\/ Under development/g, 'pages: 40,');

const oldOpen = /const openEbook = \(ebook: Ebook\) => \{[\s\S]*?\n  \};/;
const newOpen = `const openEbook = (ebook: Ebook) => {
    router.push(\`/ebooks/\${ebook.id}\` as any);
  };`;
if (!oldOpen.test(t)) {
  console.error('openEbook not found');
  process.exit(1);
}
t = t.replace(oldOpen, newOpen);

t = t.replace(
  /\s*if \(ebook\.status === 'under-development'\) \{\s*Alert\.alert\('Not ready', 'This title is still in production\.'\);\s*return;\s*\}/g,
  ''
);

if (!t.includes('ebookContent/catalog')) {
  t = t.replace(
    "import { BUYABLE_EBOOK_IDS, ebookPlanPrice } from '../../lib/ebookAccess';",
    "import { BUYABLE_EBOOK_IDS, ebookPlanPrice } from '../../lib/ebookAccess';\nimport { getEbookContent } from '../../lib/ebookContent/catalog';"
  );
}

t = t.replace(
  'const priceOf = (ebook: Ebook) => ebookPlanPrice(ebook.id) ?? ebookCoinPrice(ebook);',
  'const priceOf = (ebook: Ebook) => getEbookContent(ebook.id)?.price ?? ebookPlanPrice(ebook.id) ?? ebookCoinPrice(ebook);'
);

// Sync page counts from catalog at module load where possible via comment — runtime merge below
if (!t.includes('const ebooksWithPages')) {
  t = t.replace(
    'const filteredEbooks = ebooks.filter',
    `const ebooksWithPages = ebooks.map((ebook) => {
    const content = getEbookContent(ebook.id);
    return content ? { ...ebook, pages: content.pages, status: 'available' as const } : ebook;
  });

  const filteredEbooks = ebooksWithPages.filter`
  );
}

fs.writeFileSync(p, t);
console.log('patched', p);
