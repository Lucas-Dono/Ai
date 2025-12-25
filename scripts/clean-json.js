const fs = require('fs');
const path = require('path');

const files = [
  'emily-dickinson.json',
  'jane-austen.json',
  'marcus-washington.json',
];

for (const file of files) {
  const filePath = path.join('Personajes', 'processed', file);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Try to parse it
    const data = JSON.parse(content);
    // Rewrite it cleanly
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ ${file} cleaned`);
  } catch (error) {
    console.log(`❌ ${file}: ${error.message}`);
  }
}
