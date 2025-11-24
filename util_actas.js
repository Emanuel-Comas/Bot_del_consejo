const fs = require('fs');
const path = require('path');

const archivoActas = path.join(__dirname, 'actas.json'); // archivo donde guardas las actas

function cargarActas() {
  if (!fs.existsSync(archivoActas)) return [];
  const datos = fs.readFileSync(archivoActas, 'utf-8');
  return JSON.parse(datos);
}

function guardarActas(actas) {
  fs.writeFileSync(archivoActas, JSON.stringify(actas, null, 2), 'utf-8');
}

module.exports = { cargarActas, guardarActas };
