/**
 * Test WebSocket Ultra-Simple - Pas de blocage
 * Test manuel avec curl + telnet
 */

console.log('🧪 TEST WEBSOCKET - MÉTHODE ALTERNATIVE');
console.log('==========================================\n');

console.log('📋 ÉTAPE 1: Vérifier si le serveur tourne');
console.log('curl -s http://localhost:3000/health');
console.log('# Doit retourner: {"status":"ok",...}\n');

console.log('📋 ÉTAPE 2: Vérifier les routes WebSocket');
console.log('curl -s http://localhost:3000/api/ws/stats');
console.log('# Doit retourner les stats WebSocket\n');

console.log('📋 ÉTAPE 3: Test WebSocket avec telnet');
console.log('telnet localhost 3000');
console.log('# Puis taper: GET /ws/notifications?token=test HTTP/1.1');
console.log('# Host: localhost:3000');
console.log('# Upgrade: websocket');
console.log('# Connection: Upgrade');
console.log('# Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==');
console.log('# Sec-WebSocket-Version: 13');
console.log('# (ligne vide)\n');

console.log('📋 ÉTAPE 4: Test avec client WebSocket simple');
console.log('# Copier-coller ce code dans test-ws.html:');
console.log(`
<script>
const ws = new WebSocket('ws://localhost:3000/ws/notifications?token=test');
ws.onopen = () => console.log('✅ CONNECTÉ');
ws.onerror = (e) => console.log('❌ ERREUR:', e);
ws.onmessage = (e) => console.log('📨 MESSAGE:', e.data);
</script>
`);

console.log('📋 ÉTAPE 5: Vérifier les dépendances');
console.log('cd backend && npm list ws');
console.log('# Doit montrer ws@8.x.x installé\n');

console.log('🔍 SI ERREURS POSSIBLES:');
console.log('- Port 3000 déjà utilisé? netstat -an | grep 3000');
console.log('- Dependencies manquantes? npm install');
console.log('- JWT secret manquant? export JWT_SECRET=test-secret\n');

console.log('✅ LANCEZ CES COMMANDES UNE PAR UNE:');
