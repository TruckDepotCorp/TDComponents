import fs from 'fs';
const s = fs.readFileSync(process.argv[2], 'utf8');
const needles = process.argv.slice(3);
for (const n of needles) {
    let i = 0;
    let c = 0;
    while ((i = s.indexOf(n, i)) >= 0 && c < 3) {
        console.log('\n--- ' + n + ' @ ' + i + ' ---');
        console.log(s.slice(Math.max(0, i - 80), i + 220).replace(/\s+/g, ' '));
        i += n.length;
        c++;
    }
}
