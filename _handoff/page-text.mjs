import fs from 'fs';
const s = fs.readFileSync(process.argv[2], 'utf8');
const ids = process.argv.slice(3);
for (const id of ids) {
    const mark = `pg.${id}`;
    const i = s.indexOf(mark);
    if (i < 0) {
        console.log('\n==== ' + id + ' MISSING ====');
        continue;
    }
    const chunk = s.slice(i, i + 14000);
    const plain = chunk
        .replace(/<[^>]+>/g, '\n')
        .replace(/\{\{[^}]*\}\}/g, '')
        .split('\n')
        .map((x) => x.trim())
        .filter((x) => x && x.length < 140 && !x.startsWith('style') && !x.includes('var(--'));
    console.log('\n==== ' + id + ' ====');
    console.log([...new Set(plain)].slice(0, 90).join('\n'));
}
