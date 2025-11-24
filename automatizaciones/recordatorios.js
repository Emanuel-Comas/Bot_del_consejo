const path = require('path');
const { cargarActas, guardarActas } = require('../util_actas'); 


module.exports = function (client, canalId) {

  setInterval(async () => {
    const actas = cargarActas();
    const pendientes = actas.filter(a => a.estado === "Pendiente");

    if (pendientes.length === 0) return;

    const canal = await client.channels.fetch(canalId);
    canal.send(`🔔 Consejo: hay **${pendientes.length} actas pendientes** de resolución.`);
  }, 12 * 60 * 60 * 1000); // Cada 12h
};
