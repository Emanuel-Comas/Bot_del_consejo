const fs = require("fs");

module.exports = function () {
  setInterval(() => {
    try {
      const contenido = fs.readFileSync("historial_consejo.json", "utf8");
      const backupName = `backup_historial_${Date.now()}.json`;
      fs.writeFileSync(`./${backupName}`, contenido, "utf8");
      console.log("Backup del historial generado:", backupName);
    } catch (e) {
      console.log("Error generando backup:", e);
    }
  }, 24 * 60 * 60 * 1000); // cada 24h
};
