// Variables globales
let recogidas = JSON.parse(localStorage.getItem('recogidasBetcris') || '[]');
let compras = JSON.parse(localStorage.getItem('comprasBetcris') || '[]');
let rusos = JSON.parse(localStorage.getItem('ventasRusos') || '[]');
let trans = JSON.parse(localStorage.getItem('transaccionesUSDT') || '[]');
let transFiltradas = [...trans];
let mesReporte = new Date();

window.onload = function() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaR').value = hoy;
    document.getElementById('fechaC').value = hoy;
    document.getElementById('fechaRu').value = hoy;
    document.getElementById('fechaT').value = hoy;
    actualizar();
    actualizarReporte();
};

function cambiarTab(tab) {
    ['tabBetcris', 'tabRusos', 'tabTransacciones', 'tabReportes', 'tabGraficas'].forEach(id => {
        document.getElementById(id).className = 'tab-inactive px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer';
    });
    
    ['seccionBetcris', 'seccionRusos', 'seccionTransacciones', 'seccionReportes', 'seccionGraficas'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    
    const tabId = 'tab' + tab.charAt(0).toUpperCase() + tab.slice(1);
    const seccionId = 'seccion' + tab.charAt(0).toUpperCase() + tab.slice(1);
    
    document.getElementById(tabId).className = 'tab-active px-6 py-3 rounded-xl font-semibold transition-all cursor-pointer';
    document.getElementById(seccionId).classList.remove('hidden');
    
    if (tab === 'graficas') actualizarGraficas();
    if (tab === 'reportes') actualizarReporte();
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
        tresPorciento: tresPorciento
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
        notas: n
    });
    
    localStorage.setItem('comprasBetcris', JSON.stringify(compras));
    document.getElementById('cantC').value = '';
    document.getElementById('porcC').value = '';
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
    let totalTresPorciento = 0;
    let totalCostoCompras = 0;
    
    const tbodyR = document.getElementById('tablaR');
    tbodyR.innerHTML = '';
    
    recogidas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(r => {
        totalLiquidar += r.usdtLiquidar;
        totalTresPorciento += r.tresPorciento;
        
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-100 hover:bg-blue-50 transition-colors';
        tr.innerHTML = `
            <td class="py-3 px-3">${r.fecha}</td>
            <td class="text-right py-3 px-3 font-mono">${r.dop.toLocaleString('es-DO', {minimumFractionDigits: 2})}</td>
            <td class="text-right py-3 px-3 font-mono">${r.usd.toLocaleString('es-DO', {minimumFractionDigits: 2})}</td>
            <td class="text-right py-3 px-3 font-mono">${r.tasa > 0 ? r.tasa.toFixed(2) : '-'}</td>
            <td class="text-right py-3 px-3 font-mono text-green-600 font-semibold">$${r.totalUsd.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono text-blue-600 font-bold">${r.usdtLiquidar.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono text-emerald-600 font-bold">$${r.tresPorciento.toFixed(2)}</td>
            <td class="text-center py-3 px-3">
                <button onclick="eliminarRecogida(${r.id})" class="text-red-600 hover:text-red-700 transition-colors">🗑️</button>
            </td>
        `;
        tbodyR.appendChild(tr);
    });
    
    const tbodyC = document.getElementById('tablaC');
    tbodyC.innerHTML = '';
    
    compras.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).forEach(c => {
        totalComprado += c.cantidad;
        totalCostoCompras += c.costoUSD;
        
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-100 hover:bg-blue-50 transition-colors';
        tr.innerHTML = `
            <td class="py-3 px-3">${c.fecha}</td>
            <td class="text-right py-3 px-3 font-mono font-semibold">${c.cantidad.toFixed(2)}</td>
            <td class="text-right py-3 px-3 font-mono text-orange-600 font-semibold">${c.porcentaje.toFixed(2)}%</td>
            <td class="text-right py-3 px-3 font-mono text-red-600 font-bold">$${c.costoUSD.toFixed(2)}</td>
            <td class="py-3 px-3 text-xs">${c.notas || '-'}</td>
            <td class="text-center py-3 px-3">
                <button onclick="eliminarCompra(${c.id})" class="text-red-600 hover:text-red-700 transition-colors">🗑️</button>
            </td>
        `;
        tbodyC.appendChild(tr);
    });
    
    const gananciaBetcris = totalTresPorciento - totalCostoCompras;
    
    document.getElementById('totalLiquidar').textContent = totalLiquidar.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('totalCompradosB').textContent = totalComprado.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('gananciaBetcris').textContent = '$' + gananciaBetcris.toLocaleString('es-DO', {minimumFractionDigits: 2});
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
                <button onclick="eliminarTrans(${t.id})" class="text-red-600 hover:text-red-700 transition-colors">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('compT').textContent = totalComprado.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('vendT').textContent = totalVendido.toLocaleString('es-DO', {minimumFractionDigits: 2});
    document.getElementById('ganT').textContent = '$' + totalGanancia.toLocaleString('es-DO', {minimumFractionDigits: 2});
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

// GRÁFICAS
function actualizarGraficas() {
    // Ganancias por mes
    const meses = {};
    
    recogidas.forEach(r => {
        const mes = r.fecha.substring(0, 7);
        if (!meses[mes]) meses[mes] = { betcris: 0, rusos: 0, trans: 0 };
    });
    
    compras.forEach(c => {
        const mes = c.fecha.substring(0, 7);
        if (!meses[mes]) meses[mes] = { betcris: 0, rusos: 0, trans: 0 };
    });
    
    recogidas.forEach(r => {
        const mes = r.fecha.substring(0, 7);
        meses[mes].betcris += r.tresPorciento;
    });
    
    compras.forEach(c => {
        const mes = c.fecha.substring(0, 7);
        meses[mes].betcris -= c.costoUSD;
    });
    
    rusos.forEach(r => {
        const mes = r.fecha.substring(0, 7);
        if (!meses[mes]) meses[mes] = { betcris: 0, rusos: 0, trans: 0 };
        meses[mes].rusos += r.tuParte;
    });
    
    trans.forEach(t => {
        const mes = t.fecha.substring(0, 7);
        if (!meses[mes]) meses[mes] = { betcris: 0, rusos: 0, trans: 0 };
        meses[mes].trans += t.ganancia;
    });
    
    const labels = Object.keys(meses).sort();
    
    const ctxGan = document.getElementById('graficoGanancias');
    if (window.chartGan) window.chartGan.destroy();
    window.chartGan = new Chart(ctxGan, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Betcris',
                    data: labels.map(m => meses[m].betcris),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Rusos',
                    data: labels.map(m => meses[m].rusos),
                    borderColor: '#a855f7',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Transacciones',
                    data: labels.map(m => meses[m].trans),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
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
    
    // Fuentes de ganancia
    const totalBetcris = recogidas.reduce((s, r) => s + r.tresPorciento, 0) - compras.reduce((s, c) => s + c.costoUSD, 0);
    const totalRusos = rusos.reduce((s, r) => s + r.tuParte, 0);
    const totalTrans = trans.reduce((s, t) => s + t.ganancia, 0);
    
    const ctxFuentes = document.getElementById('graficoFuentes');
    if (window.chartFuentes) window.chartFuentes.destroy();
    window.chartFuentes = new Chart(ctxFuentes, {
        type: 'doughnut',
        data: {
            labels: ['Betcris', 'Rusos', 'Transacciones'],
            datasets: [{
                data: [totalBetcris, totalRusos, totalTrans],
                backgroundColor: ['#f59e0b', '#a855f7', '#10b981'],
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
    
    // Evolución
    const ctxEvol = document.getElementById('graficoEvolucion');
    if (window.chartEvol) window.chartEvol.destroy();
    window.chartEvol = new Chart(ctxEvol, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ganancia Total',
                data: labels.map(m => meses[m].betcris + meses[m].rusos + meses[m].trans),
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
