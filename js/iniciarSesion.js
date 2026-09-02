// Capturamos los elementos del HTML que vamos a usar
const formLogin = document.getElementById("form-login");
const inputCorreo = document.getElementById("input-correo");
const inputContrasena = document.getElementById("input-contrasena");
const mensajeError = document.getElementById("mensaje-error");

// Función para mostrar un error en pantalla
function mostrarError(texto) {
  mensajeError.textContent = texto;
  mensajeError.classList.remove("d-none");
}

// Función para ocultar el error (por si el usuario reintenta)
function ocultarError() {
  mensajeError.classList.add("d-none");
}

//Cuando el formulario se envíe, ejecuta esta función, y dentro de ella a esperará respuestas del servidor
formLogin.addEventListener("submit", async (evento) => {

evento.preventDefault(); // 1. Evita que la página se recargue sola

const correo = inputCorreo.value;
const contrasena = inputContrasena.value;

//Le mandamos los datos al backend
const respuesta = await fetch("http://localhost:3000/login",{
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({ correo, contrasena })
});

//lectura de respuesta
const datos = await respuesta.json()

if (!respuesta.ok) {
  //Si el backend dice que hubo error (401, 400, 500...)
  mostrarError(datos.mensaje);
  return;
}

// 5. Si todo salió bien, guardamos quién inició sesión
localStorage.setItem ("usuarioActual", JSON.stringify(datos.usuario));
window.location.href = "sesionUsuario.html";
});


