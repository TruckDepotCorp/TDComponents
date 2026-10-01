import fs from 'fs';

function text(p) {
    const s = fs.readFileSync(p, 'utf8');
    const start = s.indexOf('<x-dc>');
    const end = s.indexOf('</x-dc>');
    const body = start >= 0 ? s.slice(start, end) : s;
    const plain = body
        .replace(/<style[\s\S]*?<\/style>/g, '')
        .replace(/<script[\s\S]*?<\/script>/g, '')
        .replace(/<[^>]+>/g, '\n')
        .replace(/\{\{[^}]+\}\}/g, '')
        .split('\n')
        .map((x) => x.trim())
        .filter((x) => x && x.length < 160 && !x.startsWith('style'));
    console.log('\n==== ' + p.split(/[/\\]/).pop() + ' ====');
    console.log([...new Set(plain)].join('\n'));
}

for (const p of process.argv.slice(2)) text(p);
