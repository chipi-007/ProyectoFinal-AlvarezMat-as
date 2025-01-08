document.addEventListener("DOMContentLoaded", () => {
  const contenedorCards = document.getElementById("contenedor-cards");
  const contenedorDinamico = document.getElementById("contenedor-dinamico");
  const mensaje = document.getElementById("mensaje");

  let seleccion = { tipo: "", tamano: "", acabado: "", precioTotal: 0, porcentaje: 0 };

  // Mostrar opciones de tipo de impresión
  mostrarOpciones("tiposImpresion", "Elige un tipo de impresión");

  // Manejo de selección de tipo de impresión
  contenedorCards.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-seleccionar")) {
      seleccion.tipo = e.target.dataset.tipoimpresion;
      mensaje.textContent = `Has seleccionado: ${seleccion.tipo.toUpperCase()}. Elige un tamaño.`;
      mostrarOpciones("tamanos", "Elige un tamaño para tu impresión");
    }
  });

  // Mostrar opciones dinámicas (con cards)
  function mostrarOpciones(categoria, titulo) {
    fetch("./datos/precios.json")
      .then((res) => res.json())
      .then((data) => {
        contenedorCards.innerHTML = "";
        contenedorDinamico.innerHTML = `
          <h2>${titulo}</h2>
          <div id="opciones" class="opciones"></div>
          <button id="confirmar" class="btn-seleccionar">Confirmar selección</button>
        `;

        const opciones = data[categoria];
        const opcionesContainer = document.getElementById("opciones");

        for (const [key, { descripcion, precio, porcentajePrecio }] of Object.entries(opciones)) {
          const div = document.createElement("div");
          div.classList.add("card", "opcion");
          div.innerHTML = `
            <img src="./images/${key.toLowerCase()}.jpg" alt="${key}">
            <h3>${key}</h3>
            <p>${descripcion}</p>
            ${porcentajePrecio ? `<p>Recargo: ${porcentajePrecio}% sobre el precio base</p>` : ''}
            <button class="btn-seleccionar" data-${categoria}="${key}">Seleccionar</button>
          `;
          div.querySelector(".btn-seleccionar").addEventListener("click", () => {
            if (categoria === "tiposImpresion") {
              seleccion.tipo = key;
              seleccion.porcentaje = porcentajePrecio || 0;
            } else if (categoria === "tamanos") {
              seleccion.tamano = key;
              seleccion.precioTotal += precio || 0;
            } else if (categoria === "acabados") {
              seleccion.acabado = key;
              seleccion.precioTotal += precio || 0;
            }
            mensaje.textContent = `Has seleccionado: ${key}.`;
          });
          opcionesContainer.appendChild(div);
        }

        // Confirmar selección
        document.getElementById("confirmar").addEventListener("click", () => {
          if (
            (categoria === "tiposImpresion" && !seleccion.tipo) ||
            (categoria === "tamanos" && !seleccion.tamano) ||
            (categoria === "acabados" && !seleccion.acabado)
          ) {
            Swal.fire({
              icon: "warning",
              title: "Oops...",
              text: "Debes realizar una selección antes de continuar.",
              confirmButtonText: "Entendido",
            });
          } else if (categoria === "tiposImpresion") {
            mostrarOpciones("tamanos", "Elige un tamaño para tu impresión");
          } else if (categoria === "tamanos") {
            mostrarOpciones("acabados", "Elige un acabado para tu impresión");
          } else if (categoria === "acabados") {
            mostrarResultadoFinal();
          }
        });
      })
      .catch((err) => console.error("Error al cargar datos:", err));
  }

  // Mostrar resultado final
  function mostrarResultadoFinal() {
    const precioConRecargo = seleccion.precioTotal + (seleccion.precioTotal * seleccion.porcentaje) / 100;

    contenedorDinamico.innerHTML = `
      <h2>Resumen de tu Cotización</h2>
      <div class="card">
        <h3>Cotización Final</h3>
        <p>Tipo de Impresión: ${seleccion.tipo}</p>
        <p>Tamaño: ${seleccion.tamano}</p>
        <p>Acabado: ${seleccion.acabado}</p>
        <p><strong>Precio Total: $${precioConRecargo.toFixed(2)}</strong></p>
      </div>
      <button id="reiniciar" class="btn-seleccionar">Volver al inicio</button>
    `;

    // Manejar el reinicio del proceso
    document.getElementById("reiniciar").addEventListener("click", () => {
      seleccion = { tipo: "", tamano: "", acabado: "", precioTotal: 0, porcentaje: 0 }; // Reiniciar los datos
      contenedorDinamico.innerHTML = "";
      mensaje.textContent = "Selecciona el tipo de impresión para comenzar.";
      mostrarOpciones("tiposImpresion", "Elige un tipo de impresión");
    });
  }
});
