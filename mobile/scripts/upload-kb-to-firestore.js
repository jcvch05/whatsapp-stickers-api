/**
 * Sube la KB local (archivos .md y .json) a Firestore.
 * Uso: node scripts/upload-kb-to-firestore.js <ruta-a-kb>
 * Ejemplo: node scripts/upload-kb-to-firestore.js ~/Documents/Personal/proyectos/consultora-aduanera/knowledge-base
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../serviceAccountKey.json');
const KB_PATH = process.argv[2] || path.resolve(__dirname, '../../consultora-aduanera/knowledge-base');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('❌ Falta serviceAccountKey.json en mobile/');
  console.error('   Cópialo desde consultora-aduanera/serviceAccountKey.json');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)),
});
const db = admin.firestore();

function readMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') || f.endsWith('.json'))
    .map(f => ({ file: f, content: fs.readFileSync(path.join(dir, f), 'utf8') }));
}

function parseDecretoMd(filename, content) {
  const numero = filename.replace('.md', '').replace('ds-', 'DS ').toUpperCase();
  const lines = content.split('\n');
  const titulo = lines.find(l => l.startsWith('#'))?.replace(/^#+\s*/, '') || numero;

  // Detecta partidas arancelarias (formato XXXX.XX.XX)
  const partidas = [...new Set((content.match(/\d{4}\.\d{2}\.\d{2}/g) || []))];

  // Detecta porcentajes de GA
  const gaMatches = content.match(/GA[:\s]+(\d+)%/gi) || [];
  const gaRates = {};
  partidas.forEach(p => {
    const match = content.match(new RegExp(`${p}[^\\n]*?(\\d+)%`));
    if (match) gaRates[p] = parseInt(match[1]);
  });

  return {
    numero,
    titulo,
    contenido: content,
    fecha: new Date().toISOString().split('T')[0],
    productos_afectados: [],
    partidas_afectadas: partidas,
    ga_rates: gaRates,
    vigente: true,
  };
}

async function uploadDecretos() {
  const decretosDir = path.join(KB_PATH, 'decretos');
  const files = readMarkdownFiles(decretosDir);

  if (files.length === 0) {
    console.log('⚠️  No se encontraron decretos en:', decretosDir);
    return;
  }

  console.log(`📋 Subiendo ${files.length} decretos...`);
  for (const { file, content } of files) {
    const id = file.replace('.md', '').replace('.json', '');
    const data = file.endsWith('.json') ? JSON.parse(content) : parseDecretoMd(file, content);
    await db.collection('kb_decretos').doc(id).set(data, { merge: true });
    console.log(`  ✅ ${id}`);
  }
}

async function uploadNormativa() {
  const dirs = ['normativa', 'reglamentos', 'resoluciones'];
  for (const dir of dirs) {
    const fullDir = path.join(KB_PATH, dir);
    const files = readMarkdownFiles(fullDir);
    if (files.length === 0) continue;

    console.log(`📋 Subiendo ${files.length} archivos de ${dir}...`);
    for (const { file, content } of files) {
      const id = `${dir}_${file.replace('.md', '').replace('.json', '')}`;
      await db.collection('kb_normativa').doc(id).set({
        tipo: dir.replace('s', ''),
        codigo: file.replace('.md', ''),
        titulo: content.split('\n').find(l => l.startsWith('#'))?.replace(/^#+\s*/, '') || file,
        contenido: content,
      }, { merge: true });
      console.log(`  ✅ ${id}`);
    }
  }
}

async function uploadAcuerdos() {
  const acuerdosDir = path.join(KB_PATH, 'acuerdos-comerciales');
  const files = readMarkdownFiles(acuerdosDir);
  if (files.length === 0) return;

  console.log(`📋 Subiendo ${files.length} acuerdos comerciales...`);
  for (const { file, content } of files) {
    const id = file.replace('.md', '').replace('.json', '');
    await db.collection('kb_acuerdos').doc(id).set({
      codigo: id.toUpperCase(),
      contenido: content,
      titulo: content.split('\n').find(l => l.startsWith('#'))?.replace(/^#+\s*/, '') || id,
    }, { merge: true });
    console.log(`  ✅ ${id}`);
  }
}

async function main() {
  console.log('🚀 Iniciando subida de KB a Firestore...');
  console.log('   KB path:', KB_PATH);
  await uploadDecretos();
  await uploadNormativa();
  await uploadAcuerdos();
  console.log('\n✅ KB subida exitosamente a Firestore');
  console.log('   Colecciones: kb_decretos, kb_normativa, kb_acuerdos');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
