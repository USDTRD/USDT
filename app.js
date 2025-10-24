// Variables globales
let recogidas = JSON.parse(localStorage.getItem('recogidasBetcris') || '[]');
let compras = JSON.parse(localStorage.getItem('comprasBetcris') || '[]');
let rusos = JSON.parse(localStorage.getItem('ventasRusos') || '[]');
let trans = JSON.parse(localStorage.getItem('transaccionesUSDT') || '[]');
let transFiltradas = [...trans];

// Inicialización
window.onload = function() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaR').value = hoy;
    document.getElementById('fechaC').value = hoy;
    document.getElementById('fechaRu').value = hoy;
    document.getElementById('fechaT').value = hoy;
    actualizar();
};

// Cambiar tabs
function cambiarTab(tab) {
    ['tabBetcris', 'tabRusos', 'tabTransacciones', 'tabGraficas'].forEach(id => {
        document.getElementById(id).className = 'tab-inactive px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer';
    });
    
    ['seccionBetcris', 'seccionRusos', 'seccionTransacciones', 'seccionGraficas'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    
    const tabId = 'tab' + tab.charAt(0).toUpperCase() + tab.slice(1);
    const seccionId = 'seccion' + tab.charAt(0).toUpperCase() + tab.slice(1);
    
    document.getElementById(tabId).className = 'tab-active px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer';
    document.getElementById(seccionId).classList.remove('hidden');
    
    if (tab === 'graficas') {
        actualizarGraficas();
    }
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
    
    recogidas.push({
        id: Date.now(),
        fecha: f,
        dop: d,
        usd: u,
        tasa: t,
        dopAUsd: dopAUsd,
        totalUsd: totalUsd,
        usdtLiquidar: usdtLiquidar
    });
    
    localStorage.setItem('recogidasBetcris', JSON.stringify(recogidas));
    
    document.getElementById('dop').value = '';
    document.getElementById('usd').value = '';
    document.getElementById('tasa').value = '';
    
    actualizar();
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
    const p = parseFloat(document.getElementById('precioC').value);
    const dv = document.getElementById('divisaC').value;
    const n = document.getElementById('notasC').value;
    
    if (!f || !c || !p) {
        alert('Completa fecha, cantidad y precio');
        return;
    }
    
    compras.push({
        id: Date.now(),
        fecha: f,
        cantidad: c,
        precio: p,
        divisa: dv,
        total: c * p,
        notas: n
    });
    
    localStorage.setItem('comprasBetcris', JSON.stringify(compras));
    
    document.getElementById('cantC').value = '';
    document.getElementById('precioC').value = '';
    document.getElementById('notasC').value = '';
    
    actualizar();
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
        notas: n
    });
    
    localStorage.setItem('ventasRusos', JSON.stringify(rusos));
    
    document.getElementById('usdtRu').value = '';
    document.getElementById('porcRu').value = '';
    document.getElementById('notasRu').value = '';
    
    actualizar();
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
}

function actualizarTablaBetcris() {
    let totalLiquidar = 0;
    let totalComprado = 0;
    
    // Tabla Recogidas
    const tbodyR = document.getElementById('tablaR');
    tbodyR.innerHTML = '';
    
    recogidas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(r => {
        totalLiquidar += r.usdtLiquidar;
        
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-100 hover:bg-blue-50 transition-colors';
        tr.innerHTML = `
            <td class="py-3 px-3">${r.fecha}</td>
            <td class="text-right py-3 px-3 font-mono">${r.dop.toLocaleString('es-DO', {minimumFractionDigits: 2})}</td>
            <td class="text-right py-3 px-3 font-mono">${r.usd.toLocaleString('es-DO', {minimumFractionDigits: 2})}</td>
            <td class="text-right py-3 px-3 font-mono">${r.tasa > 0 ? r.tasa.toFixed(2) : '-'}</td>
            <td class="text-right py-3 px-3 font-mono text-green-600 font-semibold">${r.totalUsd.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono text-blue-600 font-bold">${r.usdtLiquidar.toFixed(2)}</td>
            <td class="text-center py-3 px-3">
                <button onclick="eliminarRecogida(${r.id})" class="text-red-600 hover:text-red-700 transition-colors">🗑️</button>
            </td>
        `;
        tbodyR.appendChild(tr);
    });
    
    // Tabla Compras
    const tbodyC = document.getElementById('tablaC');
    tbodyC.innerHTML = '';
    
    compras.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(c => {
        totalComprado += c.cantidad;
        
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-100 hover:bg-blue-50 transition-colors';
        tr.innerHTML = `
            <td class="py-3 px-3">${c.fecha}</td>
            <td class="text-right py-3 px-3 font-mono font-semibold">${c.cantidad.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono">${c.precio.toFixed(2)}</td>
            <td class="text-center py-3 px-3"><span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">${c.divisa}</span></td>
            <td class="text-right py-3 px-3 font-mono text-green-600 font-semibold">${c.total.toLocaleString('es-DO', {minimumFractionDigits: 2})}</td>
            <td class="py-3 px-3 text-xs">${c.notas || '-'}</td>
            <td class="text-center py-3 px-3">
                <button onclick="eliminarCompra(${c.id})" class="text-red-600 hover:text-red-700 transition-colors">🗑️</button>
            </td>
        `;
        tbodyC.appendChild(tr);
    });
    
    document.getElementById('totalLiquidar').textContent = totalLiquidar.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('totalCompradosB').textContent = totalComprado.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('pendiente').textContent = (totalLiquidar - totalComprado).toLocaleString('es-DO', {minimumFractionDigits: 2});
}

function actualizarTablaRusos() {
    const tbody = document.getElementById('tablaRu');
    tbody.innerHTML = '';
    
    let totalGanancia = 0;
    let totalTuParte = 0;
    
    rusos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(r => {
        totalGanancia += r.gananciaTotal;
        totalTuParte += r.tuParte;
        
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-100 hover:bg-blue-50 transition-colors';
        tr.innerHTML = `
            <td class="py-3 px-3">${r.fecha}</td>
            <td class="text-right py-3 px-3 font-mono font-semibold">${r.usdt.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono text-amber-600">${r.porcentaje.toFixed(2)}%</td>
            <td class="text-right py-3 px-3 font-mono text-green-600 font-bold">$${r.gananciaTotal.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono text-blue-600 font-semibold">$${r.tuParte.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono text-cyan-600 font-semibold">$${r.parteSocio.toFixed(2)}</td>
            <td class="py-3 px-3 text-xs">${r.notas || '-'}</td>
            <td class="text-center py-3 px-3">
                <button onclick="eliminarRuso(${r.id})" class="text-red-600 hover:text-red-700 transition-colors">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('ganTotal').textContent = '$' + totalGanancia.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('tuParte').textContent = '$' + totalTuParte.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('socio').textContent = '$' + totalTuParte.toLocaleString('es-DO', {minimumFractionDigits: 2});
}

function actualizarTablaTransacciones() {
    const tbody = document.getElementById('tablaT');
    tbody.innerHTML = '';
    
    let totalComprado = 0;
    let totalVendido = 0;
    
    transFiltradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(t => {
        if (t.tipo === 'Compra') totalComprado += t.cantidad;
        else totalVendido += t.cantidad;
        
        const colorTipo = t.tipo === 'Compra' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
        const colorGanancia = t.ganancia > 0 ? 'text-green-600' : 'text-red-600';
        
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-100 hover:bg-blue-50 transition-colors';
        tr.innerHTML = `
            <td class="py-3 px-3">
                <span class="${colorTipo} px-3 py-1 rounded-full text-xs font-semibold">${t.tipo}</span>
            </td>
            <td class="text-right py-3 px-3 font-mono font-semibold">${t.cantidad.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono ${colorGanancia} font-bold">${t.ganancia.toFixed(2)}</td>
            <td class="text-center py-3 px-3">${t.fecha}</td>
            <td class="text-center py-3 px-3">
                <button onclick="eliminarTrans(${t.id})" class="text-red-600 hover:text-red-700 transition-colors">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('compT').textContent = totalComprado.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('vendT').textContent = totalVendido.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('balT').textContent = (totalComprado - totalVendido).toLocaleString('es-DO', {minimumFractionDigits: 2});
}

// GRÁFICAS
function actualizarGraficas() {
    // Gráfico Ganancias por Mes
    const meses = {};
    trans.forEach(t => {
        const mes = t.fecha.substring(0, 7);
        meses[mes] = (meses[mes] || 0) + t.ganancia;
    });
    
    const ctxGan = document.getElementById('graficoGanancias');
    if (window.chartGan) window.chartGan.destroy();
    window.chartGan = new Chart(ctxGan, {
        type: 'line',
        data: {
            labels: Object.keys(meses).sort(),
            datasets: [{
                label: 'Ganancias',
                data: Object.keys(meses).sort().map(m => meses[m]),
                borderColor: '#0070ba',
                backgroundColor: 'rgba(0, 112, 186, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#1e3a8a', font: { weight: 'bold' } } }
            },
            scales: {
                y: {
                    ticks: { color: '#1e3a8a' },
                    grid: { color: 'rgba(0, 48, 135, 0.1)' }
                },
                x: {
                    ticks: { color: '#1e3a8a' },
                    grid: { color: 'rgba(0, 48, 135, 0.1)' }
                }
            }
        }
    });
    
    // Gráfico Compras vs Ventas
    const compras = trans.filter(t => t.tipo === 'Compra').reduce((sum, t) => sum + t.cantidad, 0);
    const ventas = trans.filter(t => t.tipo === 'Venta').reduce((sum, t) => sum + t.cantidad, 0);
    
    const ctxCV = document.getElementById('graficoComprasVentas');
    if (window.chartCV) window.chartCV.destroy();
    window.chartCV = new Chart(ctxCV, {
        type: 'doughnut',
        data: {
            labels: ['Compras', 'Ventas'],
            datasets: [{
                data: [compras, ventas],
                backgroundColor: ['#0070ba', '#009cde'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#1e3a8a', font: { weight: 'bold' } } }
            }
        }
    });
    
    // Gráfico Volumen
    const volDOP = 0;
    const volUSD = trans.reduce((sum, t) => sum + t.cantidad, 0);
    
    const ctxVol = document.getElementById('graficoVolumen');
    if (window.chartVol) window.chartVol.destroy();
    window.chartVol = new Chart(ctxVol, {
        type: 'bar',
        data: {
            labels: ['Total USDT'],
            datasets: [{
                label: 'Volumen',
                data: [volUSD],
                backgroundColor: '#0070ba',
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#1e3a8a', font: { weight: 'bold' } } }
            },
            scales: {
                y: {
                    ticks: { color: '#1e3a8a' },
                    grid: { color: 'rgba(0, 48, 135, 0.1)' }
                },
                x: {
                    ticks: { color: '#1e3a8a' },
                    grid: { color: 'rgba(0, 48, 135, 0.1)' }
                }
            }
        }
    });
}
