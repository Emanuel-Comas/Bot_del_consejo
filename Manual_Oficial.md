# 📘 MANUAL OFICIAL — CONSEJO DE HOMBRES

## Edición 2025 / Secretaría General – Archivo Central Masculino


## OBJETIVO DEL CONSEJO

El Consejo de Hombres es una entidad institucional encargada de:

    Supervisar decisiones masculinas importantes.

    Emitir dictámenes oficiales mediante actas.

    Garantizar conformidad con el Código Masculino vigente.

    Evitar decisiones impulsivas y falta de criterio masculino.

"Un hombre no duda. Consulta."

## Miembros del consejo.

    Comando: !miembros


## SOLICITUDES PERMITIDAS

El Consejo admite solicitudes relacionadas con:

    Compras (ropa, zapatillas, accesorios, tecnología).

    Cambios de estilo (corte de pelo, barba).

    Modificaciones del setup.

    Decisiones sentimentales.

    Cualquier acción dudosa que requiera refuerzo masculino.

## CÓMO SOLICITAR UN DICTAMEN

El solicitante debe presentar su caso con:

    !consejo <detalle de la solicitud>

Ejemplo:

    !consejo Necesito aprobación para comprar una campera de cuero.


Al hacerlo, el sistema generará:

    Un Número de Acta único

    Un registro en la Secretaría General

    Un proceso de revisión automática


## PROCESO DE EVALUACIÓN

El Consejo trabaja con:

    Mensajes institucionales aleatorios

Durante la revisión, el sistema mostrará una frase al azar, como:

    “Analizando antecedentes…”

    “Consultando archivos centrales…”

    “Verificando conformidad con el Código Masculino 2024…”

    “Evaluando riesgos de hombría insuficiente…”

    “Contrastando evidencias aportadas…”

    “Obteniendo aprobación preliminar del Comité Ético Masculino…”

Estos mensajes aparecen en orden aleatorio, variando cada vez.
Luego de un tiempo institucional (3 segundos), se genera el dictamen pendiente.

No existen etapas fijas.
Cada evaluación es única, seria y burocrática.


## DICTAMEN PENDIENTE

Una vez finalizada la etapa automática, se mostrará un mensaje donde el Consejo informa:

    Acta

    Petición

    Estado: Pendiente de decisión final

## DECISIONES AUTORIZADAS

Un miembro habilitado del Consejo puede:

    -- Importante: Estos comandos fueron eliminados, ya que no dan transparencia en las votaciónes.

        ID del commit donde se ejecuto esta orden.: cfd3d6cfa872c532772630c1692649c3b00430e2

    🟩 Aprobar:

        !aprobar <acta>

    🟥 Rechazar:

        !rechazar <acta>

El sistema emitirá la Resolución Final, archivada en los registros del Consejo.

## POLÍTICA DE ACTAS

    Cada acta es única e irrepetible.

    Una vez resuelta, no puede modificarse.

    El dictamen se archiva automáticamente en los Archivos Centrales.

    Toda resolución es archivada automáticamente.


## CONSULTA DE ACTAS

    Los administradores del Consejo pueden revisar todas las actas registradas usando el comando:

        !actas

    Al ejecutarlo, el sistema responderá con un listado completo, mostrando para cada acta:

        Número de acta

        Estado: Pendiente, Aprobado o Rechazado

        Petición: Detalle de la solicitud presentada

        Solicitante: Usuario que realizó la solicitud (mencionado)

        Fecha y hora: Momento de generación de la acta

    💡 Notas importantes:

        Solo los administradores del servidor pueden ejecutar este comando.

        La información se muestra en un mensaje embed, para mayor claridad y legibilidad.

        Permite verificar el historial completo de decisiones del Consejo y mantener un archivo centralizado confiable.

    
    Ejemplo de visualización:

        📘 ACT-6404-E — Rechazado
        📄 Petición: solicito aprobación para cambiar de juego
        🙍 Solicitante: @Obito
        🕒 Fecha: 22/11/2025, 19:07

        📘 ACT-1234-A — Aprobado
        📄 Petición: comprar campera
        🙍 Solicitante: @Usuario
        🕒 Fecha: 22/11/2025, 18:35




    Diagrama de flujo del consejo:

        ┌──────────────────────────────┐
        │ Usuario envía solicitud      │
        │ !consejo <detalle>           │
        └─────────────┬────────────────┘
                    │
                    ▼
        ┌──────────────────────────────┐
        │ Bot genera Acta única        │
        │ Ej: ACT-6404-E               │
        │ Guarda registro en JSON      │
        └─────────────┬────────────────┘
                    │
                    ▼
        ┌──────────────────────────────┐
        │ Mensajes institucionales     │
        │ aleatorios (fase de revisión)│
        │ Ej: "Consultando archivos…"  │
        │ Espera 3 segundos            │
        └─────────────┬────────────────┘
                    │
                    ▼
        ┌──────────────────────────────┐
        │ Dictamen Pendiente mostrado  │
        │ - Acta                       │
        │ - Petición                   │
        │ - Estado: Pendiente          │
        │ Consejo ve opciones:         │
        │ boton aprobar <acta>         │
        │ boton rechazar <acta>        │
        └─────────────┬────────────────┘
                    │
            ┌───────┴────────┐
            ▼                ▼
        ┌───────────────┐  ┌───────────────┐
        │ aprobar       │  │ rechazar      │
        │ Solo rol 1,2, │  │ Solo rol 1,2, │
        │ 3,4           │  │ 3,4           │
        │ Acta marcada  │  │ Acta marcada  │
        │ como Aprobada │  │ como Rechazada│
        │ Guardada en   │  │ Guardada en   │
        │ registros     │  │ registros     │
        └───────┬───────┘  └───────┬───────┘
                │                  │
                └─────────┬────────┘
                          ▼
                ┌───────────────────────┐
                │ Comando !actas        │
                │ Solo rol 1            │
                │ Muestra todas las     │
                │ actas con:            │
                │ - Acta                │
                │ - Estado              │
                │ - Petición            │
                │ - Solicitante         │
                │ - Fecha y hora        │
                └───────────────────────┘


## 💡 Notas del diagrama:

    Todo flujo es automático desde !consejo.

    Los mensajes aleatorios son solo para simular revisión institucional.

    Solo los administradores pueden aprobar, rechazar o consultar actas.

    Cada acta queda registrada en el archivo JSON central.


## Funcionalidades de actas.

    Buscar actas específicas:

        Comando: !acta <ACTA>

    Filtrar actas por estado:

        Comando: !actas <pendientes|aprobadas|rechazadas>

    Exportar actas a CSV:

        En el canal autorizado: !exportar
        Al exportarse el ID del usuario, vovlerlo legible asi: <@1234534534345>
        Despues del "@" poner ID y listo.

    Resumen semanal:

        Comando: !resumen

        Qué hace:

            Solo funciona en el canal autorizado.

            Muestra los casos de los últimos 7 días.

            Si no hay casos, responde “No ha habido casos en la semana”.

            Los IDs de los solicitantes se muestran como <@ID> para que Discord los haga legibles.


    Reabrir acta pendiente o resuelta:

        Comando: !reabrir

        Este comando permite reabrir un acta ya cerrada.

        ejemplo:

            !reabrir ACT-6404-E

        Qué hace:

            La pasa de Aprobado → Pendiente

            O de Rechazado → Pendiente

            Resetea firmas

            Limpia resolución final

            Permite iniciar un nuevo proceso de votación


    Editar peticiones (antes de resolución):

        !editar

        Este comando permite editar la descripción de la petición de un acta.
        Antes de editar, se debe usar '!actas', para que se reconozca el acta a editar.

        Ejemplo:

            !editar ACT-6404-E [nueva petición actualizada].

            Qué hace:

                Permite cambiar el texto de la petición.

                Mantiene el ID del solicitante.

                Solo admins pueden editar.

    Borrar actas

        comando !borrar [acta]

        Ejemplo:

            !borrar ACT-3101-W

    Resumen práctico:

        Todos los comandos funcionan solo en el canal autorizado.

        Los IDs de solicitante (<@ID>) se muestran legibles en Discord.

        !resumen da un resumen semanal.

        !reabrir reabre actas cerradas.

        !editar modifica la petición.


## Ascensos/Descensos.

    comando: !ascenso

        Ejemplo: 

            !ascenso 123456789012345678

            Verifica que quien ejecuta el comando es el Gran Canciller.

                Busca el miembro con el ID 921164351988170832.

                Disminuye su número de jerarquía en 1 (más alto).

                Actualiza el JSON miembros_consejo.json.

                Envía un mensaje de confirmación, por ejemplo:

                    ✅ usuario ha sido ascendido a jerarquía 2 (nuevo cargo: Maestro).

    comando: !ascenso

        Ejemplo:

            !descenso 123456789012345678

            Verifica que quien ejecuta el comando es el Gran Canciller.

                Busca el miembro con el ID 921164351988170832.

                Aumenta su número de jerarquía en 5 (más bajo).

                Actualiza el JSON miembros_consejo.json.

                Envía un mensaje de confirmación, por ejemplo:

                    ✅ usuario ha sido ascendido a jerarquía 3 (nuevo cargo: Votante Novato).


## Historial y auditoria.

    Roles con autoridad de estos comandos: 1 y 2.

    Comando: !historial:

        Muestra el historial completo (Solo admin/roles permitidos)

        El historial guarda automaticamente el evento:

            Admin ejecuta: !borrar ACT-1234-A
            El sistema registra automáticamente:
            {
            tipo: "borrado",
            descripcion: "Acta ACT-1234-A eliminada del registro",
            autor: "ID_Admin",
            acta: "ACT-1234-A"
            }


        Resultado esperado:

            Cuando se usa !historial

            Un mensaje embed mostrando algo como:

                📜 Historial de acciones
                - [2025-11-24 10:45] Acta ACT-1234-A aprobada por @GranCanciller
                - [2025-11-24 11:00] Miembro @Juan ascendido a jerarquía 3
                - [2025-11-24 11:15] Acta ACT-1235-B rechazada por @GranCanciller
                ...



    Comando: !firmar 
    
        Permite 'firmar' un acta.

        Ejemplo:

            !firmar ACT-1234-X

            Resultado esperado:

                ✅ Acta ACT-6478-I firmada por @user

                    -- Para que es firmas.json:

                        Aunque las firmas se guardan dentro de actas.json, eso solo sirve dentro del acta.

                        firmas.json es un libro mayor de firmas, un registro continuo y cronológico, ideal para:

                        Auditoría del Consejo

                        Revisar quién firmó qué, incluso en actas borradas

                        Revisar firma por firma sin buscar acta por acta

                        Exportar o analizar firmas

                        Mostrar un historial más claro

                        Es como un “Libro de Firmas” oficial.

                        Si vos borrás un acta:

                            actas.json → pierde las firmas asociadas

                            firmas.json → las firmas quedan registradas igual

                        Esto sirve para evitar:

                            Manipulación

                            Borrado de evidencias

                            Cambios retroactivos

                            Es un sistema de auditoría real.


    Comando: !verfirmas:

        Ver quien firmo qué.

    Ejemplos:

        !verfirmas

            Resultado esperado:

                Firma #1
                🖋 Usuario: <@123456789012345678>
                📘 Acta: ACT-4940-H
                🕒 Fecha: viernes, 14 de febrero de 2025 16:32


    comando !verfirma <acta>

        Ejemplo: !verfirma ACT-1234-X

            Devuelve:

                ✔Solicitud
                ✔ Petición
                ✔ Estado
                ✔ Fecha
                ✔ Firmas internas (en actas.json)
                ✔ Firmas del registro global (firmas.json)

            Perfecto para revisar el proceso de forma completa.


    Comando !firmauser <userid>

        Muestra que firmo el @userid

        Ejemplo: !firmauser 123456789012345678

        Respuesta:

            ✒️ Firmas realizadas por @usuario

            📘 Acta ACT-4940-H
            📄 Petición: “Solicito revisión de conducta masculina”
            🙍 Solicitante: @juan
            📌 Estado: Aprobado
            🕒 Fecha acta: 14/02/2025 18:11
            ✍️ Fecha firma: 14/02/2025 18:32



## Automatizaciónes.

    Qué hace:

        Corre automáticamente ciertas funciones de gestión sin intervención humana:

        cierresAutomaticos(client) → Cierra actas pendientes después de un tiempo límite '48h'.

        recordatorios(client, canalAutorizado) → Envía recordatorios automáticos a miembros del Consejo sobre actas pendientes.

        backupHistorial() → Hace respaldo del historial automáticamente.

    Ejemplos:

        Cierre automático: Si un acta queda pendiente por más de X días, se cierra y registra en el historial.

        Recordatorio: Envia un DM o mensaje en el canal del Consejo:

            "⏰ Recordatorio: La acta ACT-4567-B sigue pendiente de votación"

            Backup de historial: Cada cierto tiempo se genera un archivo historial_backup.json.


## Solitudes para ser parte del consejo.

    Comando: !solicitarPresencia

    Ejemplo:

        !solicitarPresencia <ID_del_usuario>

        o

        !solicitarPresencia @Usuario

        <ID_del_usuario> es el Discord ID de la persona que quieres invitar.

        Solo se permite que lo haga alguien con permiso de administrador.


## Ayuda sobre comandos.

    Comando !help

        

## CÓDIGO DE ÉTICA DEL CONSEJO

    Toda solicitud debe ser tratada con seriedad institucional.

    Ningún hombre puede ser juzgado por pedir aprobación.

    Se debe evitar el uso indebido del poder del Consejo.

    Queda estrictamente prohibido aprobar sin análisis.

    Se fomentará la hombría responsable y el sentido común.


## CONFIGURACIÓN DEL SERVIDOR

Se recomienda crear un canal:

    📘・consejo-de-hombres

Y fijar el siguiente mensaje:

    📘 BIENVENIDO AL CONSEJO DE HOMBRES

    Presente sus solicitudes con:

        !consejo <detalle>

    El Consejo evaluará su caso con mensajes institucionales aleatorios y emitirá un dictamen pendiente.

    📘 “El hombre sabio pregunta — el Consejo responde.”


## CONTACTO Y SOPORTE

    Para soporte técnico del bot o ampliación del manual, contactar a:

        Secretaría General del Consejo