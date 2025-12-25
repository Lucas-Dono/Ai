const fs = require('fs');

const file = 'Personajes/processed/emily-dickinson.json';
const content = fs.readFileSync(file, 'utf-8');

console.log('File size:', content.length);
console.log('Character at position 44243:', content.charCodeAt(44243), content[44243]);
console.log('Context around position 44243:');
console.log(content.substring(44230, 44260));

// Try to find where the JSON actually ends
let lastBrace = content.lastIndexOf('}');
console.log('\nLast closing brace at position:', lastBrace);
console.log('Content after last brace:', content.substring(lastBrace + 1));
