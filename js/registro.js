// URL de tu API (cámbiala si despliegas el backend en otro dominio/puerto)
const API_URL = "http://localhost:3000/usuarios";

const form = document.getElementById("form-registro");
const mensajeDiv = document.getElementById("mensaje");
const btnRegistrar = document.getElementById("btn-iniciar");

form.addEventListener("submit", async (e) => {
  // Evita que el navegador recargue la página al enviar el form
  e.preventDefault();

  // Tomamos los valores de cada input, quitando espacios sobrantes
  const nombre = document.getElementById("input-nombre").value.trim();
  const correo = document.getElementById("input-correo").value.trim();
  const telefono = document.getElementById("input-telefono").value.trim();
  const contrasena = document.getElementById("input-contrasena").value;
  const confirmar = document.getElementById("input-contrasena-confirmar").value;

  limpiarMensaje();

  // --- Validaciones mínimas en el frontend ---

  if (!nombre || !correo || !telefono || !contrasena || !confirmar) {
    mostrarMensaje("Todos los campos son obligatorios.", "danger");
    return;
  }

  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexCorreo.test(correo)) {
    mostrarMensaje("Ingresa un correo electrónico válido.", "danger");
    return;
  }

  if (contrasena.length < 6) {
    mostrarMensaje("La contraseña debe tener al menos 6 caracteres.", "danger");
    return;
  }

  if (contrasena !== confirmar) {
    mostrarMensaje("Las contraseñas no coinciden.", "danger");
    return;
  }

  // --- Envío a la API ---
  try {
    btnRegistrar.disabled = true;
    btnRegistrar.textContent = "Registrando...";

    const respuesta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Ojo: "Telefono" con T mayúscula, así lo espera app.js y tu tabla
      body: JSON.stringify({ nombre, correo, Telefono: telefono, contrasena }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      // El backend responde con { mensaje: "..." } cuando hay error
      mostrarMensaje(datos.mensaje || "Error al registrar el usuario.", "danger");
      return;
    }

    mostrarMensaje("¡Registro exitoso! Ya puedes iniciar sesión.", "success");
    form.reset();

    // Si quieres redirigir automáticamente al login, descomenta:
    // setTimeout(() => { window.location.href = "iniciarSesion.html"; }, 1500);

  } catch (error) {
    console.error("Error de conexión:", error);
    mostrarMensaje("No se pudo conectar con el servidor. ¿Está corriendo el backend?", "danger");
  } finally {
    btnRegistrar.disabled = false;
    btnRegistrar.textContent = "Registrarse";
  }
});

function mostrarMensaje(texto, tipo) {
  if (!mensajeDiv) return;
  mensajeDiv.textContent = texto;
  mensajeDiv.className = `alert alert-${tipo} mt-3`;
}

function limpiarMensaje() {
  if (!mensajeDiv) return;
  mensajeDiv.textContent = "";
  mensajeDiv.className = "";
}