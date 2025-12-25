const fs = require('fs');
const file = 'Personajes/processed/emily-dickinson.json';

// Read as buffer to see raw bytes
const buffer = fs.readFileSync(file);
console.log('Buffer length:', buffer.length);
console.log('Bytes around position 44243:');
for (let i = 44235; i < Math.min(44255, buffer.length); i++) {
  const byte = buffer[i];
  const char = String.fromCharCode(byte);
  console.log(`${i}: ${byte} (0x${byte.toString(16)}) '${char.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`);
}

// Try to find the actual end of valid JSON by parsing incrementally
let validJson = '';
for (let i = buffer.length; i > 0; i--) {
  try {
    const test = buffer.slice(0, i).toString('utf-8');
    JSON.parse(test);
    validJson = test;
    console.log('\n✅ Valid JSON found at length:', i);
    break;
  } catch (e) {
    // Continue
  }
}

if (validJson) {
  fs.writeFileSync(file, validJson, 'utf-8');
  console.log('✅ File fixed and rewritten');
}
