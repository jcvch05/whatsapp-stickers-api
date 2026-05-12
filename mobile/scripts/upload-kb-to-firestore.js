/**
 * Sube TODA la KB local a Firestore (todas las subcarpetas).
 * Uso: node scripts/upload-kb-to-firestore.js <ruta-a-kb>
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../serviceAccountKey.json');
const KB_PATH = process.argv[2];

if (!KB_PATH) {
  console.error('❌ Debes pasar la ruta a la KB como argumento.');
  console.error('   Ejemplo: node scripts/upload-kb-to-firestore.js ~/Documents/.../knowledge-base');
  process.exit(1);
}

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('❌ Falta serviceAccountKey.json en mobile/');
  process.exit(1);
}

if (!fs.existsSync(KB_PATH)) {
  console.error('❌ No existe la ruta:', KB_PATH);
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)) });
const db = admin.firestore();

function readFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => {
      const full = path.join(dir, f);
      return fs.statSync(full).isFile() && (f.endsWith('.md') || f.endsWith('.json') || f.endsWith('.txt'));
    })
    .map(f => ({
      file: f,
      id: f.replace(/\.(md|json|txt)$/, ''),
      content: fs.readFileSync(path.join(dir, f), 'utf8'),
      ext: path.extname(f),
    }));
}

function parseContent(file, content, ext) {
  if (ext === '.json') {
    try { return JSON.parse(content); } catch { return { contenido: content }; }
  }
  // Para .md y .txt
  const titulo = content.split('\n').find(l => l.startsWith('#'))?.replace(/^#+\s*/, '') || file;
  return { titulo, contenido: content };
}

async function uploadFolder(folderName, folderPath) {
  const files = readFiles(folderPath);
  if (files.length === 0) {
    console.log(`  ⚠️  ${folderName}/ → vacía o sin archivos .md/.json/.txt`);
    return;
  }

  const collectionName = `kb_${folderName.replace(/-/g, '_')}`;
  console.log(`\n📁 ${folderName}/ → colección: ${collectionName} (${files.length} archivos)`);

  const batch = db.batch();
  for (const { file, id, content, ext } of files) {
    const data = parseContent(file, content, ext);
    const docRef = db.collection(collectionName).doc(id);
    batch.set(docRef, {
      ...data,
      _carpeta: folderName,
      _archivo: file,
      _actualizado: new Date().toISOString(),
    }, { merge: true });
    console.log(`  ✅ ${id}`);
  }
  await batch.commit();
}

async function main() {
  console.log('🚀 Subiendo KB completa a Firestore...');
  console.log('   KB path:', KB_PATH);

  // Leer todas las subcarpetas de la KB
  const entries = fs.readdirSync(KB_PATH, { withFileTypes: true });
  const folders = entries
    .filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules')
    .map(e => e.name);

  console.log(`\n📋 Carpetas encontradas: ${folders.join(', ')}`);

  // Subir archivos sueltos en la raíz de la KB
  const rootFiles = readFiles(KB_PATH);
  if (rootFiles.length > 0) {
    console.log(`\n📁 raíz/ → colección: kb_general (${rootFiles.length} archivos)`);
    const batch = db.batch();
    for (const { file, id, content, ext } of rootFiles) {
      const data = parseContent(file, content, ext);
      batch.set(db.collection('kb_general').doc(id), {
        ...data,
        _archivo: file,
        _actualizado: new Date().toISOString(),
      }, { merge: true });
      console.log(`  ✅ ${id}`);
    }
    await batch.commit();
  }

  // Subir cada subcarpeta
  for (const folder of folders) {
    await uploadFolder(folder, path.join(KB_PATH, folder));
  }

  console.log('\n✅ KB subida completa a Firestore');
  console.log('   Colecciones creadas:');
  console.log('   ' + ['kb_general', ...folders.map(f => `kb_${f.replace(/-/g, '_')}`)].join(', '));
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
