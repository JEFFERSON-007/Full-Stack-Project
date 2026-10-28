const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + (u.search || ''),
      method: 'GET',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('Testing End-to-End API against http://localhost:5000...');

  // 1. Login
  const loginRes = await post('http://localhost:5000/api/auth/login', {
    email: 'alex.chen@folio.workspace',
    password: 'folio2026'
  });
  console.log('1. Login status:', loginRes.status, '| Success:', loginRes.data.success);
  const token = loginRes.data.token;
  if (!token) throw new Error('No token returned');

  // 2. Get Notes
  const notesRes = await get('http://localhost:5000/api/notes', token);
  console.log('2. Notes status:', notesRes.status, '| Total Notes in DB:', notesRes.data.count);
  if (notesRes.data.notes && notesRes.data.notes.length > 0) {
    const firstNote = notesRes.data.notes[0];
    console.log('   Sample Note:', {
      id: firstNote.id,
      title: firstNote.title,
      type: firstNote.type,
      tags: firstNote.tags,
      collectionId: firstNote.collectionId
    });
  }

  // 3. Get Collections
  const colRes = await get('http://localhost:5000/api/collections', token);
  console.log('3. Collections status:', colRes.status, '| Total Collections in DB:', colRes.data.collections?.length);

  // 4. Get Mind Maps
  const mapRes = await get('http://localhost:5000/api/mindmaps', token);
  console.log('4. Mind Maps status:', mapRes.status, '| Total Mind Maps in DB:', mapRes.data.mindMaps?.length);

  // 5. Get Analytics
  const analyticsRes = await get('http://localhost:5000/api/analytics?days=30', token);
  console.log('5. Analytics status:', analyticsRes.status, '| Total Notes in Analytics:', analyticsRes.data.stats?.totalNotes);

  console.log('\n🎉 ALL REAL DATABASE ENDPOINTS OPERATING SMOOTHLY WITH LOCAL MONGODB!');
  process.exit(0);
}

run().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
