document.addEventListener("DOMContentLoaded", () => {
  function actualizarDashboard() {
    if (!document.getElementById("dash-insumos")) return;

    document.getElementById("dash-insumos").textContent =
      StorageHelper.get("vo_insumos").length;
    document.getElementById("dash-platillos").textContent =
      StorageHelper.get("vo_platillos").length;

    const hoy = new Date().toISOString().slice(0, 10);
    document.getElementById("dash-pedidos").textContent = StorageHelper.get(
      "vo_pedidos",
    ).filter((p) => p.fecha.startsWith(hoy)).length;
  }

  actualizarDashboard();

  [
    "inventarioActualizado",
    "platillosActualizados",
    "pedidosActualizados",
  ].forEach((evento) => document.addEventListener(evento, actualizarDashboard));
});
