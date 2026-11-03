
const fs = require('node:fs');
const path = require('node:path');

const source = path.resolve(
  '.github/workflows/page-trigger.yml'
);

const destination = path.resolve(
  'dist/.github/workflows/page-trigger.yml'
);

if (!fs.existsSync('dist/index.html')) {
  throw new Error('Brak gotowej kompilacji w dist/');
}

fs.mkdirSync(path.dirname(destination), {
  recursive: true
});

fs.copyFileSync(source, destination);

console.log('Page trigger prepared.');