class VoPedidos extends HTMLElement {
  constructor() {
    super();
    this.platillosSeleccionados = [];
    this.appendChild(
      document.getElementById("tpl-pedidos").content.cloneNode(true),
    );
  }

  connectedCallback() {
    this.renderSelectPlatillos();
    this.renderHistorial();

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.querySelector("#ped-fecha").value = now.toISOString().slice(0, 16);

    document.addEventListener("platillosActualizados", () =>
      this.renderSelectPlatillos(),
    );
    this.querySelector("#btn-add-platillo-pedido").addEventListener(
      "click",
      () => this.agregarPlatilloAlPedido(),
    );
    this.querySelector("#form-pedido").addEventListener("submit", (e) => {
      e.preventDefault();
      this.guardarPedido();
    });

    this.querySelector("#tabla-pedidos-temp").addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-quitar-plat"))
        this.quitarPlatilloPedido(e.target.dataset.index);
    });
    this.querySelector("#tabla-historial-pedidos").addEventListener(
      "click",
      (e) => {
        if (e.target.classList.contains("btn-eliminar-ped"))
          this.eliminarPedido(e.target.dataset.numero);
      },
    );
  }

  renderSelectPlatillos() {
    this.querySelector("#ped-platillo").innerHTML = StorageHelper.get(
      "vo_platillos",
    )
      .map(
        (p) =>
          `<option value="${p.codigo}">${p.nombre} - $${p.precio}</option>`,
      )
      .join("");
  }

  agregarPlatilloAlPedido() {
    const codigo = this.querySelector("#ped-platillo").value;
    const cantidad = parseInt(this.querySelector("#ped-plat-cant").value);

    if (!codigo || isNaN(cantidad) || cantidad <= 0)
      return alert("Seleccione platillo y cantidad válida.");

    const platillo = StorageHelper.get("vo_platillos").find(
      (p) => p.codigo === codigo,
    );
    if (platillo) {
      this.platillosSeleccionados.push({
        ...platillo,
        cantidad,
        subtotal: platillo.precio * cantidad,
      });
      this.renderPlatillosTemp();
      this.querySelector("#ped-plat-cant").value = "1";
    }
  }

  renderPlatillosTemp() {
    const tbody = this.querySelector("#tabla-pedidos-temp");

    const total = this.platillosSeleccionados.reduce(
      (sum, p) => sum + p.subtotal,
      0,
    );

    tbody.innerHTML = this.platillosSeleccionados
      .map(
        (plat, i) => `
            <tr>
                <td>${plat.nombre}</td>
                <td>${plat.cantidad}</td>
                <td>$${plat.subtotal.toFixed(2)}</td>
                <td><button type="button" class="btn-danger btn-quitar-plat" data-index="${i}">X</button></td>
            </tr>
        `,
      )
      .join("");

    this.querySelector("#pedido-total").textContent = total.toFixed(2);
  }

  quitarPlatilloPedido(index) {
    this.platillosSeleccionados.splice(index, 1);
    this.renderPlatillosTemp();
  }

  verificarInventario() {
    let inventario = StorageHelper.get("vo_insumos");
    let insumosNecesarios = {};

    this.platillosSeleccionados.forEach((platillo) => {
      platillo.ingredientes.forEach((ing) => {
        insumosNecesarios[ing.codigo] =
          (insumosNecesarios[ing.codigo] || 0) +
          ing.cantidad * platillo.cantidad;
      });
    });

    for (let codigo in insumosNecesarios) {
      let insumo = inventario.find((i) => i.codigo === codigo);
      if (!insumo) {
        alert(`Error: Insumo ${codigo} no encontrado.`);
        return false;
      }
      if (insumo.cantidad < insumosNecesarios[codigo]) {
        alert(
          `Falta: ${insumo.nombre}. Necesitas ${insumosNecesarios[codigo]}, pero solo tienes ${insumo.cantidad}.`,
        );
        return false;
      }
    }

    inventario.forEach((i) => {
      if (insumosNecesarios[i.codigo])
        i.cantidad -= insumosNecesarios[i.codigo];
    });
    StorageHelper.save("vo_insumos", inventario);
    document.dispatchEvent(new Event("inventarioActualizado"));

    return true;
  }

  guardarPedido() {
    if (this.platillosSeleccionados.length === 0)
      return alert("El pedido está vacío.");

    const numero = this.querySelector("#ped-numero").value;
    let pedidos = StorageHelper.get("vo_pedidos");

    if (pedidos.find((p) => p.numero === numero))
      return alert("El número de pedido ya existe.");
    if (!this.verificarInventario()) return;

    pedidos.push({
      numero,
      fecha: this.querySelector("#ped-fecha").value,
      cliente: this.querySelector("#ped-cliente").value,
      telefono: this.querySelector("#ped-telefono").value,
      estado: this.querySelector("#ped-estado").value,
      total: parseFloat(this.querySelector("#pedido-total").textContent),
      platillos: this.platillosSeleccionados,
    });

    StorageHelper.save("vo_pedidos", pedidos);
    alert("Pedido guardado. Inventario actualizado.");

    this.querySelector("#form-pedido").reset();
    this.platillosSeleccionados = [];
    this.renderPlatillosTemp();
    this.renderHistorial();
    document.dispatchEvent(new Event("pedidosActualizados"));
  }

  eliminarPedido(numero) {
    if (confirm("¿Eliminar este pedido?")) {
      StorageHelper.save(
        "vo_pedidos",
        StorageHelper.get("vo_pedidos").filter((p) => p.numero !== numero),
      );
      this.renderHistorial();
      document.dispatchEvent(new Event("pedidosActualizados"));
    }
  }

  renderHistorial() {
    const pedidos = StorageHelper.get("vo_pedidos");
    this.querySelector("#tabla-historial-pedidos").innerHTML =
      pedidos.length === 0
        ? '<tr><td colspan="6">No hay pedidos registrados.</td></tr>'
        : pedidos
            .map(
              (p) => `
                <tr>
                    <td>${p.numero}</td>
                    <td>${new Date(p.fecha).toLocaleString()}</td>
                    <td>${p.cliente}</td>
                    <td>$${p.total.toFixed(2)}</td>
                    <td><span class="badge badge-${p.estado}">${p.estado.toUpperCase()}</span></td>
                    <td><button class="btn-danger btn-eliminar-ped" data-numero="${p.numero}">Eliminar</button></td>
                </tr>
            `,
            )
            .join("");
  }
}
customElements.define("vo-pedidos", VoPedidos);
