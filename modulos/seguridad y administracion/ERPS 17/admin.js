// ============================================================
// Seguridad y Administración — Seguridad LTDA
// Autor: Gabriel del Pino Carrasco
// Historia de Usuario: ERPS-17
// Descripción: Gestión de roles y usuarios del sistema
// ============================================================

// usuarios base del sistema (cargados desde sessionStorage si existen)
const DEFAULT_USERS = [
  { username: "gabriel@seguridad.cl", role: "empleado" },
  { username: "admin@seguridad.cl", role: "admin" },
  { username: "rrhh@seguridad.cl", role: "rrhh" },
  { username: "bodeguero@seguridad.cl", role: "bodeguero" }
];

/**
 * Carga los usuarios desde sessionStorage o usa los por defecto.
 * @returns {Array} Lista de usuarios
 */
function loadUsers() {
  const stored = sessionStorage.getItem("systemUsers");
  return stored ? JSON.parse(stored) : DEFAULT_USERS;
}

/**
 * Guarda los usuarios en sessionStorage.
 * @param {Array} users - Lista de usuarios a guardar
 */
function saveUsers(users) {
  sessionStorage.setItem("systemUsers", JSON.stringify(users));
}

/**
 * Renderiza la tabla de usuarios en pantalla.
 */
function renderUsersTable() {
  const users = loadUsers();
  const tbody = document.getElementById("usersTableBody");

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.username}</td>
      <td><span class="role-badge role-${u.role}">${u.role}</span></td>
    </tr>
  `).join("");
}

/**
 * Crea un nuevo usuario y lo agrega a la lista.
 */
function createUser() {
  const username = document.getElementById("newUsername").value.trim();
  const password = document.getElementById("newPassword").value;
  const role = document.getElementById("newRole").value;
  const errorDiv = document.getElementById("createError");
  const successDiv = document.getElementById("createSuccess");

  errorDiv.hidden = true;
  successDiv.hidden = true;

  if (!username || !password || !role) {
    errorDiv.hidden = false;
    return;
  }

  const users = loadUsers();
  users.push({ username, role });
  saveUsers(users);

  // limpia el formulario
  document.getElementById("newUsername").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("newRole").value = "empleado";

  successDiv.hidden = false;
}

/**
 * Muestra la sección seleccionada y oculta las demás.
 * @param {string} sectionName - Nombre de la sección a mostrar
 */
function showSection(sectionName) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

  document.getElementById(`section-${sectionName}`).classList.add("active");
  event.target.classList.add("active");

  if (sectionName === "usuarios") {
    renderUsersTable();
  }
}

/**
 * Inicializa el dashboard verificando la sesión activa.
 */
function init() {
  const role = sessionStorage.getItem("userRole");
  const username = sessionStorage.getItem("username");

  if (!role || !username) {
    window.location.href = "../../portal empleado/ERPS 7/login.html";
    return;
  }

  if (role !== "admin") {
    window.location.href = "../../portal empleado/ERPS 7/dashboard.html";
    return;
  }

  document.getElementById("welcomeTitle").textContent = `¡Bienvenido, ${username}!`;
  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "../../portal empleado/ERPS 7/login.html";
  });

  renderUsersTable();
}

init();