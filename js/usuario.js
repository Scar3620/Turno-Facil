const parametros = new URLSearchParams(window.location.search);
    const nombre = parametros.get("nombre");
    const nombre2 = document.getElementById("nombre2");
    const saludo = document.getElementById("saludo");

        if (nombre2) nombre2.textContent = nombre;
    if (saludo) saludo.textContent = "Hola, " + nombre;

        // Carga dinámica de categorías

        const contenedorCategorias = document.getElementById("categorias-container");

    if (contenedorCategorias) {
        const API_URL = "http://localhost:3000";

        // Imagen para cada categoría según su nombre en la BD
        const imagenesCategorias = {
            barberia: "Imagen/barberia.jpeg",
            peluqueria: "Imagen/peluqueria.jpeg",
            manicure: "Imagen/manicure.jpeg",
            spa: "Imagen/spa.jpeg"
        };

        // ===== INICIO DE LO AGREGADO =====
        // Quita tildes y el plural, para que "Barberías" coincida con la llave "barberia"
        function normalizarTexto(texto) {
            return texto
                .toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/s$/, "");
        }
        // ===== FIN DE LO AGREGADO =====

        fetch(`${API_URL}/categorias`)
            .then((respuesta) => respuesta.json())
            .then((datos) => {
                const categorias = datos.categorias || [];

                if (categorias.length === 0) {
                    contenedorCategorias.innerHTML =
                        `<p class="text-center mt-4">Actualmente no hay servicios disponibles</p>`;
                    return;
                }

                contenedorCategorias.innerHTML = categorias.map((categoria) => {
                    const nombreKey = normalizarTexto(categoria.nombre); // ===== MODIFICADO =====
                    const imagen = imagenesCategorias[nombreKey] || "Imagen/otros.jpeg";

                    return `
                        <div class="col-md-3">
                          <div class="card border-0 shadow-lg h-100">
                            <img src="${imagen}" class="card-img-top" alt="${categoria.nombre}">
                            <div class="card-body">
                              <h5>${categoria.nombre}</h5>
                              <p class="card-text">${categoria.descripcion || ""}</p>
                              <a href="negocio.html?categoria_id=${categoria.categoria_id}&categoria=${encodeURIComponent(categoria.nombre)}" class="btn btn-primary w-100 rounded-pill">
                                Ver más
                              </a>
                            </div>
                          </div>
                        </div>
                    `;
                }).join("");
            })
            .catch((error) => {
                console.error("Error al cargar categorías:", error);
                contenedorCategorias.innerHTML =
                    `<p class="text-center mt-4">Actualmente no hay servicios disponibles</p>`;
            });
    }