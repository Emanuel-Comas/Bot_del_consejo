const fs = require("fs");
const crypto = require("crypto");

function generarHashHistorial() {
  const contenido = fs.readFileSync("historial_consejo.json", "utf8");
  return crypto.createHash("sha256").update(contenido).digest("hex");
}

function guardarHash(hash) {
  fs.writeFileSync("historial_hash.txt", hash, "utf8");
}

function cargarHashGuardado() {
  try {
    return fs.readFileSync("historial_hash.txt", "utf8");
  } catch {
    return null;
  }
}

function historialIntegro() {
  const actual = generarHashHistorial();
  const guardado = cargarHashGuardado();
  return actual === guardado;
}

module.exports = {
  generarHashHistorial,
  guardarHash,
  cargarHashGuardado,
  historialIntegro
};
