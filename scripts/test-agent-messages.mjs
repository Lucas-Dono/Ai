/**
 * Automated Agent Message Testing Script
 * Sends multiple test messages and captures all errors
 */

const BASE_URL = 'http://localhost:3000';
const AGENT_ID = process.env.TEST_AGENT_ID || 'cmgtk7uf20001ijgzd5d19tpb';

// Session cookies for authentication
const SESSION_TOKEN = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoibHpkTkZSUmU3dDduVnZCTjQ0azI1c1Z6WHdXS1gyckUtc2xwcnFZT3VkemdXVlhUSjdLc3ZWTzA5VE0weE92VlVGTHdKZUZJclA3MEoxRENBTjNhSkEifQ..PeaN_evSkRDFsFXNx5SSJw.qtt0YtbAjkkZQrLUChZDi-vK1l4TswnA3Gdi5RXnPGfJ-_Yq8rSZ8iRG9MJf5--mOlkT03YwHdJBf-o_n-iaoYHKXfeZzHoTxli5Hj41Wpt41j-s1qSOWLN2DpKw9ozw9NDGYSWNtCTx16AdTPzpbQWzEzjhYt9InCdDSurmNvdGZEVyvaBiiUT3x-xSyWLQMjOPVgW-07-zw9_4jjoddPJAiJ4UVLD-JS6DotkdHIv32sf8CicvecZHkZ08rXMFbGaWDxcrRUbvFA819YuKrJSm4HEEDePtHA-pxVwDT4k.DreIZM_MJgNFSS9b5AuF8a9runf350SntRRndJZ3xBc';
const CSRF_TOKEN = 'a7c5ae9f3cac366c2266c4cd85ffdbadc344eef8c272885c71c906965b35ba73%7C63946147cef56f6ac8bd6065a1f0256109d69bb2574e382eddfe7d20567552c1';

const TEST_MESSAGES = [
  'Hola, ¿cómo estás?',
  'Me siento un poco triste hoy',
  'Necesito espacio, hablamos luego',
  'Conocí a alguien muy interesante',
  '¿Te gustaría hacer algo juntos?',
  'Estoy muy ocupado últimamente',
  'Te extraño mucho',
  'No me respondiste el otro día',
  'Creo que necesitamos hablar',
  'Todo está bien, no te preocupes'
];

let successCount = 0;
let errorCount = 0;
const errors = [];

async function sendMessage(message, index) {
  const startTime = Date.now();
  
  try {
    console.log(`[TEST ${index + 1}/${TEST_MESSAGES.length}] Sending: "${message}"`);
    
    const response = await fetch(`${BASE_URL}/api/agents/${AGENT_ID}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `authjs.session-token=${SESSION_TOKEN}; authjs.csrf-token=${CSRF_TOKEN}`
      },
      body: JSON.stringify({ content: message }),
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      errorCount++;
      const error = {
        message,
        status: response.status,
        duration: `${duration}ms`,
        error: data.error || 'Unknown error',
        details: data
      };
      
      errors.push(error);
      console.error(`ERROR (${duration}ms):`, JSON.stringify(error, null, 2));
    } else {
      successCount++;
      console.log(`SUCCESS (${duration}ms)`);
    }
  } catch (error) {
    errorCount++;
    errors.push({ message, error: error.message });
    console.error('NETWORK ERROR:', error.message);
  }
}

async function runTests() {
  console.log('Starting automated tests...');
  console.log('Agent ID:', AGENT_ID);
  
  for (let i = 0; i < TEST_MESSAGES.length; i++) {
    await sendMessage(TEST_MESSAGES[i], i);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\nSUMMARY:');
  console.log('Total:', TEST_MESSAGES.length);
  console.log('Success:', successCount);
  console.log('Errors:', errorCount);
  
  if (errors.length > 0) {
    console.log('\nERRORS:');
    const errorsByType = {};
    errors.forEach(err => {
      const key = err.error || 'unknown';
      if (!errorsByType[key]) errorsByType[key] = [];
      errorsByType[key].push(err);
    });
    
    Object.entries(errorsByType).forEach(([type, errs]) => {
      console.log(`\n[${type}] - ${errs.length} occurrence(s)`);
      console.log(JSON.stringify(errs[0], null, 2));
    });
  }
  
  process.exit(errorCount > 0 ? 1 : 0);
}

runTests();
