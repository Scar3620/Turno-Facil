const API_URL = "http://localhost:3000";

// 1. VARIABLES INICIALES (parámetros de la URL)
const parametros = new URLSearchParams(window.location.search);
const categoriaId = parametros.get("categoria_id");
const categoriaNombre = parametros.get("categoria") || "negocios";

// Elementos de la tarjeta de detalle del negocio
const imagen = document.getElementById("imagenNegocio");
const nombreEl = document.getElementById("nombreNegocio");
const direccionEl = document.getElementById("direccionNegocio");
const horarioEl = document.getElementById("horarioNegocio");
const descripcionEl = document.getElementById("descripcionNegocio");

// Elementos del panel "Selecciona los detalles de tu cita"
const servicio = document.getElementById("servicio");
const profesional = document.getElementById("profesional");
const fecha = document.getElementById("fecha");
const horasContenedor = document.getElementById("horas");
const btnConfirmar = document.getElementById("btnConfirmar");

// Elementos del resumen
const resServicio = document.getElementById("res-servicio");
const resProfesional = document.getElementById("res-profesional");
const resFecha = document.getElementById("res-fecha");
const resHora = document.getElementById("res-hora");
const resPrecio = document.getElementById("res-precio");

// Elementos de la lista de negocios
const listaNegocios = document.getElementById("lista-negocios");
const paginacionNegocios = document.getElementById("paginacion-negocios");
const tituloListaNegocios = document.getElementById("tituloListaNegocios");

// Elementos que controlan qué secciones se muestran u ocultan
const mensajeSinNegocios = document.getElementById("mensajeSinNegocios");
const seccionListaNegocios = document.getElementById("seccionListaNegocios");
const panelReserva = document.getElementById("panelReserva");

// Imagen por categoría (mismo criterio que en usuario.js)
const imagenesCategorias = {
    barberia: "Imagen/barberia.jpeg",
    peluqueria: "Imagen/peluqueria.jpeg",
    manicure: "Imagen/manicure.jpeg",
    spa: "Imagen/spa.jpeg"
};

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/s$/, "");
}

const imagenCategoriaActual = imagenesCategorias[normalizarTexto(categoriaNombre)] || "Imagen/otros.jpeg";

tituloListaNegocios.textContent = `${categoriaNombre} disponibles`;

// Guarda el negocio actualmente seleccionado
let negocioSeleccionadoId = null;

// Estado de paginación (5 negocios por página)
let negociosCargados = [];
let paginaActual = 1;
const NEGOCIOS_POR_PAGINA = 5;

// 2. CARGAR LA LISTA DE NEGOCIOS DE LA CATEGORÍA
function cargarNegocios() {
    if (!categoriaId) {
        // ===== usa el mismo bloque de "sin negocios" en vez de un mensaje suelto =====
        mostrarSinNegocios();
        return;
    }

    fetch(`${API_URL}/negocios?categoria_id=${encodeURIComponent(categoriaId)}`)
        .then((respuesta) => respuesta.json())
        .then((datos) => {
            negociosCargados = datos.negocios || [];

            if (negociosCargados.length === 0) {
                mostrarSinNegocios();
                return;
            }

            // Hay negocios: se muestran la lista y el panel de reserva (aún deshabilitado)
            mensajeSinNegocios.style.display = "none";
            seccionListaNegocios.style.display = "";
            panelReserva.style.display = "";

            paginaActual = 1;
            renderizarPaginaNegocios();
        })
        .catch((error) => {
            console.error("Error al cargar negocios:", error);
            mostrarSinNegocios();
        });
}

// Oculta la lista y el panel de reserva; deja solo el mensaje de "no hay negocios"
function mostrarSinNegocios() {
    mensajeSinNegocios.style.display = "";
    seccionListaNegocios.style.display = "none";
    panelReserva.style.display = "none";
}

function renderizarPaginaNegocios() {
    const inicio = (paginaActual - 1) * NEGOCIOS_POR_PAGINA;
    const negociosPagina = negociosCargados.slice(inicio, inicio + NEGOCIOS_POR_PAGINA);

    listaNegocios.innerHTML = negociosPagina.map((negocio) => `
        <div class="card mb-2 negocio-item" data-id="${negocio.negocio_id}" style="cursor:pointer;">
          <div class="card-body py-3">
            <h6 class="mb-1 fw-bold">${negocio.nombre_negocio}</h6>
            <small class="text-muted">${negocio.direccion || ""}</small>
          </div>
        </div>
    `).join("");

    // Clic en un negocio de la lista
    document.querySelectorAll(".negocio-item").forEach((tarjeta) => {
        tarjeta.addEventListener("click", () => {
            document.querySelectorAll(".negocio-item").forEach((t) => t.classList.remove("border-primary"));
            tarjeta.classList.add("border-primary");
            seleccionarNegocio(tarjeta.dataset.id);
        });
    });

    renderizarPaginacion();
}

function renderizarPaginacion() {
    const totalPaginas = Math.ceil(negociosCargados.length / NEGOCIOS_POR_PAGINA);

    if (totalPaginas <= 1) {
        paginacionNegocios.innerHTML = "";
        return;
    }

    let botones = "";
    for (let i = 1; i <= totalPaginas; i++) {
        botones += `<button class="btn btn-sm ${i === paginaActual ? "btn-primary" : "btn-outline-primary"} btn-pagina" data-pagina="${i}">${i}</button>`;
    }
    paginacionNegocios.innerHTML = botones;

    document.querySelectorAll(".btn-pagina").forEach((btn) => {
        btn.addEventListener("click", () => {
            paginaActual = parseInt(btn.dataset.pagina, 10);
            renderizarPaginaNegocios();
        });
    });
}

// 3. AL ELEGIR UN NEGOCIO: llenar tarjeta de detalle + habilitar panel

function seleccionarNegocio(negocioId) {
    negocioSeleccionadoId = negocioId;
    const negocio = negociosCargados.find((n) => String(n.negocio_id) === String(negocioId));
    if (!negocio) return;

    // Tarjeta de detalle
    imagen.src = imagenCategoriaActual;
    nombreEl.textContent = negocio.nombre_negocio;
    direccionEl.textContent = negocio.direccion ? `📍 ${negocio.direccion}` : "";
    horarioEl.textContent = negocio.horario_atencion ? `🕘 ${negocio.horario_atencion}` : "";
    descripcionEl.textContent = negocio.descripcion || "";

    // Reiniciar horas hasta que se sepa si hay servicio/profesional disponibles
    horasContenedor.innerHTML = `<span class="text-muted">Elige un servicio y un profesional</span>`;

    hayServicios = false;
    hayProfesionales = false;

    cargarServicios(negocioId);
    cargarProfesionales(negocioId);
}

// 4. SERVICIOS Y PROFESIONALES DEL NEGOCIO ELEGIDO

// Controla si hay datos suficientes para poder reservar
let hayServicios = false;
let hayProfesionales = false;

function actualizarDisponibilidadPanel() {
    const disponible = hayServicios && hayProfesionales;

    fecha.disabled = !disponible;
    btnConfirmar.classList.toggle("disabled", !disponible);
    if (disponible) {
        btnConfirmar.removeAttribute("aria-disabled");
    } else {
        btnConfirmar.setAttribute("aria-disabled", "true");
        horasContenedor.innerHTML = `<span class="text-muted">No disponible</span>`;
    }
}

function cargarServicios(negocioId) {
    fetch(`${API_URL}/negocios/${negocioId}/servicios`)
        .then((respuesta) => respuesta.json())
        .then((datos) => {
            const servicios = datos.servicios || [];

            if (servicios.length === 0) {
                servicio.innerHTML = `<option value="">No hay servicios disponibles</option>`;
                servicio.disabled = true;
                hayServicios = false;
                actualizarDisponibilidadPanel();
                return;
            }

            servicio.disabled = false;
            hayServicios = true;

            servicio.innerHTML = servicios.map((s) =>
                `<option value="${s.detalle_servicio_id}" data-precio="${s.precio || ""}">${s.nombre_servicio}</option>`
            ).join("");
            actualizarResumenServicio();
            actualizarDisponibilidadPanel(); 
            intentarCargarHorarios();
        })
        .catch((error) => console.error("Error al cargar servicios:", error));
}

function cargarProfesionales(negocioId) {
    fetch(`${API_URL}/negocios/${negocioId}/profesionales`)
        .then((respuesta) => respuesta.json())
        .then((datos) => {
            const profesionales = datos.profesionales || [];

            if (profesionales.length === 0) {
                profesional.innerHTML = `<option value="">No hay profesionales disponibles</option>`;
                profesional.disabled = true;
                hayProfesionales = false;
                actualizarDisponibilidadPanel();
                return;
            }

            profesional.disabled = false;
            hayProfesionales = true;

            profesional.innerHTML = profesionales.map((p) =>
                `<option value="${p.profesional_id}">${p.nombre}</option>`
            ).join("");
            resProfesional.textContent = profesional.value ? profesional.options[profesional.selectedIndex].text : "";
            actualizarDisponibilidadPanel(); 
            intentarCargarHorarios();
        })
        .catch((error) => console.error("Error al cargar profesionales:", error));
}

// 5. HORARIOS DISPONIBLES (deshabilita los ya reservados)
let horariosCargados = [];

function intentarCargarHorarios() {
    if (!hayServicios || !hayProfesionales) return; 

    const detalleServicioId = servicio.value;
    const profesionalId = profesional.value;

    if (!detalleServicioId || !profesionalId) return;

    fetch(`${API_URL}/horarios?detalle_servicio_id=${detalleServicioId}&profesional_id=${profesionalId}`)
        .then((respuesta) => respuesta.json())
        .then((datos) => {
            horariosCargados = datos.horarios || [];
            renderizarHorasParaFecha();
        })
        .catch((error) => console.error("Error al cargar horarios:", error));
}

function renderizarHorasParaFecha() {
    if (horariosCargados.length === 0) {
        horasContenedor.innerHTML = `<span class="text-muted">No hay horarios cargados para este profesional/servicio</span>`;
        return;
    }

    // Si ya hay una fecha elegida, solo se muestran las horas de esa fecha;
    // si no, se muestran todas las fechas disponibles.
    const fechaElegida = fecha.value;
    const horariosFiltrados = fechaElegida
        ? horariosCargados.filter((h) => h.fecha.startsWith(fechaElegida))
        : horariosCargados;

    if (horariosFiltrados.length === 0) {
        horasContenedor.innerHTML = `<span class="text-muted">No hay horarios disponibles para esta fecha</span>`;
        return;
    }

    horasContenedor.innerHTML = horariosFiltrados.map((h) => {
        const horaTexto = h.hora.slice(0, 5);
        const etiqueta = fechaElegida ? horaTexto : `${h.fecha} ${horaTexto}`;
        return `<button class="btn btn-outline-secondary btn-hora" data-fecha="${h.fecha}" data-hora="${horaTexto}" ${h.reservado ? "disabled" : ""}>${etiqueta}${h.reservado ? " (reservado)" : ""}</button>`;
    }).join("");

    document.querySelectorAll(".btn-hora").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".btn-hora").forEach((b) => {
                b.classList.remove("btn-primary");
                b.classList.add("btn-outline-secondary");
            });
            btn.classList.remove("btn-outline-secondary");
            btn.classList.add("btn-primary");
            resHora.textContent = btn.dataset.hora;
            resFecha.textContent = btn.dataset.fecha;
        });
    });
}

// 6. EVENTOS DE ACTUALIZACIÓN DEL RESUMEN

function actualizarResumenServicio() {
    const opcion = servicio.options[servicio.selectedIndex];
    if (!opcion) return;
    resServicio.textContent = opcion.text;
    const precio = opcion.dataset.precio;
    resPrecio.textContent = precio ? `$${Number(precio).toLocaleString("es-CO")}` : "";
}

servicio.addEventListener("change", () => {
    actualizarResumenServicio();
    intentarCargarHorarios();
});

profesional.addEventListener("change", () => {
    resProfesional.textContent = profesional.options[profesional.selectedIndex]?.text || "";
    intentarCargarHorarios();
});

fecha.addEventListener("change", () => {
    resFecha.textContent = fecha.value;
    renderizarHorasParaFecha();
});

btnConfirmar.addEventListener("click", (e) => {
    if (btnConfirmar.classList.contains("disabled")) {
        e.preventDefault();
        return;
    }
    localStorage.setItem("servicio", resServicio.textContent);
    localStorage.setItem("profesional", resProfesional.textContent);
    localStorage.setItem("fecha", resFecha.textContent);
    localStorage.setItem("hora", resHora.textContent);
    localStorage.setItem("precio", resPrecio.textContent);
    localStorage.setItem("negocio", nombreEl.textContent);
});

// 7. INICIO
cargarNegocios();