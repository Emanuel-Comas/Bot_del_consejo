const { EmbedBuilder } = require("discord.js");
const { cargarHistorial } = require("./historial");
const { historialIntegro, guardarHash, generarHashHistorial } = require("./antimanipulacion");

module.exports = function (client, puedeUsarComando) {

  // Ver historial
  client.on("messageCreate", async msg => {
    if (!msg.content.startsWith("!historial")) return;

    if (!puedeUsarComando(msg.author.id, "verActas"))
      return msg.reply("⚠️ No tienes permiso para ver el historial.");

    const historial = cargarHistorial();

    if (historial.length === 0)
      return msg.reply("📜 El historial está vacío.");

    const embed = new EmbedBuilder()
      .setTitle("📜 Historial del Consejo — Últimos movimientos")
      .setColor("#0A1A2F");

    historial.slice(-25).forEach(h => {
      embed.addFields({
        name: `📌 ${h.tipo.toUpperCase()} — ${new Date(h.fecha).toLocaleString("es-ES")}`,
        value:
          `**Descripción:** ${h.descripcion}\n` +
          `**Autor:** <@${h.autor}>\n` +
          `${h.afectado ? `**Afectado:** <@${h.afectado}>\n` : ""}` +
          `${h.acta ? `**Acta:** \`${h.acta}\`\n` : ""}`
      });
    });

    msg.reply({ embeds: [embed] });
  });

  // Firmar historial (solo Gran Canciller)
  client.on("messageCreate", async msg => {
    if (!msg.content.startsWith("!firmarHistorial")) return;
    if (!puedeUsarComando(msg.author.id, "ascenso"))
      return msg.reply("⚠️ Solo el Gran Canciller puede firmar el historial.");

    const nuevoHash = generarHashHistorial();
    guardarHash(nuevoHash);

    msg.reply("🔏 El historial ha sido firmado digitalmente.");
  });

  // Verificar integridad
  client.on("messageCreate", async msg => {
    if (!msg.content.startsWith("!verFirmas")) return;

    if (!puedeUsarComando(msg.author.id, "verActas"))
      return msg.reply("No puedes ver esta información.");

    const integro = historialIntegro();

    msg.reply(
      integro
        ? "🟢 El historial NO ha sido manipulado."
        : "🔴 ALERTA: El historial fue modificado sin autorización."
    );
  });

};
