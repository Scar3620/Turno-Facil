  // Cargar datos desde localStorage
    document.getElementById("det-negocio").textContent = localStorage.getItem("negocio") || "";
  document.getElementById("det-servicio").textContent = localStorage.getItem("servicio") || "";
  document.getElementById("det-fecha").textContent = localStorage.getItem("fecha") || "";
  document.getElementById("det-hora").textContent = localStorage.getItem("hora") || "";
  document.getElementById("det-precio").textContent = localStorage.getItem("precio") || "";
