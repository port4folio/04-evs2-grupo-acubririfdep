// ============================================================
// Portal del Empleado — Seguridad LTDA
// Autor: Gabriel del Pino Carrasco
// Historia de Usuario: ERPS-17
// Descripción: Muestra contenido según el rol del usuario
// ============================================================

const ROLE_CONTENT = {
  admin: {
    icon: "🛡️",
    title: "Panel Administrador",
    items: [
      "Gestionar usuarios y roles",
      "Ver reportes del sistema",
      "Configurar parámetros del ERP",
      "Acceso a todos los módulos"
    ]
  },
  rrhh: {
    icon: "👥",
    title: "Panel RRHH",
    items: [
      "Gestionar fichas de empleados",
      "Controlar asistencia y licencias",
      "Calcular liquidaciones",
      "Gestionar vacaciones"
    ]
  },
  empleado: {
    icon: "👤",
    title: "Panel Empleado",
    items: [
      "Ver mis datos personales",
      "Consultar mis liquidaciones",
      "Solicitar vacaciones",
      "Ver mis contratos"
    ]
  },
  bodeguero: {
    icon: "📦",
    title: "Panel Bodeguero",
    items: [
      "Gestionar inventario",
      "Registrar entradas y salidas de stock",
      "Consultar productos por bodega",
      "Generar reportes de inventario"
    ]
  }
};

/**
 * Carga el contenido del dashboard según el rol guardado en sessionStorage.
 * Si no hay sesión activa, redirige al login.
 */
function loadDashboard() {
  const role = sessionStorage.getItem("userRole");
  const username = sessionStorage.getItem("username");

  if (!role || !username) {
    window.location.href = "login.html";
    return;
  }

  const content = ROLE_CONTENT[role];

  if (!content) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("roleIcon").textContent = content.icon;
  document.getElementById("welcomeTitle").textContent = `¡Bienvenido, ${username}!`;
  document.getElementById("roleLabel").textContent = content.title;

  const roleContentDiv = document.getElementById("roleContent");
  roleContentDiv.innerHTML = content.items
    .map(item => `<span>✔ ${item}</span>`)
    .join("");

  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.clear();
  });
}

loadDashboard();