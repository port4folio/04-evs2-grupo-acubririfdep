// ============================================================
// Portal del Empleado — Seguridad LTDA
// Autor: Gabriel del Pino Carrasco
// Historia de Usuario: GA-7
// Descripción: Validación de login con credenciales hasheadas
// ============================================================

const USERS = [
  {
    // usuario: gabriel@seguridad.cl / contraseña: empleado123
    usernameHash: "332aa0254a8dfdb3c5dc1bb347550b1163ece1a41af2378f375b4b493eb25d70",
    passwordHash: "ccc13e8ab0819e3ab61719de4071ecae6c1d3cd35dc48b91cad3481f20922f9f",
    role: "empleado"
  },
  {
    // usuario: admin@seguridad.cl / contraseña: admin2025
    usernameHash: "b4c5272f91202ba3ac4bf1d2801a3af316a3200268eb751cfb2179d0255ca723",
    passwordHash: "0e89f223e226ae63268cf39152ab75722e811b89d29efb22a852f1667bd22ae0",
    role: "admin"
  },
  {
    // usuario: rrhh@seguridad.cl / contraseña: rrhh2025
    usernameHash: "698a4061d09240c60e1a00a6e186967c61bf8ed03a69a5e9b53ec1134b057c1e",
    passwordHash: "ffc1e6999389ab8927475c428643c18cfe5b5dd4cd2f56618c898aa9f8c865a4",
    role: "rrhh"
  },
  {
    // usuario: bodeguero@seguridad.cl / contraseña: bodeguero123
    usernameHash: "be707652ab89752726490fdaaf35f2d269774bbb0bd0286a5fdfaf185239b139",
    passwordHash: "698e5db82a790c81d494f7942ba848c54cbef422f82e2ba17938c30ce315d271",
    role: "bodeguero"
  }
];

/**
 * Retorna la lista combinada de usuarios fijos y usuarios creados por el admin.
 * @returns {Array} Lista completa de usuarios
 */
function getAllUsers() {
  const stored = localStorage.getItem("systemUsers");
  const dynamicUsers = stored ? JSON.parse(stored) : [];
  console.log("Usuarios en localStorage al login:", dynamicUsers);
  return [...USERS, ...dynamicUsers];
}

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
 * Maneja el envío del formulario de login.
 * @param {Event} event - Evento submit del formulario
 */
async function handleLogin(event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username").value.trim();
  const passwordInput = document.getElementById("password").value;
  const errorDiv = document.getElementById("loginError");
  const submitBtn = document.querySelector(".btn-login");

  submitBtn.disabled = true;
  submitBtn.textContent = "Verificando...";
  errorDiv.hidden = true;

  const usernameHash = await hashText(usernameInput);
  const passwordHash = await hashText(passwordInput);

  const allUsers = getAllUsers();
  const userFound = allUsers.find(
    u => u.usernameHash === usernameHash && u.passwordHash === passwordHash
  );

  if (userFound) {
    sessionStorage.setItem("userRole", userFound.role);
    sessionStorage.setItem("username", usernameInput);

    if (userFound.role === "admin") {
      window.location.href = "../../seguridad y administracion/ERPS 17/index.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } else {
    errorDiv.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Iniciar sesión";
  }
}

document.getElementById("loginForm").addEventListener("submit", handleLogin);