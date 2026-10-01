import fs from 'fs';
const file = process.argv[2];
const s = fs.readFileSync(file, 'utf8');
const start = process.argv[3];
const end = process.argv[4];
const a = s.indexOf(start);
const b = end ? s.indexOf(end, a + start.length) : a + 20000;
const chunk = s.slice(a, b < 0 ? a + 20000 : b);
const plain = chunk
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, '\n')
    .replace(/\{\{[^}]*\}\}/g, '')
    .split('\n')
    .map((x) => x.replace(/\s+/g, ' ').trim())
    .filter((x) => x && x.length < 160 && !x.startsWith('style') && !x.includes('var(--') && !x.includes('function'));
console.log([...new Set(plain)].join('\n'));
