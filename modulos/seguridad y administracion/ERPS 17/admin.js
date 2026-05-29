// ============================================================
// Seguridad y Administración — Seguridad LTDA
// Autor: Gabriel del Pino Carrasco
// Historia de Usuario: ERPS-17
// Descripción: Gestión de roles y usuarios del sistema
// ============================================================

/**
 * Genera el hash SHA-256 de un texto.
 * @param {string} text - Texto a hashear
 * @returns {Promise<string>} Hash en formato hexadecimal
 */
async function hashText(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Carga los usuarios desde localStorage.
 * @returns {Array} Lista de usuarios
 */
function loadUsers() {
  const stored = localStorage.getItem("systemUsers");
  return stored ? JSON.parse(stored) : [];
}

/**
 * Guarda los usuarios en localStorage.
 * @param {Array} users - Lista de usuarios
 */
function saveUsers(users) {
  localStorage.setItem("systemUsers", JSON.stringify(users));
}

/**
 * Renderiza la tabla de usuarios en pantalla.
 */
function renderUsersTable() {
  const users = loadUsers();
  const tbody = document.getElementById("usersTableBody");

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; color:#8b91a8">No hay usuarios registrados.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.username}</td>
      <td><span class="role-badge role-${u.role}">${u.role}</span></td>
    </tr>
  `).join("");
}

/**
 * Crea un nuevo usuario con sus credenciales hasheadas.
 */
async function createUser() {
  const username = document.getElementById("newUsername").value.trim();
  const password = document.getElementById("newPassword").value;
  const role = document.getElementById("newRole").value;
  const errorDiv = document.getElementById("createError");
  const successDiv = document.getElementById("createSuccess");

  errorDiv.hidden = true;
  successDiv.hidden = true;
  errorDiv.textContent = "Completa todos los campos.";

  if (!username || !password || !role) {
    errorDiv.hidden = false;
    return;
  }

  const usernameHash = await hashText(username);
  const passwordHash = await hashText(password);

  const users = loadUsers();

  // verifica que el usuario no exista ya
  const exists = users.find(u => u.usernameHash === usernameHash);
  if (exists) {
    errorDiv.textContent = "Este usuario ya existe.";
    errorDiv.hidden = false;
    return;
  }

  users.push({ username, usernameHash, passwordHash, role });
  saveUsers(users);

  console.log("Usuario creado:", { username, usernameHash, passwordHash, role });
  console.log("Usuarios en localStorage:", loadUsers());

  document.getElementById("newUsername").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("newRole").value = "empleado";

  successDiv.hidden = false;
  renderUsersTable();
}

/**
 * Muestra la sección seleccionada y oculta las demás.
 * @param {string} sectionName - Nombre de la sección
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
 * Inicializa el panel verificando la sesión activa.
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