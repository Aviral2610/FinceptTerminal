const fs = require('fs');
const path = require('path');

const localesDir = './public/locales';
const langs = fs.readdirSync(localesDir).filter(f =>
    fs.statSync(path.join(localesDir, f)).isDirectory()
);

let errors = [];
let total = 0;
let filesByLang = {};

langs.forEach(lang => {
    const langDir = path.join(localesDir, lang);
    const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));
    filesByLang[lang] = files.length;

    files.forEach(file => {
        total++;
        try {
            const content = fs.readFileSync(path.join(langDir, file), 'utf8');
            JSON.parse(content);
        } catch (e) {
            errors.push(`${lang}/${file}: ${e.message}`);
        }
    });
});

console.log(`\n=== Translation File Validation ===`);
console.log(`Checked ${total} files across ${langs.length} languages`);
console.log(`\nFiles per language:`);
Object.entries(filesByLang).forEach(([lang, count]) => {
    console.log(`  ${lang}: ${count} files`);
});

if (errors.length > 0) {
    console.log(`\n❌ Found ${errors.length} errors:`);
    errors.forEach(e => console.log('  - ' + e));
} else {
    console.log(`\n✅ All JSON files are valid!`);
}
