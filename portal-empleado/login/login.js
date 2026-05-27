// ============================================================
// Portal del Empleado — Seguridad LTDA
// Autor: Gabriel del Pino Carrasco
// Historia de Usuario: GA-7
// Descripción: Validación de login con credenciales hasheadas
// ============================================================

const USERS = [
  {
    // Usuario: gabriel@seguridad.cl, Contraseña: empleado123
    usernameHash: "332aa0254a8dfdb3c5dc1bb347550b1163ece1a41af2378f375b4b493eb25d70",
    passwordHash: "ccc13e8ab0819e3ab61719de4071ecae6c1d3cd35dc48b91cad3481f20922f9f",
    role: "empleado"
  },
  {
    // Usuario: admin@seguridad.cl, Contraseña: admin123
    usernameHash: "b4c5272f91202ba3ac4bf1d2801a3af316a3200268eb751cfb2179d0255ca723",
    passwordHash: "0e89f223e226ae63268cf39152ab75722e811b89d29efb22a852f1667bd22ae0",
    role: "admin"
  },
  {
    // Usuario: rrhh@seguridad.cl, Contraseña: rrhh123
    usernameHash: "698a4061d09240c60e1a00a6e186967c61bf8ed03a69a5e9b53ec1134b057c1e",
    passwordHash: "ffc1e6999389ab8927475c428643c18cfe5b5dd4cd2f56618c898aa9f8c865a4",
    role: "rrhh"
  }
];

/**
 * Genera el hash SHA-256 de un texto
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

  console.log("usernameHash:", usernameHash);
  console.log("passwordHash:", passwordHash);

  const userFound = USERS.find(
    u => u.usernameHash === usernameHash && u.passwordHash === passwordHash
  );

  console.log("userFound:", userFound);

  if (userFound) {
    sessionStorage.setItem("userRole", userFound.role);
    sessionStorage.setItem("username", usernameInput);
    window.location.href = "dashboard.html";
  } else {
    errorDiv.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Iniciar sesión";
  }
}

document.getElementById("loginForm").addEventListener("submit", handleLogin);