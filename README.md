# Bot de Discord - Consejo Automático

Este proyecto es un **bot de Discord** que envía consejos automáticamente a un canal específico.  
Está diseñado para ser fácil de configurar y seguro, usando un archivo `.env` para almacenar información sensible como el token del bot y el ID del canal.

---

## 1️⃣ Qué hace el bot

- Conecta tu bot de Discord a tu servidor.  
- Simula un consejo, donde se reunen y votan las peticiónes, cooldown de 30s cada petición.  

---

## 2️⃣ Crear el archivo `.env`

Dentro de la carpeta principal del proyecto, crea un archivo llamado:

    .env

        
    Este archivo almacenará las variables que el bot necesita para funcionar.


## 3️⃣ Variables necesarias en `.env`

Agregá estas líneas:

```env
TOKEN=tu_token_del_bot
CANAL_CONSEJO=id_del_canal


    Explicación:

        TOKEN: Es el token de tu bot de Discord.

        Lo conseguís desde la página de desarrolladores de Discord.
        .

        Elegí tu aplicación → Bot → Token → Copy.

        CANAL_CONSEJO: Es el ID del canal de Discord donde el bot enviará mensajes.

        Activá Modo Desarrollador en Discord (Configuración → Avanzado).

        Hacé clic derecho sobre el canal → Copiar ID.


    -- Ejemplo de .env
        TOKEN=NzI1NjA3NzA5OTYxMjM0.NmAbCd.XYZ123abc456
        CANAL_CONSEJO=123456789012345678


    -- Comandos:

        Leer archivo 'Manual_Oficial.md'

    -- Crear archivos con '[]' dentro:

        miembros_consejo.json 
        historial_consejo.json
        firmas.json
        actas.json

    -- A futuro estara creación automatica.

    -- 'historial_hash', en caso de usar para firmas.

