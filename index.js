// Módulos externos
const { registrarHistorial } = require("./historial/historial");
const historialComandos = require("./historial/comandosHistorial");
const { obtenerIcono, iconosJerarquia } = require("./roles/iconos_roles.js");
const comandos = require("./config/comandos.json");

// Automatizaciones
const cierresAutomaticos = require("./automatizaciones/cierresAutomaticos");
const recordatorios = require("./automatizaciones/recordatorios");
const backupHistorial = require("./automatizaciones/backupHistorial");


// =============================
// Consejo de Hombres — Bot Oficial
// =============================

require("dotenv").config();

const fs = require("fs");
const canalAutorizado = process.env.CANAL_CONSEJO;


// Funciones para gregar miembros.
function cargarMiembros() {
  try {
    const data = fs.readFileSync("miembros_consejo.json", "utf8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function guardarMiembros(miembros) {
  fs.writeFileSync("miembros_consejo.json", JSON.stringify(miembros, null, 2), "utf8");
}

// Funcion chequear permisos.
function puedeUsarComando(userId, comando) {
  const miembros = cargarMiembros();
  const miembro = miembros.find(m => m.id === userId);
  if (!miembro) return false;

  switch (comando) {
    case "ascenso":
      return miembro.jerarquia === 1; // solo Gran Canciller
    case "votar":
      return miembro.jerarquia >= 1 && miembro.jerarquia <= 4; // jerarquías 1 a 4
    case "verActas":
      return miembro.jerarquia <= 2; // solo jerarquía 1 y 2
    default:
      return false;
  }
}


// Cargar actas desde archivo
function cargarActas() {
  try {
    const data = fs.readFileSync("actas.json", "utf8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

async function iniciarVotacion(msg, acta, peticion, canal) {
  const miembros = cargarMiembros().map(m => m.id);

  const embedVotacion = new EmbedBuilder()
    .setTitle("📘 Consejo de Hombres — Votación del Consejo")
    .setDescription(
      `**Acta Nº:** \`${acta}\`\n` +
      `📄 Petición: ${peticion}\n\n` +
      `⌛ Votación abierta: pulsa ✅ para aprobar, ❌ para rechazar.\n` +
      `⏳ Tienes **30 segundos** para votar.`
    )
    .setColor("#0A1A2F");

  const mensajeVotacion = await canal.send({ embeds: [embedVotacion] });

  await mensajeVotacion.react("✅");
  await mensajeVotacion.react("❌");


  // Al iniciar la votación, guardá quién la disparó
  // Aqui esta la logica de la votación.
  const autorCierre = msg.author.id;   // guarda el ID del autor
  // En caso de necesitar el canal.
  const canalCierre = msg.channel.id;  
  setTimeout(async () => {
    let mensajeActualizado;

    try {
      mensajeActualizado = await mensajeVotacion.fetch();
    } catch (err) {
      // Si el mensaje fue eliminado → mensajeActualizado no existe
      try {
        await canal.send(`⚠️ La votación de la acta **${acta}** fue cancelada porque el mensaje original fue eliminado.`);
      } catch { }

      registrarHistorial({
        tipo: "interrupción",
        descripcion: `La votación del acta ${acta} se canceló porque el mensaje fue borrado.`,
        autor: "Sistema",
        acta
      });

      return; // cortar proceso
    }

    // === si el mensaje existe sigue normalmente ===

    const reaccionAprobar = mensajeActualizado.reactions.cache.get("✅");
    const reaccionRechazar = mensajeActualizado.reactions.cache.get("❌");

    await reaccionAprobar?.users.fetch().catch(() => { });
    await reaccionRechazar?.users.fetch().catch(() => { });

    const votosAprobar = reaccionAprobar.users.cache
      .filter(u => !u.bot && miembros.includes(u.id) && puedeUsarComando(u.id, "votar"))
      .size;

    const votosRechazar = reaccionRechazar.users.cache
      .filter(u => !u.bot && miembros.includes(u.id) && puedeUsarComando(u.id, "votar"))
      .size;

    // Determinar resultado de la votación
    let resultado;
    if (votosAprobar > votosRechazar) resultado = "Aprobado";
    else if (votosRechazar > votosAprobar) resultado = "Rechazado";
    else resultado = "Pendiente";

    // Cargar actas y buscar registro
    let actas = cargarActas();
    const registro = actas.find(a => a.acta === acta);
    if (!registro) {
      try {
        await canal.send(`⚠️ La votación del acta **${acta}** fue **interrumpida**, ya que el expediente fue eliminado durante el proceso.`);
      } catch (e) {
        console.error("No se pudo enviar aviso de votación interrumpida.");
      }

      // Registrar en historial
      registrarHistorial({
        tipo: "interrupción",
        descripcion: `La votación del acta ${acta} fue interrumpida porque se eliminó el expediente antes de finalizar.`,
        autor: "Sistema",
        acta
      });

      return; // Cancelar sin romper nada
    }


    // Guardar estado y fecha de resolución
    registro.estado = resultado;
    registro.fechaResolucion = new Date().toISOString();
    guardarActas(actas);

    // Registrar en historial de auditoría usando la variable guardada
    registrarHistorial({
      tipo: resultado.toLowerCase(),
      descripcion: `Acta ${acta} ${resultado.toLowerCase()} por votación.`,
      autor: autorCierre,              // usa la variable guardada
      afectado: registro.solicitante,
      acta
    });

    // === AGREGAR FECHA DE RESOLUCIÓN ===
    const fechaResolucion = new Date(registro.fechaResolucion).toLocaleString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    // Embed final
    const resultadoEmbed = new EmbedBuilder()
      .setTitle("📘 Consejo de Hombres — Resolución Final")
      .setColor(resultado === "Aprobado" ? "Green" : resultado === "Rechazado" ? "Red" : "Grey")
      .setDescription(
        `**Acta:** \`${acta}\`\n\n` +
        `📊 Resultado de la votación:\n` +
        `✅ A favor: **${votosAprobar}**\n` +
        `❌ En contra: **${votosRechazar}**\n\n` +
        `📌 Decisión final: ${resultado}\n` +
        `🗓 Fecha de resolución: ${fechaResolucion}\n\n` +
        `— Decisión respaldada por la Secretaría General del Consejo —`
      )
      .setFooter({ text: "Consejo de Hombres — Archivo de Resoluciones" })
      .setThumbnail("attachment://sello_Patricio.jpg"); // 📌 imagen pequeña tipo sello

    await canal.send({
      embeds: [resultadoEmbed],
      files: [{ attachment: "./imagenes/sello_Patricio.jpg", name: "sello_Patricio.jpg" }]
    });

    // Notificar al solicitante
    try {
      const usuario = await client.users.fetch(registro.solicitante);
      await usuario.send(`📘 La resolución de tu acta **${acta}** es **${resultado.toLowerCase()}** — Resolución oficial del Consejo de Hombres.`);
    } catch {
      await canal.send(`<@${registro.solicitante}>, tu acta **${acta}** ha sido **${resultado.toLowerCase()}**`);
    }
  }, 30000);
}


// Guardar actas en archivo
function guardarActas(actas) {
  fs.writeFileSync("actas.json", JSON.stringify(actas, null, 2), "utf8");
}
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// Utilidad: generar número de acta
function generarActa() {
  const n = Math.floor(Math.random() * 9000) + 1000;
  const letra = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `ACT-${n}-${letra}`;
}

// Mensajes institucionales que dice el Consejo durante la evaluación
const mensajesIntermedios = [
  "Analizando antecedentes…",
  "Consultando archivos centrales…",
  "Verificando conformidad con el Código de Conducta Masculina…",
  "Obteniendo aprobación preliminar del Comité Ético Masculino…",
  "Evaluando riesgos de hombría insuficiente…",
  "Contrastando evidencias aportadas…",
];

client.on("messageCreate", async (msg) => {
  // Si el mensaje no viene del canal autorizado, ignóralo y no hagas nada.
  if (msg.channel.id !== canalAutorizado) return; // <-- Filtro de canal
  if (!msg.content.startsWith("!consejo")) return;
  // Si el autor del mensaje es un bot, ignoralo.
  if (msg.author.bot) return;

  const peticion = msg.content.slice(8).trim();
  const acta = generarActa();

  const embed = new EmbedBuilder()
    .setTitle("📘 Consejo de Hombres — Notificación Oficial")
    .setDescription(
      `**Solicitud recibida.**\n\n` +
      `**Acta Nº:** \`${acta}\`\n` +
      `**Solicitante:** <@${msg.author.id}>\n` +
      `**Petición:** ${peticion || "*No detallada*"}\n\n` +
      `El Consejo ha iniciado su revisión preliminar.`
    )
    .setColor("#0A1A2F")
    .setFooter({ text: "Consejo de Hombres — Secretaría General" });

  const aviso = await msg.reply({ embeds: [embed] });
  await aviso.react("⚖️");

  // Mensaje intermedio aleatorio
  const fase = mensajesIntermedios[Math.floor(Math.random() * mensajesIntermedios.length)];
  const intermedio = await msg.channel.send(`📄 **${fase}**`);

  await new Promise((r) => setTimeout(r, 3000));

  // Guardar acta como pendiente
  let actas = cargarActas();
  actas.push({
    acta: acta,
    solicitante: msg.author.id,
    peticion: peticion || "No detallada",
    estado: "Pendiente",
    fecha: new Date().toISOString()
  });
  guardarActas(actas);

  iniciarVotacion(msg, acta, peticion || "No detallada", msg.channel);
});


// Comando para mostrar actas (solo admin)
client.on("messageCreate", async (msg) => {
  if (msg.channel.id !== canalAutorizado) return;
  if (!msg.content.startsWith("!actas")) return;
  if (!puedeUsarComando(msg.author.id, "verActas"))
    return msg.reply("⚠️ No tienes permiso para ver las actas.");

  const actas = cargarActas();

  if (actas.length === 0)
    return msg.reply("No hay actas registradas aún.");

  // CONFIGURACIÓN
  const pageSize = 3;
  const totalPages = Math.ceil(actas.length / pageSize);

  let currentPage = 1;

  // Función para generar el embed según página
  const generarEmbed = (pagina) => {
    const inicio = (pagina - 1) * pageSize;
    const fin = inicio + pageSize;
    const actasPagina = actas.slice(inicio, fin);

    const embed = new EmbedBuilder()
      .setTitle(`📚 Registro de Actas — Página ${pagina}/${totalPages}`)
      .setColor("#0A1A2F")
      .setFooter({ text: "Consejo de Hombres — Archivos Centrales" });

    actasPagina.forEach(a => {
      embed.addFields({
        name: `📘 ${a.acta} — ${a.estado}`,
        value:
          `📄 Petición: ${a.peticion}\n` +
          `🙍 Solicitante: <@${a.solicitante}>\n` +
          `🕒 Fecha: ${new Date(a.fecha).toLocaleString("es-ES", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}\n` +
          `🗓 Resolución: ${a.fechaResolucion
            ? new Date(a.fechaResolucion).toLocaleString("es-ES", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
            : "Pendiente"
          }\n` +
          `✍️ Firmas: ${a.firmas && a.firmas.length > 0
            ? a.firmas.map(id => `<@${id}>`).join(", ")
            : "Ninguna"
          }\n` +
          `— Decisión respaldada por la Secretaría General —`
      });
    });

    return embed;
  };

  // Botones de navegación
  const botones = (pagina) =>
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prevPage")
        .setLabel("◀️ Anterior")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina === 1),

      new ButtonBuilder()
        .setCustomId("nextPage")
        .setLabel("Siguiente ▶️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina === totalPages)
    );

  // Enviar primera página
  const mensaje = await msg.reply({
    embeds: [generarEmbed(currentPage)],
    components: [botones(currentPage)]
  });

  // Crear colector de botones
  const collector = mensaje.createMessageComponentCollector({
    time: 120000 // 2 minutos
  });

  collector.on("collect", async (i) => {
    try {

      // Solo el que ejecutó el comando puede pasar página
      if (i.user.id !== msg.author.id) {
        return i.reply({
          content: "⛔ Solo el solicitante puede cambiar de página.",
          ephemeral: true
        });
      }

      // ⛔ Comprobamos si el mensaje aún existe
      let existe = true;
      try {
        await msg.channel.messages.fetch(mensaje.id);
      } catch {
        existe = false;
      }

      if (!existe) {
        return i.reply({
          content:
            "⚠️ La paginación ya no está disponible.\nUsa **!actas** nuevamente para actualizar la lista.",
          ephemeral: true
        });
      }

      // Cambiar página
      if (i.customId === "prevPage" && currentPage > 1) currentPage--;
      if (i.customId === "nextPage" && currentPage < totalPages) currentPage++;

      // Actualizar embed
      await i.update({
        embeds: [generarEmbed(currentPage)],
        components: [botones(currentPage)]
      });

    } catch (e) {
      console.log("⚠️ No se pudo actualizar la página (el mensaje fue borrado).");
    }
  });


  collector.on("end", async () => {
    try {
      await mensaje.edit({
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("prevPage")
              .setLabel("◀️ Anterior")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("nextPage")
              .setLabel("Siguiente ▶️")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true)
          )
        ]
      });
    } catch (e) {
      // Advertencia que se puede ignorar, es solo para verificar que cuando se borra algo en !actas, 
      // Se pueda seguir viendo sin crashearse
      console.log("⚠️ El mensaje ya no existe al intentar desactivar botones.");
    }
  });

});


// Buscar actas especificas.
client.on("messageCreate", async (msg) => {
  if (msg.channel.id !== canalAutorizado) return;
  if (!msg.content.startsWith("!acta ")) return;
  if (!puedeUsarComando(msg.author.id, "verActas"))
    return msg.reply("⚠️ No tienes permiso para ver esta acta.");

  const actaBuscada = msg.content.split(" ")[1];
  let actas = cargarActas();
  const registro = actas.find(a => a.acta === actaBuscada);

  if (!registro) return msg.reply(`No existe la acta \`${actaBuscada}\`.`);

  const embed = new EmbedBuilder()
    .setTitle(`📘 Acta ${registro.acta}`)
    .setDescription(
      `📄 Petición: ${registro.peticion}\n` +
      `🙍 Solicitante: <@${registro.solicitante}>\n` +
      `🕒 Fecha: ${new Date(registro.fecha).toLocaleString("es-ES", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })}\n` +
      `📌 Estado: ${registro.estado}\n` +
      `✍️ Firmas: ${registro.firmas && registro.firmas.length > 0 ? registro.firmas.map(id => `<@${id}>`).join(", ") : "Ninguna"}\n` +
      `— Decisión respaldada por la Secretaría General —`
    )
    .setColor("#0A1A2F");

  msg.reply({ embeds: [embed] });
});

// Filtrar actas por estado.
client.on("messageCreate", async (msg) => {
  if (msg.channel.id !== canalAutorizado) return;
  if (!msg.content.startsWith("!actas ")) return;
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const filtro = msg.content.split(" ")[1].toLowerCase();
  let actas = cargarActas();
  if (filtro !== "pendientes" && filtro !== "aprobadas" && filtro !== "rechazadas") {
    return msg.reply("Filtra usando: `pendientes`, `aprobadas` o `rechazadas`.");
  }

  const filtradas = actas.filter(a => a.estado.toLowerCase() === filtro);
  if (filtradas.length === 0) return msg.reply(`No hay actas ${filtro}.`);

  const embed = new EmbedBuilder()
    .setTitle(`📚 Actas ${filtro.charAt(0).toUpperCase() + filtro.slice(1)}`)
    .setColor("#0A1A2F");

  filtradas.forEach(a => {
    embed.addFields({
      name: `${a.acta} — ${a.estado}`,
      value: `📄 Petición: ${a.peticion}\n🙍 Solicitante: <@${a.solicitante}>\n🕒 Fecha: ${a.fecha}`
    });
  });

  msg.reply({ embeds: [embed] });
});

// Exportar actas a CSV.
client.on("messageCreate", async (msg) => {
  if (msg.channel.id !== canalAutorizado) return;
  if (msg.content !== "!exportar") return;
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const actas = cargarActas();
  if (actas.length === 0) return msg.reply("No hay actas para exportar.");

  const csv = ["Acta,Petición,Solicitante,Estado,Fecha"];
  actas.forEach(a => {
    csv.push(`"${a.acta}","${a.peticion}","${a.solicitante}","${a.estado}","${a.fecha}"`);
  });

  const fileName = `actas_${Date.now()}.csv`;
  fs.writeFileSync(fileName, csv.join("\n"), "utf8");
  msg.reply({ content: "Exportación completa.", files: [fileName] });
});

// Resumen semanal.
client.on("messageCreate", async (msg) => {
  if (msg.channel.id !== canalAutorizado) return;
  if (msg.content !== "!resumen") return;
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const actas = cargarActas();
  const ahora = new Date();
  const hace7dias = new Date();
  hace7dias.setDate(ahora.getDate() - 7);

  const recientes = actas.filter(a => new Date(a.fecha) >= hace7dias);

  const embed = new EmbedBuilder()
    .setTitle("📊 Resumen Semanal del Consejo")
    .setColor("#0A1A2F");

  if (recientes.length === 0) {
    embed.setDescription("No ha habido casos en la semana.");
  } else {
    recientes.forEach(a => {
      embed.addFields({
        name: `${a.acta} — ${a.estado}`,
        value: `📄 Petición: ${a.peticion}\n🙍 Solicitante: <@${a.solicitante}>\n🕒 Fecha: ${new Date(a.fecha).toLocaleString("es-ES", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })}`
      });
    });
  }

  msg.reply({ embeds: [embed] });
});

// Reabrir acta pendiente.
client.on("messageCreate", async (msg) => {
  if (msg.channel.id !== canalAutorizado) return;
  if (!msg.content.startsWith("!reabrir ")) return;
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const actaId = msg.content.split(" ")[1];
  let actas = cargarActas();
  const registro = actas.find(a => a.acta === actaId);

  if (!registro) return msg.reply("No existe ese número de acta.");
  registro.estado = "Pendiente";
  guardarActas(actas);

  registrarHistorial({
    tipo: "edición",
    descripcion: `Acta ${actaId} editada y reiniciada para nueva votación.`,
    autor: msg.author.id,
    afectado: registro.solicitante,
    acta: actaId
  });


  msg.reply(`✅ Acta ${actaId} reabierta y ahora está pendiente.`);
});

// Editar peticiónes.
client.on("messageCreate", async (msg) => {
  if (msg.channel.id !== canalAutorizado) return;
  if (!msg.content.startsWith("!editar ")) return;
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const [_, actaId, ...nuevoTexto] = msg.content.split(" ");
  let nuevaPeticion = nuevoTexto.join(" ");
  let actas = cargarActas();
  const registro = actas.find(a => a.acta === actaId);

  if (!registro) return msg.reply("No existe ese número de acta.");

  // Solo actualizar la petición si hay texto nuevo
  if (nuevaPeticion.length > 0) {
    registro.peticion = nuevaPeticion;
  } else {
    // Mantener la petición original
    nuevaPeticion = registro.peticion;
  }

  // Reiniciar a Pendiente para nueva votación
  registro.peticion = nuevaPeticion;
  registro.estado = "Pendiente";
  guardarActas(actas);

  msg.reply(`✏️ Acta ${actaId} actualizada y lista para nueva votación.`);

  // Reiniciar votación usando la función central
  iniciarVotacion(msg, actaId, nuevaPeticion, msg.channel);
});

// Comando para borrar un acta
client.on("messageCreate", async (msg) => {
  if (msg.channel.id !== canalAutorizado) return;
  if (!msg.content.startsWith("!borrar ")) return;

  // Solo admins
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply("⚠️ Solo un **Administrador del Consejo** puede borrar actas.");
  }

  const actaId = msg.content.split(" ")[1];
  if (!actaId) return msg.reply("Debes especificar el número de acta a borrar.");

  let actas = cargarActas();
  const indice = actas.findIndex(a => a.acta === actaId);

  if (indice === -1) return msg.reply(`No existe la acta \`${actaId}\`.`);

  // Borrar la acta
  actas.splice(indice, 1);
  guardarActas(actas);


  registrarHistorial({
    tipo: "borrado",
    descripcion: `Acta ${actaId} eliminada del registro.`,
    autor: msg.author.id,
    acta: actaId
  });

  msg.reply(`✅ Acta \`${actaId}\` ha sido eliminada correctamente.`);
});



// Comando para invitar a un usuario al Consejo
client.on("messageCreate", async (msg) => {
  if (msg.channel.id !== canalAutorizado) return;
  if (!msg.content.startsWith("!solicitarPresencia")) return;
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const args = msg.content.split(" ").slice(1);
  if (!args[0]) return msg.reply("Debes mencionar o poner el ID del usuario a invitar.");

  const usuarioId = args[0].replace(/[<@!>]/g, "");
  try {
    const usuario = await client.users.fetch(usuarioId);

    const fila = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("aceptar_invitacion")
        .setLabel("✅ Aceptar invitación")
        .setStyle(ButtonStyle.Success)
    );

    await usuario.send({
      content: `📜 **Edicto del Consejo de Hombres**\n\n` +
        `Saludos, noble <@${usuario.id}>,\n\n` +
        `Por la presente se te convoca a formar parte del **Consejo de Hombres**, ` +
        `cuyo deber es velar por la sabiduría, la justicia y la integridad de nuestra Orden.\n\n` +
        `Si aceptas este honor, pulsa el botón a continuación para unir tu valor al nuestro y ` +
        `participar en las deliberaciones del Consejo.\n\n` +
        `— Que la virtud guíe tu camino, Secretaría General del Consejo`,
      components: [fila]
    });

    msg.reply(`✅ Invitación enviada a <@${usuario.id}>.`);
  } catch (error) {
    console.error(error);
    msg.reply("⚠️ No se pudo enviar el mensaje. ¿El usuario tiene los DMs desactivados o el ID es incorrecto?");
  }
});

// Manejo del boton.
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "aceptar_invitacion") return;

  const miembros = cargarMiembros();

  // Verifica correctamente si ya existe
  const yaEsMiembro = miembros.some(m => m.id === interaction.user.id);
  if (yaEsMiembro) {
    await interaction.reply({ content: "Ya formas parte del Consejo.", ephemeral: true });
    return;
  }

  // Agregar al JSON con rol más bajo
  miembros.push({
    id: interaction.user.id,
    username: interaction.user.username,
    rol: "Espectador",       // rol más bajo
    jerarquia: 4,            // jerarquía más baja
    accesos: ["ver"],        // solo puede ver
    fechaIngreso: new Date().toISOString(),
    icono: obtenerIcono(5) // Se le asigna su icono
  });
  guardarMiembros(miembros);

  // Mensaje privado de confirmación
  await interaction.reply({ content: "¡Bienvenido al Consejo de Hombres! 🙌", ephemeral: true });

  // Aviso al canal autorizado
  const canal = await client.channels.fetch(process.env.CANAL_CONSEJO);
  canal.send(`📣 <@${interaction.user.id}> ahora forma parte del Consejo de Hombres. ¡Salud por su sabiduría y valor!`);

  // Dar acceso al canal del Consejo
  try {
    const guild = interaction.guild;
    const canalConsejo = await client.channels.fetch(process.env.CANAL_CONSEJO);

    await canalConsejo.permissionOverwrites.edit(interaction.user.id, {
      ViewChannel: true,
      SendMessages: false,
      ReadMessageHistory: true
    });

    canalConsejo.send(`🔐 <@${interaction.user.id}> ha recibido acceso al canal del Consejo.`);
  } catch (error) {
    console.error("Error dando acceso al canal:", error);
  }


});

// Comando para listar miembros del Consejo
client.on("messageCreate", async (msg) => {
  if (msg.channel.id !== canalAutorizado) return;
  if (!msg.content.startsWith("!miembros")) return;
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  const miembros = cargarMiembros();
  if (miembros.length === 0) return msg.reply("No hay miembros registrados en el Consejo aún.");

  const embed = new EmbedBuilder()
    .setTitle("📜 Miembros del Consejo de Hombres")
    .setColor("#0A1A2F");

  miembros.forEach(m => {

    const icono = obtenerIcono(m.jerarquia);

    embed.addFields({
      name: `${icono} ${m.username || "Desconocido"}`,
      value:
        `🆔 **ID:** ${m.id || "Desconocido"}\n` +
        `🎭 **Rol:** ${m.rol || "Sin rol"}\n` +
        `🏛️ **Jerarquía:** ${m.jerarquia || "N/A"}\n` +
        `🔐 **Accesos:** ${m.accesos ? m.accesos.join(", ") : "Ninguno"}\n` +
        `📅 **Ingreso:** ${m.fechaIngreso
          ? new Date(m.fechaIngreso).toLocaleString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
          : "Fecha desconocida"
        }\n\n`,   // 👈 AQUI SE AGREGA LA SEPARACIÓN
      inline: false
    });
  });

  msg.reply({ embeds: [embed] });
});


// ======================================================
// SISTEMA DE JERARQUÍAS DEL CONSEJO
// Roles disponibles según jerarquía:
//
// 1 → Gran Canciller
//      - Puede ascender/descender miembros
//      - Puede ver historial
//      - Puede firmar eventos
//      - Puede ver firmas
//
// 2 → Maestro Votante
//      - Puede ver historial
//      - Puede firmar eventos
//      - Puede ver firmas
//
// 3 → Votante Novato
//      - Solo puede votar
//
// 4 → Aprendiz Observador
//      - Solo puede votar
//
// 5 → Espectador
//      - Solo puede ver, sin permisos especiales
// ======================================================

//  Comando ascenso/descenso
// Jerarquias
client.on("messageCreate", async (msg) => {
  if (msg.channel.id !== canalAutorizado) return;

  const miembros = cargarMiembros();
  const granCanciller = miembros.find(m => m.id === msg.author.id);

  const args = msg.content.split(" ");
  const comando = args[0].toLowerCase();

  // Comandos de ascenso/descenso requieren Gran Canciller
  if (!granCanciller || granCanciller.jerarquia !== 1) return;

  if (comando === "!ascenso" || comando === "!descenso") {
    if (!args[1]) return msg.reply("⚠️ Debes indicar el ID o la mención del miembro.");

    // Limpiar formato de mención
    const idMiembro = args[1].replace(/[<@!>]/g, "");
    const miembro = miembros.find(m => m.id === String(idMiembro));
    if (!miembro) return msg.reply("No se encontró ese miembro.");

    const actualizarRolYAccesos = (m) => {
      switch (m.jerarquia) {
        case 1:
          m.rol = "Gran Canciller";
          m.accesos = ["votar", "ver", "ascenso"];
          break;
        case 2:
          m.rol = "Maestro Votante";
          m.accesos = ["votar", "ver"];
          break;
        case 3:
          m.rol = "Votante Novato";
          m.accesos = ["votar"];
          break;
        case 4:
          m.rol = "Aprendiz Observador";
          m.accesos = ["votar"];
          break;
        case 5:
          m.rol = "Espectador";
          m.accesos = ["ver"];
          break;
      }
    };

    const actualizarPermisosCanal = async (usuario, accesos) => {
      try {
        const canalConsejo = await client.channels.fetch(canalAutorizado);
        const permisos = {
          ViewChannel: accesos.includes("ver") || accesos.includes("votar"),
          SendMessages: accesos.includes("votar"),
          ReadMessageHistory: accesos.includes("ver") || accesos.includes("votar")
        };
        const guildMember = await canalConsejo.guild.members.fetch(usuario.id).catch(() => null);
        if (!guildMember) return console.log(`Usuario ${usuario.id} no encontrado en la guild`);
        await canalConsejo.permissionOverwrites.edit(usuario.id, permisos);
      } catch (error) {
        console.error("Error actualizando permisos del canal:", error);
      }
    };

    const aplicarCambio = async (tipo) => {
      if (tipo === "ascenso" && miembro.jerarquia > 2) {
        miembro.jerarquia -= 1;
      } else if (tipo === "descenso" && miembro.jerarquia < 5) {
        miembro.jerarquia += 1;
      } else {
        return msg.reply(`⚠️ No se puede realizar ${tipo} a este miembro.`);
      }

      actualizarRolYAccesos(miembro);
      guardarMiembros(miembros);
      await actualizarPermisosCanal(miembro, miembro.accesos);


      registrarHistorial({
        tipo: comando === "!ascenso" ? "ascenso" : "descenso",
        descripcion: `${miembro.username} ahora es jerarquía ${miembro.jerarquia}.`,
        autor: msg.author.id,
        afectado: miembro.id
      });



      msg.reply(`✅ ${miembro.username} ha sido ${tipo === "ascenso" ? "ascendido" : "descendido"} a jerarquía ${miembro.jerarquia}.`);
      const canal = await client.channels.fetch(canalAutorizado);
      canal.send(`📈 <@${miembro.id}> ha sido **${tipo === "ascenso" ? "ascendido" : "descendido"}** por el Gran Canciller.`);
    };

    // Ejecutar ascenso o descenso
    if (comando === "!ascenso") await aplicarCambio("ascenso");
    if (comando === "!descenso") await aplicarCambio("descenso");
  }
});


// ===================================================================
// COMANDOS DE HISTORIAL — SOLO JERARQUÍAS 1 (Gran Canciller) Y 2
// ===================================================================

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.channel.id !== canalAutorizado) return;
  if (!msg.content.startsWith("!")) return;

  const miembros = cargarMiembros();
  const miembro = miembros.find(m => m.id === msg.author.id);

  // SOLO pueden usar historial/firmas los rangos 1 y 2
  if (!miembro || (miembro.jerarquia !== 1 && miembro.jerarquia !== 2)) return;

  const args = msg.content.split(" ");
  const comando = args[0].toLowerCase();

  // -------------------------
  // !historial
  // -------------------------
  if (comando === "!historial") {
    let historial = [];

    try {
      historial = JSON.parse(fs.readFileSync("historial_consejo.json", "utf8"));
      if (!Array.isArray(historial)) historial = [historial];

      // Inicializamos firmas si falta
      historial = historial.map(h => ({
        ...h,
        firmas: Array.isArray(h.firmas) ? h.firmas : []
      }));

    } catch {
      historial = [];
    }

    const ultimos10 = historial.slice(0, 10);

    if (ultimos10.length === 0)
      return msg.reply("El historial está vacío.");

    const embed = new EmbedBuilder()
      .setTitle("📜 Historial — Últimos 10 eventos")
      .setColor("#0A1A2F");

    ultimos10.forEach(h => {
      const fecha = new Date(h.fecha).toLocaleString("es-ES", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      embed.addFields({
        name: `ID: ${h.id || "N/A"} — Acta: ${h.acta || "N/A"}`,
        value:
          `📌 Tipo: ${h.tipo}\n` +
          `🕒 Fecha: ${fecha}\n` +
          `👤 Autor: <@${h.autor}>\n` +
          (h.afectado ? `🎯 Afectado: <@${h.afectado}>\n` : "") +
          `✒️ Firmas: ${h.firmas.length > 0 ? h.firmas.map(id => `<@${id}>`).join(", ") : "Sin firmar"}`
      });
    });

    return msg.reply({ embeds: [embed] });
  }

  // -------------------------
  // !firmar ACT-XXXX-X
  // -------------------------
  if (comando === "!firmar") {
    if (!args[1])
      return msg.reply("Debes indicar el código del acta. Ejemplo:\n`!firmar ACT-1234-X`");

    const codigoActa = args[1];

    // Verificar jerarquía
    const miembros = cargarMiembros();
    const miembro = miembros.find(m => m.id === msg.author.id);

    if (!miembro || (miembro.jerarquia !== 1 && miembro.jerarquia !== 2))
      return msg.reply("❌ No tienes permiso para firmar actas.");

    // Cargar actas
    let actas = [];
    try {
      actas = JSON.parse(fs.readFileSync("actas.json", "utf8"));
    } catch {
      return msg.reply("⚠️ No se pudo leer actas.json");
    }

    const acta = actas.find(a => a.acta === codigoActa);
    if (!acta)
      return msg.reply("❌ No existe ninguna acta con ese código.");

    // Inicializar firmas si falta
    if (!Array.isArray(acta.firmas)) acta.firmas = [];

    // Evitar firmas duplicadas
    if (acta.firmas.includes(msg.author.id))
      return msg.reply("❌ Ya has firmado esta acta.");

    // Guardar la firma en el acta
    acta.firmas.push(msg.author.id);

    fs.writeFileSync("actas.json", JSON.stringify(actas, null, 2));

    // ============================
    // GUARDAR TAMBIÉN EN firmas.json
    // ============================
    let firmas = [];
    try {
      firmas = JSON.parse(fs.readFileSync("firmas.json", "utf8"));
      if (!Array.isArray(firmas)) firmas = [];
    } catch {
      firmas = [];
    }

    firmas.push({
      usuario: msg.author.id,
      acta: codigoActa,
      fecha: new Date().toISOString()
    });

    fs.writeFileSync("firmas.json", JSON.stringify(firmas, null, 2));

    // Confirmación
    return msg.reply(`✒️ Has firmado correctamente el acta **${codigoActa}**`);
  }

  // !verfirmas
  // Muestra el contenido de firmas.json
  // Solo jerarquías 1 y 2
  // ==========================
  if (comando === "!verfirmas") {

    // Verificar jerarquía
    const miembros = cargarMiembros();
    const miembro = miembros.find(m => m.id === msg.author.id);

    if (!miembro || (miembro.jerarquia !== 1 && miembro.jerarquia !== 2))
      return msg.reply("❌ No tienes permiso para ver el registro de firmas.");

    try {
      // Leer archivo
      const data = fs.readFileSync("firmas.json", "utf8");
      const firmas = JSON.parse(data);

      if (!firmas || firmas.length === 0)
        return msg.reply("📭 El archivo `firmas.json` está vacío.");

      const embed = new EmbedBuilder()
        .setTitle("✒️ Registro de Firmas — firmas.json")
        .setColor("#0A1A2F");

      firmas.forEach((f, i) => {
        embed.addFields({
          name: `Firma #${i + 1}`,
          value:
            `🖋 Usuario: <@${f.usuario}>\n` +
            `📘 Acta: ${f.acta}\n` +
            (f.fecha ? `🕒 Fecha: ${new Date(f.fecha).toLocaleString("es-ES")}` : "")
        });
      });

      return msg.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      return msg.reply("⚠️ No se pudo leer el archivo `firmas.json`.");
    }
  }

  // ================================
  // !verfirma <ACTA>
  // Solo jerarquía 1 y 2
  // ================================
  if (comando === "!verfirma" && args[1]) {

    const codigoActa = args[1];

    // Verificar jerarquía
    const miembros = cargarMiembros();
    const miembro = miembros.find(m => m.id === msg.author.id);

    if (!miembro || (miembro.jerarquia !== 1 && miembro.jerarquia !== 2))
      return msg.reply("❌ No tienes permiso para ver las firmas de un acta.");

    // -------------------------
    // Cargar acta específica
    // -------------------------
    let actas = [];
    try {
      actas = JSON.parse(fs.readFileSync("actas.json", "utf8"));
    } catch {
      return msg.reply("⚠️ No se pudo leer actas.json");
    }

    const acta = actas.find(a => a.acta === codigoActa);
    if (!acta)
      return msg.reply(`❌ No existe la acta **${codigoActa}**.`);

    // -------------------------
    // Cargar registros globales de firmas
    // -------------------------
    let firmasGlobal = [];
    try {
      if (fs.existsSync("firmas.json")) {
        firmasGlobal = JSON.parse(fs.readFileSync("firmas.json", "utf8"));
        if (!Array.isArray(firmasGlobal)) firmasGlobal = [];
      }
    } catch {
      firmasGlobal = [];
    }

    // Filtrar solo las firmas de esa acta
    const firmasDeEstaActa = firmasGlobal.filter(f => f.acta === codigoActa);

    // -------------------------
    // Construir respuesta visual
    // -------------------------
    const embed = new EmbedBuilder()
      .setTitle(`✒️ Firmas del Acta ${codigoActa}`)
      .setColor("#0A1A2F")
      .setDescription(
        `📘 **Acta:** ${acta.acta}\n` +
        `📄 **Petición:** ${acta.peticion}\n` +
        `🙍 **Solicitante:** <@${acta.solicitante}>\n` +
        `📌 **Estado:** ${acta.estado}\n` +
        `🕒 **Fecha:** ${new Date(acta.fecha).toLocaleString("es-ES")}\n`
      );

    // Firmas internas del acta
    const firmasActaInternas = Array.isArray(acta.firmas) ? acta.firmas : [];

    embed.addFields({
      name: "✍️ Firmas dentro del acta",
      value:
        firmasActaInternas.length > 0
          ? firmasActaInternas.map(id => `• <@${id}>`).join("\n")
          : "Sin firmas internas registradas.",
      inline: false
    });

    // Firmas externas del libro global
    embed.addFields({
      name: "📜 Firmas del registro global",
      value:
        firmasDeEstaActa.length > 0
          ? firmasDeEstaActa.map(f =>
            `• <@${f.usuario}> — ${new Date(f.fecha).toLocaleString("es-ES")}`
          ).join("\n")
          : "Sin firmas en el libro global.",
      inline: false
    });

    return msg.reply({ embeds: [embed] });
  }


  // ===================================
  // !firmauser <ID>
  // Muestra todo lo que firmó un usuario
  // Solo jerarquías 1 y 2
  // ===================================
  if (comando === "!firmauser" && args[1]) {

    const usuarioId = args[1].replace(/[<@!>]/g, "");

    // Verificar jerarquía
    const miembros = cargarMiembros();
    const miembro = miembros.find(m => m.id === msg.author.id);

    if (!miembro || (miembro.jerarquia !== 1 && miembro.jerarquia !== 2))
      return msg.reply("❌ No tienes permiso para ver registros de firmas de usuarios.");

    // Cargar actas
    let actas = [];
    try {
      actas = JSON.parse(fs.readFileSync("actas.json", "utf8"));
    } catch {
      return msg.reply("⚠️ No se pudo leer actas.json");
    }

    // Cargar firmas globales
    let firmasGlobal = [];
    try {
      if (fs.existsSync("firmas.json")) {
        firmasGlobal = JSON.parse(fs.readFileSync("firmas.json", "utf8"));
        if (!Array.isArray(firmasGlobal)) firmasGlobal = [];
      }
    } catch {
      firmasGlobal = [];
    }

    // Filtrar firmas hechas por ese usuario
    const firmasUsuario = firmasGlobal.filter(f => f.usuario === usuarioId);

    if (firmasUsuario.length === 0)
      return msg.reply(`📭 El usuario <@${usuarioId}> no ha firmado ninguna acta.`);

    // Construir embed
    const embed = new EmbedBuilder()
      .setTitle(`✒️ Firmas realizadas por <@${usuarioId}>`)
      .setColor("#0A1A2F");

    // Por cada firma, buscar detalles del acta
    firmasUsuario.forEach((f, i) => {
      const acta = actas.find(a => a.acta === f.acta);

      if (acta) {
        embed.addFields({
          name: `📘 Acta ${acta.acta}`,
          value:
            `📄 Petición: ${acta.peticion}\n` +
            `🙍 Solicitante: <@${acta.solicitante}>\n` +
            `📌 Estado: ${acta.estado}\n` +
            `🕒 Fecha acta: ${new Date(acta.fecha).toLocaleString("es-ES")}\n` +
            `✍️ Fecha firma: ${new Date(f.fecha).toLocaleString("es-ES")}`,
          inline: false
        });
      } else {
        // Si el acta fue borrada pero la firma sigue en firmas.json
        embed.addFields({
          name: `📘 Acta ${f.acta} (Eliminada)`,
          value:
            `✍️ Fecha firma: ${new Date(f.fecha).toLocaleString("es-ES")}\n` +
            `⚠️ Esta acta fue borrada del sistema, pero la firma quedó registrada.`,
          inline: false
        });
      }
    });

    return msg.reply({ embeds: [embed] });
  }

});


client.once("ready", () => {

  // =============================
  // ACTIVAR AUTOMATIZACIONES
  // =============================
  cierresAutomaticos(client);
  recordatorios(client, canalAutorizado);
  backupHistorial();
  // =============================
  // ACTIVAR COMANDOS DE HISTORIAL
  // =============================
  historialComandos(client, puedeUsarComando);

  console.log("Sistema de historial y automatizaciones cargado.");
  console.log("Consejo de Hombres — Operativo.");
});


// ----------------------------------------
// Comando !help — con paginación
// ----------------------------------------
client.on("messageCreate", async (msg) => {
  if (!msg.content.startsWith("!help")) return;

  const miembros = cargarMiembros();
  const miembro = miembros.find(m => m.id === msg.author.id);

  // Si no está registrado → jerarquía 5
  const jerarquiaUser = miembro ? miembro.jerarquia : 5;

  // Filtrar comandos permitidos
  const lista = comandos.filter(c => jerarquiaUser <= c.jerarquia);

  if (lista.length === 0)
    return msg.reply("No tienes comandos disponibles según tu jerarquía.");

  // 🔢 Configuración de paginado
  const pageSize = 3;
  const totalPages = Math.ceil(lista.length / pageSize);
  let currentPage = 1;

  // 🛠️ Función para crear embed según la página
  const generarEmbed = (pagina) => {
    const inicio = (pagina - 1) * pageSize;
    const fin = inicio + pageSize;
    const comandosPagina = lista.slice(inicio, fin);

    const embed = new EmbedBuilder()
      .setTitle(`📘 Ayuda del Consejo — Página ${pagina}/${totalPages}`)
      .setColor("#0A1A2F")
      .setDescription(
        `Tu jerarquía: ${obtenerIcono(jerarquiaUser)} **${jerarquiaUser}**\n\n` +
        `Solo ves comandos que tu rango permite.`
      )
      .setFooter({ text: "Sistema Administrativo del Consejo" });

    comandosPagina.forEach(cmd => {
      embed.addFields({
        name: `${obtenerIcono(cmd.jerarquia)} ${cmd.nombre}`,
        value:
          `📄 **Descripción:** ${cmd.descripcion}\n` +
          `🔐 **Jerarquía requerida:** ${obtenerIcono(cmd.jerarquia)} ${cmd.jerarquia}\n` +
          `📝 **Ejemplo:** \`${cmd.ejemplo}\``,
        inline: false
      });
    });

    return embed;
  };

  // 🟦 Botones
  const botones = (pagina) =>
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("help_prev")
        .setLabel("◀️ Anterior")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina === 1),
      new ButtonBuilder()
        .setCustomId("help_next")
        .setLabel("Siguiente ▶️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina === totalPages)
    );

  // Enviar primera página
  const mensaje = await msg.reply({
    embeds: [generarEmbed(currentPage)],
    components: [botones(currentPage)]
  });

  // Colector
  const collector = mensaje.createMessageComponentCollector({
    time: 120000 // 2 minutos
  });

  collector.on("collect", async (i) => {
    try {
      if (i.user.id !== msg.author.id)
        return i.reply({ content: "⛔ Solo quien usó !help puede cambiar página.", ephemeral: true });

      if (i.customId === "help_prev" && currentPage > 1) currentPage--;
      if (i.customId === "help_next" && currentPage < totalPages) currentPage++;

      await i.update({
        embeds: [generarEmbed(currentPage)],
        components: [botones(currentPage)]
      });

    } catch (err) {
      console.log("⚠️ Error paginando help:", err);
    }
  });

  collector.on("end", async () => {
    try {
      await mensaje.edit({
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("help_prev")
              .setLabel("◀️ Anterior")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("help_next")
              .setLabel("Siguiente ▶️")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true)
          )
        ]
      });
    } catch {
      // Simple mensaje para cuando se cierra lo que visualiza el comando !help.
      console.log("⚠️ El mensaje de !help fue borrado antes de desactivar botones.");
    }
  });
});



//  Inicia el bot.
client.login(process.env.TOKEN);
