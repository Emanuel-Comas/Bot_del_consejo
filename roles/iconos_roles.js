// roles/iconos_roles.js

// Iconos visuales por jerarquía
const iconosJerarquia = {
    1: "👑",  // Gran Canciller
    2: "🛡️", // Alto Consejo
    3: "⚔️", // Miembro de Honor
    4: "📘", // Miembro Pleno
    5: "🔹"  // Nuevo Miembro
};

// Función que devuelve el icono según la jerarquía
function obtenerIcono(jerarquia) {
    return iconosJerarquia[jerarquia] || "❔";
}

module.exports = {
    iconosJerarquia,
    obtenerIcono
};
