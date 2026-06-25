class VoInventario extends HTMLElement {
  constructor() {
    super();
    this.appendChild(
      document.getElementById("tpl-inventario").content.cloneNode(true),
    );
  }

  connectedCallback() {
    this.renderTabla();

    this.querySelector("#form-insumo").addEventListener("submit", (e) => {
      e.preventDefault();
      this.guardarInsumo();
    });

    this.querySelector("#tabla-insumos").addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-eliminar")) {
        this.eliminarInsumo(e.target.dataset.codigo);
      }
    });
  }

  guardarInsumo() {
    const insumo = {
      codigo: this.querySelector("#ins-codigo").value,
      nombre: this.querySelector("#ins-nombre").value,
      descripcion: this.querySelector("#ins-descripcion").value,
      cantidad: parseFloat(this.querySelector("#ins-cantidad").value),
      unidad: this.querySelector("#ins-unidad").value,
    };

    let insumos = StorageHelper.get("vo_insumos");
    const index = insumos.findIndex((i) => i.codigo === insumo.codigo);

    if (index >= 0) insumos[index] = insumo;
    else insumos.push(insumo);

    StorageHelper.save("vo_insumos", insumos);
    this.querySelector("#form-insumo").reset();
    this.renderTabla();
    document.dispatchEvent(new Event("inventarioActualizado"));

    alert(index >= 0 ? "Insumo actualizado." : "Insumo creado.");
  }

  eliminarInsumo(codigo) {
    if (confirm("¿Eliminar este insumo?")) {
      let insumos = StorageHelper.get("vo_insumos").filter(
        (i) => i.codigo !== codigo,
      );
      StorageHelper.save("vo_insumos", insumos);
      this.renderTabla();
      document.dispatchEvent(new Event("inventarioActualizado"));
    }
  }

  renderTabla() {
    const insumos = StorageHelper.get("vo_insumos");

    this.querySelector("#tabla-insumos").innerHTML =
      insumos.length === 0
        ? `<tr><td colspan="6">No hay insumos registrados.</td></tr>`
        : insumos
            .map(
              (i) => `
                <tr>
                    <td>${i.codigo}</td>
                    <td>${i.nombre}</td>
                    <td>${i.descripcion}</td>
                    <td>${i.cantidad}</td>
                    <td>${i.unidad}</td>
                    <td><button class="btn-danger btn-eliminar" data-codigo="${i.codigo}">Eliminar</button></td>
                </tr>
            `,
            )
            .join("");
  }
}
customElements.define("vo-inventario", VoInventario);
