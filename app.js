// Variables globales
let recogidas = JSON.parse(localStorage.getItem('recogidasBetcris') || '[]');
let compras = JSON.parse(localStorage.getItem('comprasBetcris') || '[]');
let rusos = JSON.parse(localStorage.getItem('ventasRusos') || '[]');
let trans = JSON.parse(localStorage.getItem('transaccionesUSDT') || '[]');
let transFiltradas = [...trans];
let mesReporte = new Date();

// Migrar datos antiguos (agregar campo estado si no existe)
recogidas = recogidas.map(r => ({ ...r, estado: r.estado || 'pendiente' }));
compras = compras.map(c => ({ ...c, estado: c.estado || 'pendiente' }));
rusos = rusos.map(r => ({ ...r, estado: r.estado || 'pendiente' }));
localStorage.setItem('recogidasBetcris', JSON.stringify(recogidas));
localStorage.setItem('comprasBetcris', JSON.stringify(compras));
localStorage.setItem('ventasRusos', JSON.stringify(rusos));

window.onload = function() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaR').value = hoy;
    document.getElementById('fechaC').value = hoy;
    document.getElementById('fechaRu').value = hoy;
    document.getElementById('fechaT').value = hoy;
    document.getElementById('ultimaActualizacion').textContent = new Date().toLocaleString('es-DO');
    actualizar();
    actualizarReporte();
};

function cambiarTab(tab) {
    ['tabBetcris', 'tabRusos', 'tabTransacciones', 'tabReportes', 'tabHistorial'].forEach(id => {
        document.getElementById(id).className = 'tab-inactive px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer';
    });
    
    ['seccionBetcris', 'seccionRusos', 'seccionTransacciones', 'seccionReportes', 'seccionHistorial'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    
    const tabId = 'tab' + tab.charAt(0).toUpperCase() + tab.slice(1);
    const seccionId = 'seccion' + tab.charAt(0).toUpperCase() + tab.slice(1);
    
    document.getElementById(tabId).className = 'tab-active px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer';
    document.getElementById(seccionId).classList.remove('hidden');
    
    if (tab === 'reportes') actualizarReporte();
    if (tab === 'historial') actualizarHistorial();
}

// BETCRIS - Recogidas
function agregarRecogida() {
    const f = document.getElementById('fechaR').value;
    const d = parseFloat(document.getElementById('dop').value) || 0;
    const u = parseFloat(document.getElementById('usd').value) || 0;
    const t = parseFloat(document.getElementById('tasa').value) || 0;
    
    if (!f || (!d && !u)) {
        alert('Completa fecha y al menos un monto');
        return;
    }
    
    if (d > 0 && t === 0) {
        alert('Si ingresas DOP, especifica la tasa');
        return;
    }
    
    const dopAUsd = t > 0 ? d / t : 0;
    const totalUsd = dopAUsd + u;
    const usdtLiquidar = totalUsd / 1.03;
    const tresPorciento = totalUsd - usdtLiquidar;
    
    recogidas.push({
        id: Date.now(),
        fecha: f,
        dop: d,
        usd: u,
        tasa: t,
        dopAUsd: dopAUsd,
        totalUsd: totalUsd,
        usdtLiquidar: usdtLiquidar,
        tresPorciento: tresPorciento,
        estado: 'pendiente'
    });
    
    localStorage.setItem('recogidasBetcris', JSON.stringify(recogidas));
    document.getElementById('dop').value = '';
    document.getElementById('usd').value = '';
    document.getElementById('tasa').value = '';
    actualizar();
}

function liquidarRecogida(id) {
    const recogida = recogidas.find(r => r.id === id);
    if (!recogida) return;
    
    if (confirm(`¿Liquidar esta recogida?\n\nUSDT: ${recogida.usdtLiquidar.toFixed(2)}\n3% Ganado: $${recogida.tresPorciento.toFixed(2)}`)) {
        recogida.estado = 'liquidado';
        recogida.fechaLiquidacion = new Date().toISOString().split('T')[0];
        localStorage.setItem('recogidasBetcris', JSON.stringify(recogidas));
        actualizar();
    }
}

function eliminarRecogida(id) {
    if (!confirm('¿Eliminar esta recogida?')) return;
    recogidas = recogidas.filter(r => r.id !== id);
    localStorage.setItem('recogidasBetcris', JSON.stringify(recogidas));
    actualizar();
}

// BETCRIS - Compras
function agregarCompra() {
    const f = document.getElementById('fechaC').value;
    const c = parseFloat(document.getElementById('cantC').value);
    const p = parseFloat(document.getElementById('porcC').value);
    const n = document.getElementById('notasC').value;
    
    if (!f || !c || !p) {
        alert('Completa fecha, cantidad y % de costo');
        return;
    }
    
    const costoUSD = c * (p / 100);
    
    compras.push({
        id: Date.now(),
        fecha: f,
        cantidad: c,
        porcentaje: p,
        costoUSD: costoUSD,
        notas: n,
        estado: 'pendiente'
    });
    
    localStorage.setItem('comprasBetcris', JSON.stringify(compras));
    document.getElementById('cantC').value = '';
    document.getElementById('porcC').value = '';
    document.getElementById('notasC').value = '';
    actualizar();
}

function liquidarCompra(id) {
    const compra = compras.find(c => c.id === id);
    if (!compra) return;
    
    if (confirm(`¿Liquidar esta compra?\n\nCosto: $${compra.costoUSD.toFixed(2)}`)) {
        compra.estado = 'liquidado';
        compra.fechaLiquidacion = new Date().toISOString().split('T')[0];
        localStorage.setItem('comprasBetcris', JSON.stringify(compras));
        actualizar();
    }
}

function eliminarCompra(id) {
    if (!confirm('¿Eliminar esta compra?')) return;
    compras = compras.filter(c => c.id !== id);
    localStorage.setItem('comprasBetcris', JSON.stringify(compras));
    actualizar();
}

// RUSOS
function agregarRuso() {
    const f = document.getElementById('fechaRu').value;
    const u = parseFloat(document.getElementById('usdtRu').value);
    const p = parseFloat(document.getElementById('porcRu').value);
    const n = document.getElementById('notasRu').value;
    
    if (!f || !u || !p) {
        alert('Completa fecha, USDT y porcentaje');
        return;
    }
    
    const gananciaTotal = u * (p / 100);
    const tuParte = gananciaTotal / 2;
    
    rusos.push({
        id: Date.now(),
        fecha: f,
        usdt: u,
        porcentaje: p,
        gananciaTotal: gananciaTotal,
        tuParte: tuParte,
        parteSocio: tuParte,
        notas: n,
        estado: 'pendiente'
    });
    
    localStorage.setItem('ventasRusos', JSON.stringify(rusos));
    document.getElementById('usdtRu').value = '';
    document.getElementById('porcRu').value = '';
    document.getElementById('notasRu').value = '';
    actualizar();
}

function pagarSocio(id) {
    const venta = rusos.find(r => r.id === id);
    if (!venta) return;
    
    if (confirm(`¿Registrar pago al socio?\n\nMonto: $${venta.parteSocio.toFixed(2)}`)) {
        venta.estado = 'pagado';
        venta.fechaPago = new Date().toISOString().split('T')[0];
        localStorage.setItem('ventasRusos', JSON.stringify(rusos));
        actualizar();
    }
}

function eliminarRuso(id) {
    if (!confirm('¿Eliminar esta venta?')) return;
    rusos = rusos.filter(r => r.id !== id);
    localStorage.setItem('ventasRusos', JSON.stringify(rusos));
    actualizar();
}

// TRANSACCIONES
function agregarTrans() {
    const tipo = document.getElementById('tipo').value;
    const c = parseFloat(document.getElementById('cantT').value);
    const pm = parseFloat(document.getElementById('precioM').value);
    const tp = parseFloat(document.getElementById('tuPrecioT').value);
    const f = document.getElementById('fechaT').value;
    
    if (!c || !pm || !tp || !f) {
        alert('Completa todos los campos');
        return;
    }
    
    const ganancia = (tipo === 'Compra' ? pm - tp : tp - pm) * c;
    
    trans.push({
        id: Date.now(),
        tipo: tipo,
        cantidad: c,
        ganancia: ganancia,
        fecha: f
    });
    
    localStorage.setItem('transaccionesUSDT', JSON.stringify(trans));
    transFiltradas = [...trans];
    document.getElementById('cantT').value = '';
    document.getElementById('precioM').value = '';
    document.getElementById('tuPrecioT').value = '';
    actualizar();
}

function eliminarTrans(id) {
    if (!confirm('¿Eliminar?')) return;
    trans = trans.filter(t => t.id !== id);
    localStorage.setItem('transaccionesUSDT', JSON.stringify(trans));
    transFiltradas = [...trans];
    actualizar();
}

function filtrarTransacciones() {
    const buscar = document.getElementById('buscar').value.toLowerCase();
    const desde = document.getElementById('fechaDesde').value;
    const hasta = document.getElementById('fechaHasta').value;
    const tipo = document.getElementById('filtroTipo').value;
    
    transFiltradas = trans.filter(t => {
        const matchFecha = (!desde || t.fecha >= desde) && (!hasta || t.fecha <= hasta);
        const matchTipo = !tipo || t.tipo === tipo;
        return matchFecha && matchTipo;
    });
    
    actualizarTablaTransacciones();
}

function exportarDatos() {
    if (trans.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    let csv = 'Tipo,Cantidad USDT,Ganancia,Fecha\n';
    trans.forEach(t => {
        csv += `${t.tipo},${t.cantidad},${t.ganancia},${t.fecha}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacciones_usdt_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// ACTUALIZAR TABLAS
function actualizar() {
    actualizarTablaBetcris();
    actualizarTablaRusos();
    actualizarTablaTransacciones();
    document.getElementById('ultimaActualizacion').textContent = new Date().toLocaleString('es-DO');
}

function actualizarTablaBetcris() {
    // Solo contar pendientes
    const recogidasPendientes = recogidas.filter(r => r.estado === 'pendiente');
    const comprasPendientes = compras.filter(c => c.estado === 'pendiente');
    
    let totalLiquidar = recogidasPendientes.reduce((sum, r) => sum + r.usdtLiquidar, 0);
    let totalComprado = comprasPendientes.reduce((sum, c) => sum + c.cantidad, 0);
    let totalTresPorciento = recogidasPendientes.reduce((sum, r) => sum + r.tresPorciento, 0);
    let totalCostoCompras = comprasPendientes.reduce((sum, c) => sum + c.costoUSD, 0);
    let gananciaBetcris = totalTresPorciento - totalCostoCompras;
    
    document.getElementById('totalLiquidar').textContent = totalLiquidar.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('totalCompradosB').textContent = totalComprado.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('gananciaBetcris').textContent = '$' + gananciaBetcris.toLocaleString('es-DO', {minimumFractionDigits: 2});
    
    // Tabla recogidas
    const tbodyR = document.getElementById('tablaR');
    tbodyR.innerHTML = '';
    
    recogidas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(r => {
        const esLiquidado = r.estado === 'liquidado';
        const tr = document.createElement('tr');
        tr.className = `border-b border-gray-100 hover:bg-blue-50 transition-colors ${esLiquidado ? 'row-liquidado' : ''}`;
        tr.innerHTML = `
            <td class="py-3 px-3">${r.fecha}</td>
            <td class="text-right py-3 px-3 font-mono">${r.dop.toLocaleString('es-DO', {minimumFractionDigits: 2})}</td>
            <td class="text-right py-3 px-3 font-mono">${r.usd.toLocaleString('es-DO', {minimumFractionDigits: 2})}</td>
            <td class="text-right py-3 px-3 font-mono">${r.tasa > 0 ? r.tasa.toFixed(2) : '-'}</td>
            <td class="text-right py-3 px-3 font-mono text-green-600 font-semibold">$${r.totalUsd.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono text-blue-600 font-bold">${r.usdtLiquidar.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono text-emerald-600 font-bold">$${r.tresPorciento.toFixed(2)}</td>
            <td class="text-center py-3 px-3">
                <span class="${esLiquidado ? 'badge-liquidado' : 'badge-pendiente'}">
                    ${esLiquidado ? '✓ Liquidado' : '⏳ Pendiente'}
                </span>
            </td>
            <td class="text-center py-3 px-3">
                ${esLiquidado ? 
                    `<span class="text-green-600 text-xs">${r.fechaLiquidacion}</span>` :
                    `<button onclick="liquidarRecogida(${r.id})" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm mr-1 transition-colors">✓ Liquidar</button>`
                }
                <button onclick="eliminarRecogida(${r.id})" class="text-red-600 hover:text-red-700 transition-colors text-lg">🗑️</button>
            </td>
        `;
        tbodyR.appendChild(tr);
    });
    
    // Tabla compras
    const tbodyC = document.getElementById('tablaC');
    tbodyC.innerHTML = '';
    
    compras.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(c => {
        const esLiquidado = c.estado === 'liquidado';
        const tr = document.createElement('tr');
        tr.className = `border-b border-gray-100 hover:bg-blue-50 transition-colors ${esLiquidado ? 'row-liquidado' : ''}`;
        tr.innerHTML = `
            <td class="py-3 px-3">${c.fecha}</td>
            <td class="text-right py-3 px-3 font-mono font-semibold">${c.cantidad.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono text-orange-600 font-semibold">${c.porcentaje.toFixed(2)}%</td>
            <td class="text-right py-3 px-3 font-mono text-red-600 font-bold">$${c.costoUSD.toFixed(2)}</td>
            <td class="py-3 px-3 text-xs">${c.notas || '-'}</td>
            <td class="text-center py-3 px-3">
                <span class="${esLiquidado ? 'badge-liquidado' : 'badge-pendiente'}">
                    ${esLiquidado ? '✓ Liquidado' : '⏳ Pendiente'}
                </span>
            </td>
            <td class="text-center py-3 px-3">
                ${esLiquidado ? 
                    `<span class="text-green-600 text-xs">${c.fechaLiquidacion}</span>` :
                    `<button onclick="liquidarCompra(${c.id})" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm mr-1 transition-colors">✓ Liquidar</button>`
                }
                <button onclick="eliminarCompra(${c.id})" class="text-red-600 hover:text-red-700 transition-colors text-lg">🗑️</button>
            </td>
        `;
        tbodyC.appendChild(tr);
    });
}

function actualizarTablaRusos() {
    // Solo contar pendientes
    const rusosPendientes = rusos.filter(r => r.estado === 'pendiente');
    const totalGanancia = rusosPendientes.reduce((sum, r) => sum + r.gananciaTotal, 0);
    const totalTuParte = rusosPendientes.reduce((sum, r) => sum + r.tuParte, 0);
    
    document.getElementById('ganTotal').textContent = '$' + totalGanancia.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('tuParte').textContent = '$' + totalTuParte.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('socio').textContent = '$' + totalTuParte.toLocaleString('es-DO', {minimumFractionDigits: 2});
    
    const tbody = document.getElementById('tablaRu');
    tbody.innerHTML = '';
    
    rusos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(r => {
        const esPagado = r.estado === 'pagado';
        const tr = document.createElement('tr');
        tr.className = `border-b border-gray-100 hover:bg-blue-50 transition-colors ${esPagado ? 'row-liquidado' : ''}`;
        tr.innerHTML = `
            <td class="py-3 px-3">${r.fecha}</td>
            <td class="text-right py-3 px-3 font-mono font-semibold">${r.usdt.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono text-amber-600">${r.porcentaje.toFixed(2)}%</td>
            <td class="text-right py-3 px-3 font-mono text-green-600 font-bold">$${r.gananciaTotal.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono text-blue-600 font-semibold">$${r.tuParte.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono text-cyan-600 font-semibold">$${r.parteSocio.toFixed(2)}</td>
            <td class="py-3 px-3 text-xs">${r.notas || '-'}</td>
            <td class="text-center py-3 px-3">
                <span class="${esPagado ? 'badge-liquidado' : 'badge-pendiente'}">
                    ${esPagado ? '✓ Pagado' : '⏳ Pendiente'}
                </span>
            </td>
            <td class="text-center py-3 px-3">
                ${esPagado ? 
                    `<span class="text-green-600 text-xs">${r.fechaPago}</span>` :
                    `<button onclick="pagarSocio(${r.id})" class="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg text-sm mr-1 transition-colors">💰 Pagar</button>`
                }
                <button onclick="eliminarRuso(${r.id})" class="text-red-600 hover:text-red-700 transition-colors text-lg">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function actualizarTablaTransacciones() {
    const tbody = document.getElementById('tablaT');
    tbody.innerHTML = '';
    
    let totalComprado = 0;
    let totalVendido = 0;
    let totalGanancia = 0;
    
    transFiltradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(t => {
        if (t.tipo === 'Compra') totalComprado += t.cantidad;
        else totalVendido += t.cantidad;
        totalGanancia += t.ganancia;
        
        const colorTipo = t.tipo === 'Compra' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
        const colorGanancia = t.ganancia > 0 ? 'text-green-600' : 'text-red-600';
        
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-100 hover:bg-blue-50 transition-colors';
        tr.innerHTML = `
            <td class="py-3 px-3">
                <span class="${colorTipo} px-3 py-1 rounded-full text-xs font-semibold">${t.tipo}</span>
            </td>
            <td class="text-right py-3 px-3 font-mono font-semibold">${t.cantidad.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono ${colorGanancia} font-bold">$${t.ganancia.toFixed(2)}</td>
            <td class="text-center py-3 px-3">${t.fecha}</td>
            <td class="text-center py-3 px-3">
                <button onclick="eliminarTrans(${t.id})" class="text-red-600 hover:text-red-700 transition-colors text-lg">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('compT').textContent = totalComprado.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('vendT').textContent = totalVendido.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('ganT').textContent = '$' + totalGanancia.toLocaleString('es-DO', {minimumFractionDigits: 2});
}

// HISTORIAL
function actualizarHistorial() {
    const historialBetcrisDiv = document.getElementById('historialBetcris');
    const historialRusosDiv = document.getElementById('historialRusos');
    
    // Betcris
    const recogidasLiquidadas = recogidas.filter(r => r.estado === 'liquidado').sort((a, b) => new Date(b.fechaLiquidacion) - new Date(a.fechaLiquidacion));
    const comprasLiquidadas = compras.filter(c => c.estado === 'liquidado').sort((a, b) => new Date(b.fechaLiquidacion) - new Date(a.fechaLiquidacion));
    
    if (recogidasLiquidadas.length === 0 && comprasLiquidadas.length === 0) {
        historialBetcrisDiv.innerHTML = '<p class="text-gray-500 text-center py-8">No hay liquidaciones registradas</p>';
    } else {
        let html = '<div class="space-y-3">';
        
        if (recogidasLiquidadas.length > 0) {
            html += '<h4 class="font-semibold text-blue-700 mb-3 text-sm uppercase tracking-wide">Recogidas Liquidadas</h4>';
            recogidasLiquidadas.forEach(r => {
                html += `
                    <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-sm text-gray-600">📅 ${r.fecha}</span>
                            <span class="badge-liquidado">Liquidado: ${r.fechaLiquidacion}</span>
                        </div>
                        <div class="font-semibold text-gray-800">
                            DOP ${r.dop.toLocaleString('es-DO', {minimumFractionDigits: 2})} → 
                            ${r.usdtLiquidar.toFixed(2)} USDT
                        </div>
                        <div class="text-green-600 font-bold mt-1">Ganancia: $${r.tresPorciento.toFixed(2)}</div>
                    </div>
                `;
            });
        }
        
        if (comprasLiquidadas.length > 0) {
            html += '<h4 class="font-semibold text-blue-700 mb-3 mt-6 text-sm uppercase tracking-wide">Compras Liquidadas</h4>';
            comprasLiquidadas.forEach(c => {
                html += `
                    <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-sm text-gray-600">📅 ${c.fecha}</span>
                            <span class="badge-liquidado">Liquidado: ${c.fechaLiquidacion}</span>
                        </div>
                        <div class="font-semibold text-gray-800">
                            ${c.cantidad.toFixed(2)} USDT (${c.porcentaje}%)
                        </div>
                        <div class="text-red-600 font-bold mt-1">Costo: $${c.costoUSD.toFixed(2)}</div>
                        ${c.notas ? `<div class="text-xs text-gray-600 mt-1">${c.notas}</div>` : ''}
                    </div>
                `;
            });
        }
        
        html += '</div>';
        historialBetcrisDiv.innerHTML = html;
    }
    
    // Rusos
    const rusosPagados = rusos.filter(r => r.estado === 'pagado').sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));
    
    if (rusosPagados.length === 0) {
        historialRusosDiv.innerHTML = '<p class="text-gray-500 text-center py-8">No hay pagos registrados</p>';
    } else {
        let html = '<div class="space-y-3">';
        rusosPagados.forEach(r => {
            html += `
                <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-sm text-gray-600">📅 ${r.fecha}</span>
                        <span class="badge-liquidado">Pagado: ${r.fechaPago}</span>
                    </div>
                    <div class="font-semibold text-gray-800">
                        ${r.usdt.toFixed(2)} USDT (${r.porcentaje}%)
                    </div>
                    <div class="text-purple-600 font-bold mt-1">Ganancia Total: $${r.gananciaTotal.toFixed(2)}</div>
                    <div class="text-amber-600 font-semibold mt-1">Pagado al socio: $${r.parteSocio.toFixed(2)}</div>
                    ${r.notas ? `<div class="text-xs text-gray-600 mt-1">${r.notas}</div>` : ''}
                </div>
            `;
        });
        html += '</div>';
        historialRusosDiv.innerHTML = html;
    }
}

// REPORTES
function cambiarMes(dir) {
    mesReporte.setMonth(mesReporte.getMonth() + dir);
    actualizarReporte();
}

function actualizarReporte() {
    const mesStr = mesReporte.toISOString().substring(0, 7);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('mesActual').textContent = meses[mesReporte.getMonth()] + ' ' + mesReporte.getFullYear();
    
    // Betcris del mes
    const recMes = recogidas.filter(r => r.fecha.startsWith(mesStr));
    const compMes = compras.filter(c => c.fecha.startsWith(mesStr));
    const totalRecogido = recMes.reduce((sum, r) => sum + r.totalUsd, 0);
    const total3Porc = recMes.reduce((sum, r) => sum + r.tresPorciento, 0);
    const totalCosto = compMes.reduce((sum, c) => sum + c.costoUSD, 0);
    const gananciaBetcris = total3Porc - totalCosto;
    
    // Rusos del mes
    const rusosMes = rusos.filter(r => r.fecha.startsWith(mesStr));
    const totalUSDTRusos = rusosMes.reduce((sum, r) => sum + r.usdt, 0);
    const gananciaRusos = rusosMes.reduce((sum, r) => sum + r.tuParte, 0);
    
    // Transacciones del mes
    const transMes = trans.filter(t => t.fecha.startsWith(mesStr));
    const gananciaTrans = transMes.reduce((sum, t) => sum + t.ganancia, 0);
    
    const total = gananciaBetcris + gananciaRusos + gananciaTrans;
    
    document.getElementById('reporteBetcrisGan').textContent = '$' + gananciaBetcris.toFixed(2);
    document.getElementById('reporteBetcrisRec').textContent = 'Recogido: $' + totalRecogido.toFixed(2);
    document.getElementById('reporteRusosGan').textContent = '$' + gananciaRusos.toFixed(2);
    document.getElementById('reporteRusosUSDT').textContent = 'USDT: ' + totalUSDTRusos.toFixed(2);
    document.getElementById('reporteTransGan').textContent = '$' + gananciaTrans.toFixed(2);
    document.getElementById('reporteTransOps').textContent = 'Operaciones: ' + transMes.length;
    document.getElementById('reporteTotal').textContent = '$' + total.toFixed(2);
}

function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const mesStr = mesReporte.toISOString().substring(0, 7);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const titulo = 'Reporte Mensual - ' + meses[mesReporte.getMonth()] + ' ' + mesReporte.getFullYear();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 48, 135);
    doc.text(titulo, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('USDT Tracker Pro', 105, 28, { align: 'center' });
    
    let y = 45;
    
    // Betcris
    const recMes = recogidas.filter(r => r.fecha.startsWith(mesStr));
    const compMes = compras.filter(c => c.fecha.startsWith(mesStr));
    const totalRecogido = recMes.reduce((sum, r) => sum + r.totalUsd, 0);
    const total3Porc = recMes.reduce((sum, r) => sum + r.tresPorciento, 0);
    const totalCosto = compMes.reduce((sum, c) => sum + c.costoUSD, 0);
    const gananciaBetcris = total3Porc - totalCosto;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 48, 135);
    doc.text('💰 BETCRIS', 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Total Recogido: $${totalRecogido.toFixed(2)} USD`, 20, y);
    y += 6;
    doc.text(`3% Cobrado: $${total3Porc.toFixed(2)} USD`, 20, y);
    y += 6;
    doc.text(`Costo Compras: $${totalCosto.toFixed(2)} USD`, 20, y);
    y += 6;
    doc.setTextColor(0, 128, 0);
    doc.text(`Ganancia Neta: $${gananciaBetcris.toFixed(2)} USD`, 20, y);
    y += 15;
    
    if (recMes.length > 0) {
        doc.autoTable({
            startY: y,
            head: [['Fecha', 'DOP', 'USD', 'Total USD', 'USDT', '3%']],
            body: recMes.map(r => [
                r.fecha,
                r.dop.toFixed(2),
                r.usd.toFixed(2),
                r.totalUsd.toFixed(2),
                r.usdtLiquidar.toFixed(2),
                r.tresPorciento.toFixed(2)
            ]),
            theme: 'grid',
            headStyles: { fillColor: [0, 112, 186] }
        });
        y = doc.lastAutoTable.finalY + 10;
    }
    
    // Rusos
    const rusosMes = rusos.filter(r => r.fecha.startsWith(mesStr));
    const totalUSDTRusos = rusosMes.reduce((sum, r) => sum + r.usdt, 0);
    const gananciaRusos = rusosMes.reduce((sum, r) => sum + r.gananciaTotal, 0);
    const tuParteRusos = gananciaRusos / 2;
    
    if (y > 250) {
        doc.addPage();
        y = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 48, 135);
    doc.text('🇷🇺 VENTAS RUSOS', 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`USDT Recibidos: ${totalUSDTRusos.toFixed(2)} USDT`, 20, y);
    y += 6;
    doc.text(`Ganancia Total: $${gananciaRusos.toFixed(2)} USD`, 20, y);
    y += 6;
    doc.setTextColor(0, 112, 186);
    doc.text(`Tu Parte (50%): $${tuParteRusos.toFixed(2)} USD`, 20, y);
    y += 6;
    doc.setTextColor(0, 156, 222);
    doc.text(`Parte Socio (50%): $${tuParteRusos.toFixed(2)} USD`, 20, y);
    y += 15;
    
    if (rusosMes.length > 0) {
        doc.autoTable({
            startY: y,
            head: [['Fecha', 'USDT', '%', 'Ganancia', 'Tu Parte', 'Socio']],
            body: rusosMes.map(r => [
                r.fecha,
                r.usdt.toFixed(2),
                r.porcentaje.toFixed(2) + '%',
                '$' + r.gananciaTotal.toFixed(2),
                '$' + r.tuParte.toFixed(2),
                '$' + r.parteSocio.toFixed(2)
            ]),
            theme: 'grid',
            headStyles: { fillColor: [0, 112, 186] }
        });
        y = doc.lastAutoTable.finalY + 10;
    }
    
    // Transacciones
    const transMes = trans.filter(t => t.fecha.startsWith(mesStr));
    const gananciaTrans = transMes.reduce((sum, t) => sum + t.ganancia, 0);
    
    if (y > 250) {
        doc.addPage();
        y = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 48, 135);
    doc.text('📊 TRANSACCIONES', 20, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Operaciones: ${transMes.length}`, 20, y);
    y += 6;
    doc.setTextColor(0, 128, 0);
    doc.text(`Ganancia: $${gananciaTrans.toFixed(2)} USD`, 20, y);
    y += 15;
    
    if (transMes.length > 0) {
        doc.autoTable({
            startY: y,
            head: [['Fecha', 'Tipo', 'USDT', 'Ganancia']],
            body: transMes.map(t => [
                t.fecha,
                t.tipo,
                t.cantidad.toFixed(2),
                '$' + t.ganancia.toFixed(2)
            ]),
            theme: 'grid',
            headStyles: { fillColor: [0, 112, 186] }
        });
        y = doc.lastAutoTable.finalY + 15;
    }
    
    // Total
    const total = gananciaBetcris + tuParteRusos + gananciaTrans;
    
    if (y > 260) {
        doc.addPage();
        y = 20;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(0, 48, 135);
    doc.text('🎯 GANANCIA TOTAL DEL MES', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(24);
    doc.setTextColor(0, 128, 0);
    doc.text(`${total.toFixed(2)} USD`, 105, y, { align: 'center' });
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString('es-DO')}`, 105, 285, { align: 'center' });
    
    doc.save(`Reporte_${mesStr}.pdf`);
}
