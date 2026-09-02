    
  const parametros = new URLSearchParams(window.location.search);
    const nombre = parametros.get("nombre");
    const nombre2 = document.getElementById("nombre2");
    const saludo = document.getElementById("saludo");
    nombre2.textContent = nombre;
    saludo.textContent = "Hola, "+nombre;