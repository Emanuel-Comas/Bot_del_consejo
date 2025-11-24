const fs = require("fs");

function cargarHistorial() {
  try {
    return JSON.parse(fs.readFileSync("historial_consejo.json", "utf8"));
  } catch (e) {
    return [];
  }
}

function guardarHistorial(historial) {
  console.log("Guardando historial en:", require("path").resolve("historial_consejo.json"));

  fs.writeFileSync("historial_consejo.json", JSON.stringify(historial, null, 2), "utf8");
}

function registrarHistorial({ tipo, descripcion, autor, afectado = null, acta = null }) {
  const historial = cargarHistorial();

  historial.push({
    id: Date.now().toString(),
    tipo,
    descripcion,
    autor,
    afectado,
    acta,
    fecha: new Date().toISOString(),
    firmas: []
  });

  guardarHistorial(historial);

  // Regenerar firma digital
  const { generarHashHistorial, guardarHash } = require("./antimanipulacion");
  guardarHash(generarHashHistorial());
}

module.exports = {
  cargarHistorial,
  guardarHistorial,
  registrarHistorial
};
