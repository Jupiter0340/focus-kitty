const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, p), 'utf8');
const portrait = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'assets/umaru-hd.png')).toString('base64');
const html = read('src/template.html').replace('UMARU_ASSET', portrait).replace('/* EMBED_STYLES */', read('src/style.css')).replace('/* EMBED_SCRIPTS */', ['state.js', 'room.js', 'app.js'].map(p => read('src/' + p)).join('\n'));
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('Built standalone index.html (' + Buffer.byteLength(html) + ' bytes)');
