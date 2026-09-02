// 1. VARIABLES INICIALES
const parametros = new URLSearchParams(window.location.search);
const imagen = document.getElementById("imagenNegocio");
const nombre = document.getElementById("nombreNegocio");
const descripcion = document.getElementById("descripcionNegocio");

// Se declara el select de servicio UNA SOLA VEZ aquí
const servicio = document.getElementById("servicio"); 

const categoria = parametros.get("categoria");

// 2. CAMBIO DINÁMICO SEGÚN LA CATEGORÍA
if (categoria === "barberia") {
    nombre.textContent = "Barberia Premium";
    imagen.src = "Imagen/barberia.jpeg";
    descripcion.textContent = "Corte de cabello, arreglo de barba y perfilado.";
    
    servicio.innerHTML = `
      <option value="Corte clásico">Corte clásico</option>
      <option value="Barba">Barba</option>
      <option value="Masaje">Masaje</option>
    `;
} 
else if (categoria === "manicure") {
    nombre.textContent = "Manicure Elite";
    imagen.src = "Imagen/manicure.jpeg";
    descripcion.textContent = "Manos, Pies, Completas, Esmalte estandar u otros.";

    servicio.innerHTML = `
      <option value="Manos">Manos</option>
      <option value="Pies">Pies</option>
      <option value="Completas">Completas</option>
      <option value="Esmalte estándar">Esmalte estándar</option>
    `;
} 
else if (categoria === "spa") {
    nombre.textContent = "Spa Premium";
    imagen.src = "Imagen/spa.jpeg";
    descripcion.textContent = "Masajes relajantes, Limpieza facial, Terapias corporales.";

    servicio.innerHTML = `
      <option value="Masaje relajante">Masaje relajante</option>
      <option value="Limpieza facial">Limpieza facial</option>
      <option value="Terapia corporal">Terapia corporal</option>
    `;
} 
else {
    nombre.textContent = "Peluqueria Elite";
    imagen.src = "Imagen/peluqueria.jpeg";
    descripcion.textContent = "Corte, Lavado, Secado, y Estilizado.";

    servicio.innerHTML = `
      <option value="Corte">Corte</option>
      <option value="Lavado">Lavado</option>
      <option value="Secado">Secado</option>
      <option value="Estilizado">Estilizado</option>
    `;
}

// 3. FUNCIONALIDAD DEL RESUMEN
const profesional = document.getElementById("profesional");
const fecha = document.getElementById("fecha");
const horas = document.querySelectorAll("#horas button");

const resServicio = document.getElementById("res-servicio");
const resProfesional = document.getElementById("res-profesional");
const resFecha = document.getElementById("res-fecha");
const resHora = document.getElementById("res-hora");
const resPrecio = document.getElementById("res-precio");

// Precios de todos los servicios para que ninguno quede en blanco
const precios = {
    "Corte clásico": "$25.000",
    "Barba": "$15.000",
    "Masaje": "$40.000",
    "Manos": "$20.000",
    "Pies": "$25.000",
    "Completas": "$40.000",
    "Esmalte estándar": "$15.000",
    "Masaje relajante": "$50.000",
    "Limpieza facial": "$60.000",
    "Terapia corporal": "$80.000",
    "Corte": "$20.000",
    "Lavado": "$10.000",
    "Secado": "$15.000",
    "Estilizado": "$30.000"
};

// 4. EVENTOS DE ACTUALIZACIÓN
servicio.addEventListener("change", () => {
    resServicio.textContent = servicio.value;
    resPrecio.textContent = precios[servicio.value] || "";
});

profesional.addEventListener("change", () => {
    resProfesional.textContent = profesional.value;
});

fecha.addEventListener("change", () => {
    resFecha.textContent = fecha.value;
});

horas.forEach(btn => {
    btn.addEventListener("click", () => {
        horas.forEach(b => b.classList.remove("btn-primary"));
        horas.forEach(b => b.classList.add("btn-outline-secondary"));
        btn.classList.remove("btn-outline-secondary");
        btn.classList.add("btn-primary");
        resHora.textContent = btn.textContent.trim();
    });
});

document.getElementById("btnConfirmar").addEventListener("click", () => {
    localStorage.setItem("servicio", document.getElementById("res-servicio").textContent);
    localStorage.setItem("profesional", document.getElementById("res-profesional").textContent);
    localStorage.setItem("fecha", document.getElementById("res-fecha").textContent);
    localStorage.setItem("hora", document.getElementById("res-hora").textContent);
    localStorage.setItem("precio", document.getElementById("res-precio").textContent);
    localStorage.setItem("negocio", document.getElementById("nombreNegocio").textContent);
});