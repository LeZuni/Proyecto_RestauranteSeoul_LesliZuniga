// Verificar autenticación
const isAuthPage =
  window.location.pathname.endsWith("login.html") ||
  window.location.pathname.endsWith("registro.html");
const currentUser = localStorage.getItem("currentUser");

if (!isAuthPage && !currentUser) {
  window.location.href = "login.html";
} else if (isAuthPage && currentUser) {
  window.location.href = "index.html";
}

function login(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (user) {
    localStorage.setItem("currentUser", username);
    window.location.href = "index.html";
  } else {
    alert("Credenciales incorrectas");
  }
}

function register(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find((u) => u.username === username)) {
    alert("El usuario ya existe");
  } else {
    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registro exitoso, por favor inicie sesión");
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}
