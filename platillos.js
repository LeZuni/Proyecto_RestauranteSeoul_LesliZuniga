class VoPlatillos extends HTMLElement {
  constructor() {
    super();
    this.ingredientesTemp = [];
    this.appendChild(
      document.getElementById("tpl-platillos").content.cloneNode(true),
    );
  }

  connectedCallback() {
    this.renderSelectInsumos();
    this.renderPlatillos();

    document.addEventListener("inventarioActualizado", () =>
      this.renderSelectInsumos(),
    );

    this.querySelector("#btn-add-ingrediente").addEventListener("click", () =>
      this.agregarIngrediente(),
    );

    this.querySelector("#form-platillo").addEventListener("submit", (e) => {
      e.preventDefault();
      this.guardarPlatillo();
    });

    this.querySelector("#grid-platillos").addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-eliminar-plat"))
        this.eliminarPlatillo(e.target.dataset.codigo);
    });

    this.querySelector("#lista-ingredientes-temp").addEventListener(
      "click",
      (e) => {
        if (e.target.classList.contains("btn-quitar-ing"))
          this.quitarIngrediente(e.target.dataset.index);
      },
    );
  }

  renderSelectInsumos() {
    this.querySelector("#plat-insumo").innerHTML = StorageHelper.get(
      "vo_insumos",
    )
      .map(
        (i) => `<option value="${i.codigo}">${i.nombre} (${i.unidad})</option>`,
      )
      .join("");
  }

  agregarIngrediente() {
    const codigo = this.querySelector("#plat-insumo").value;
    const cantidad = parseFloat(this.querySelector("#plat-insumo-cant").value);

    if (!codigo || isNaN(cantidad) || cantidad <= 0)
      return alert("Seleccione insumo y cantidad válida.");

    const insumo = StorageHelper.get("vo_insumos").find(
      (i) => i.codigo === codigo,
    );
    if (insumo) {
      this.ingredientesTemp.push({
        codigo: insumo.codigo,
        nombre: insumo.nombre,
        unidad: insumo.unidad,
        cantidad,
      });
      this.renderListaIngredientesTemp();
      this.querySelector("#plat-insumo-cant").value = "";
    }
  }

  renderListaIngredientesTemp() {
    this.querySelector("#lista-ingredientes-temp").innerHTML =
      this.ingredientesTemp
        .map(
          (ing, i) => `
            <li>${ing.nombre} - ${ing.cantidad} ${ing.unidad} 
            <button type="button" class="btn-danger btn-quitar-ing" data-index="${i}" style="padding: 0.1rem 0.5rem; font-size: 0.8rem; margin-left: 1rem;">X</button></li>
        `,
        )
        .join("");
  }

  quitarIngrediente(index) {
    this.ingredientesTemp.splice(index, 1);
    this.renderListaIngredientesTemp();
  }

  guardarPlatillo() {
    if (this.ingredientesTemp.length === 0)
      return alert("El platillo necesita al menos un ingrediente.");

    const platillo = {
      codigo: this.querySelector("#plat-codigo").value,
      nombre: this.querySelector("#plat-nombre").value,
      descripcion: this.querySelector("#plat-descripcion").value,
      imagen: this.querySelector("#plat-imagen").value,
      precio: parseFloat(this.querySelector("#plat-precio").value),
      ingredientes: this.ingredientesTemp,
    };

    let platillos = StorageHelper.get("vo_platillos");
    const index = platillos.findIndex((p) => p.codigo === platillo.codigo);

    if (index >= 0) platillos[index] = platillo;
    else platillos.push(platillo);

    StorageHelper.save("vo_platillos", platillos);
    this.querySelector("#form-platillo").reset();
    this.ingredientesTemp = [];
    this.renderListaIngredientesTemp();
    this.renderPlatillos();
    document.dispatchEvent(new Event("platillosActualizados"));

    alert(index >= 0 ? "Platillo actualizado." : "Platillo creado.");
  }

  eliminarPlatillo(codigo) {
    if (confirm("¿Borrar este platillo?")) {
      StorageHelper.save(
        "vo_platillos",
        StorageHelper.get("vo_platillos").filter((p) => p.codigo !== codigo),
      );
      this.renderPlatillos();
      document.dispatchEvent(new Event("platillosActualizados"));
    }
  }

  renderPlatillos() {
    const platillos = StorageHelper.get("vo_platillos");
    this.querySelector("#grid-platillos").innerHTML =
      platillos.length === 0
        ? '<p style="color: #777;">No hay platillos creados.</p>'
        : platillos
            .map(
              (p) => `
                <div style="display: flex; flex-direction: column; gap: 0.4rem; background: white; padding-bottom: 1rem;">
                    <img src="${p.imagen}" alt="${p.nombre}" style="width: 100%; height: 200px; object-fit: cover; border-radius: var(--radius-lg); margin-bottom: 0.5rem;">
                    <h4 style="margin: 0; color: var(--color-text); font-weight: 600; font-size: 1.1rem; letter-spacing: 0.5px;">${p.nombre}</h4>
                    <p style="margin: 0; color: var(--color-text-light); font-size: 0.85rem; line-height: 1.4;">${p.descripcion}</p>
                    <p style="margin: 0; font-weight: 600; font-size: 1rem; color: var(--color-text); margin-top: 0.2rem;">$${p.precio.toFixed(2)}</p>
                    <button class="btn-danger btn-eliminar-plat" data-codigo="${p.codigo}" style="margin-top: 0.5rem; width: max-content; padding: 0.3rem 0.8rem; font-size: 0.75rem;">Eliminar</button>
                </div>
            `,
            )
            .join("");
  }
}
customElements.define("vo-platillos", VoPlatillos);
