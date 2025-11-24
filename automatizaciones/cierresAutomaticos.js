const { registrarHistorial } = require("../historial/historial");
const { cargarActas, guardarActas } = require('../util_actas'); 


module.exports = function (client) {

  setInterval(() => {
    let actas = cargarActas();
    const ahora = Date.now();

    actas.forEach(a => {
      if (a.estado === "Pendiente") {
        const fecha = new Date(a.fecha).getTime();
        const diferencia = ahora - fecha;

        if (diferencia > 48 * 60 * 60 * 1000) {  // 48h
          a.estado = "Rechazado automático";
          a.fechaResolucion = new Date().toISOString();

          registrarHistorial({
            tipo: "rechazo automático",
            descripcion: `Acta ${a.acta} fue cerrada automáticamente por inactividad.`,
            autor: "Sistema",
            afectado: a.solicitante,
            acta: a.acta
          });
        }
      }
    });

    guardarActas(actas);

  }, 60 * 60 * 1000); // Ejecuta cada 1h
};
