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

.env:

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

    

## 🏛️ Jerarquías del Consejo — Permisos Oficiales

    📌 Tabla de jerarquías y permisos

    | Jerarquía | Título   |   Permisos  

    | **1**️⃣    | **Gran Canciller**     | • Votar<br>• Ver actas<br>• Ver historial<br>• Firmar<br>• Ver firmas<br>• Ascender/descender miembros

    | **2**️⃣    | **Maestro Votante**    | • Votar<br>• Ver actas<br>• Ver historial<br>• Firmar<br>• Ver firmas

    | **3**️⃣    | **Votante Novato**     | • Votar                                    

    | **4**️⃣    | **Aprendiz Observador** | • Votar         

    | **5**️⃣    | **Espectador**         | • Solo ver 

---

    🗳️ ¿Quiénes pueden votar?

    | Jerarquía | Título               | Puede votar |
    |----------:|----------------------|-------------|
    | **1**️⃣    | Gran Canciller       | ✔ Sí        |
    | **2**️⃣    | Maestro Votante      | ✔ Sí        |
    | **3**️⃣    | Votante Novato       | ✔ Sí        |
    | **4**️⃣    | Aprendiz Observador  | ✔ Sí        |
    | **5**️⃣    | Espectador           | ❌ No        |

    ---

    📘 Resumen rápido

    - **Firmar actas:** solo jerarquías **1 y 2**
    - **Ver historial:** solo jerarquías **1 y 2**
    - **Ver firmas:** solo jerarquías **1 y 2**
    - **Ver actas:** solo jerarquías **1 y 2**
    - **Votar:** jerarquías **1, 2, 3 y 4**
    - **Ascensos / descensos:** solo jerarquía **1**
    - **Jerarquía mínima (5):** acceso limitado y sin interacción administrativa
---