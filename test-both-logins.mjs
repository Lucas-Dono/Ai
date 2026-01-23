import fetch from 'node-fetch';

async function testLogin(endpoint, name) {
  console.log(`\n========== Testing ${name} ==========`);
  
  const response = await fetch(`http://localhost:3000${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'lucasdono391@gmail.com',
      password: 'Monster98!',
    }),
  });
  
  const status = response.status;
  const data = await response.json();
  
  console.log('Status:', status);
  console.log('Response:', JSON.stringify(data, null, 2));
  
  return { status, data };
}

async function main() {
  console.log('Probando ambos endpoints con las mismas credenciales...\n');
  
  const webLogin = await testLogin('/api/auth/login', 'Web Login');
  const minecraftLogin = await testLogin('/api/auth/minecraft-login', 'Minecraft Login');
  
  console.log('\n========== COMPARACIÓN ==========');
  console.log('Web Login:', webLogin.status === 200 ? 'ÉXITO ✅' : 'FALLO ❌');
  console.log('Minecraft Login:', minecraftLogin.status === 200 ? 'ÉXITO ✅' : 'FALLO ❌');
}

main().catch(console.error);
