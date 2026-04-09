// Elementos del DOM
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const transactionsList = document.getElementById('transactions-list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const type = document.getElementById('type');
const category = document.getElementById('category');
const date = document.getElementById('date');

// Variables para gráficos
let categoryChart = null;
let weeklyChart = null;

// Obtener transacciones del LocalStorage
const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

// Inicializar fecha de hoy
date.valueAsDate = new Date();

// ============================================
// NUEVO: Navegación del menú
// ============================================
const menuItems = document.querySelectorAll('.menu-item');
const mainContent = document.querySelector('.main-content');

menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remover clase active de todos
        menuItems.forEach(i => i.classList.remove('active'));
        // Agregar clase active al actual
        item.classList.add('active');
        
        // Obtener la sección
        const section = item.querySelector('span').innerText;
        
        // Mostrar contenido según la sección
        showSection(section);
    });
});

function showSection(sectionName) {
    // Ocultar todo el contenido actual
    const content = document.querySelector('.main-content');
    
    switch(sectionName) {
        case 'Inicio':
            content.innerHTML = `
                <header class="header">
                    <h1>Resumen Mensual</h1>
                    <div class="header-actions">
                        <select id="month-selector">
                            <option value="1">Enero</option>
                            <option value="2">Febrero</option>
                            <option value="3">Marzo</option>
                            <option value="4">Abril</option>
                            <option value="5">Mayo</option>
                            <option value="6">Junio</option>
                            <option value="7">Julio</option>
                            <option value="8">Agosto</option>
                            <option value="9">Septiembre</option>
                            <option value="10" selected>Octubre</option>
                            <option value="11">Noviembre</option>
                            <option value="12">Diciembre</option>
                        </select>
                        <button class="btn-add" onclick="document.getElementById('add-modal').style.display='block'">
                            <i class="fas fa-plus"></i> Nueva Transacción
                        </button>
                    </div>
                </header>
                <div class="summary-cards">
                    <div class="card income">
                        <div class="card-icon"><i class="fas fa-arrow-up"></i></div>
                        <div class="card-info">
                            <h4>Ingresos</h4>
                            <p id="money-plus">$0.00 MXN</p>
                        </div>
                    </div>
                    <div class="card expense">
                        <div class="card-icon"><i class="fas fa-arrow-down"></i></div>
                        <div class="card-info">
                            <h4>Gastos</h4>
                            <p id="money-minus">$0.00 MXN</p>
                        </div>
                    </div>
                    <div class="card balance">
                        <div class="card-icon"><i class="fas fa-wallet"></i></div>
                        <div class="card-info">
                            <h4>Balance</h4>
                            <p id="balance">$0.00 MXN</p>
                        </div>
                    </div>
                </div>
                <div class="charts-container">
                    <div class="chart-box">
                        <h3>Gastos por Categoría</h3>
                        <canvas id="categoryChart"></canvas>
                    </div>
                    <div class="chart-box">
                        <h3>Gasto Semanal</h3>
                        <canvas id="weeklyChart"></canvas>
                    </div>
                </div>
                <div class="transactions-section">
                    <h3>Transacciones Recientes</h3>
                    <div class="table-container">
                        <table class="transactions-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Concepto</th>
                                    <th>Categoría</th>
                                    <th>Monto</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody id="transactions-list"></tbody>
                        </table>
                    </div>
                </div>
            `;
            // Re-inicializar elementos
            setTimeout(() => {
                init();
            }, 100);
            break;
            
        case 'Gastos':
            content.innerHTML = `
                <header class="header">
                    <h1>Mis Gastos</h1>
                    <button class="btn-add" onclick="document.getElementById('add-modal').style.display='block'">
                        <i class="fas fa-plus"></i> Nuevo Gasto
                    </button>
                </header>
                <div class="transactions-section">
                    <div class="table-container">
                        <table class="transactions-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Concepto</th>
                                    <th>Categoría</th>
                                    <th>Monto</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody id="transactions-list"></tbody>
                        </table>
                    </div>
                </div>
            `;
            setTimeout(() => {
                showOnlyExpenses();
            }, 100);
            break;
            
        case 'Ingresos':
            content.innerHTML = `
                <header class="header">
                    <h1>Mis Ingresos</h1>
                    <button class="btn-add" onclick="document.getElementById('add-modal').style.display='block'">
                        <i class="fas fa-plus"></i> Nuevo Ingreso
                    </button>
                </header>
                <div class="transactions-section">
                    <div class="table-container">
                        <table class="transactions-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Concepto</th>
                                    <th>Monto</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody id="transactions-list"></tbody>
                        </table>
                    </div>
                </div>
            `;
            setTimeout(() => {
                showOnlyIncome();
            }, 100);
            break;
            
        case 'Presupuestos':
        case 'Informes':
        case 'Configuración':
            content.innerHTML = `
                <header class="header">
                    <h1>${sectionName}</h1>
                </header>
                <div class="transactions-section">
                    <div style="text-align: center; padding: 50px;">
                        <i class="fas fa-tools" style="font-size: 60px; color: #ccc; margin-bottom: 20px;"></i>
                        <h2 style="color: #666;">Próximamente</h2>
                        <p style="color: #999;">Esta función estará disponible en la próxima actualización</p>
                    </div>
                </div>
            `;
            break;
    }
}

// ============================================
// Funciones para filtrar transacciones
// ============================================
function showOnlyExpenses() {
    const list = document.getElementById('transactions-list');
    if (!list) return;
    
    list.innerHTML = '';
    const expenses = transactions.filter(t => t.amount < 0);
    
    if (expenses.length === 0) {
        list.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay gastos registrados</td></tr>';
        return;
    }
    
    expenses.forEach(addTransactionDOM);
}

function showOnlyIncome() {
    const list = document.getElementById('transactions-list');
    if (!list) return;
    
    list.innerHTML = '';
    const income = transactions.filter(t => t.amount > 0);
    
    if (income.length === 0) {
        list.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay ingresos registrados</td></tr>';
        return;
    }
    
    income.forEach(addTransactionDOM);
}

// ============================================
// Función para agregar transacción
// ============================================
function addTransaction(e) {
    e.preventDefault();

    if (text.value.trim() === '' || amount.value.trim() === '') {
        alert('Por favor agrega un concepto y un monto');
        return;
    }

    const transactionAmount = type.value === 'expense' ? -Math.abs(amount.value) : Math.abs(amount.value);

    const transaction = {
        id: generateID(),
        text: text.value,
        amount: transactionAmount,
        category: category.value,
        date: date.value,
        type: type.value
    };

    transactions.push(transaction);
    updateLocalStorage();
    
    // Limpiar formulario
    text.value = '';
    amount.value = '';
    document.getElementById('add-modal').style.display = 'none';
    
    // Recargar la vista actual
    const activeMenu = document.querySelector('.menu-item.active span');
    if (activeMenu) {
        showSection(activeMenu.innerText);
    }
}

// Generar ID aleatorio
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Agregar transacciones al DOM
function addTransactionDOM(transaction) {
    const item = document.createElement('tr');
    
    const sign = transaction.amount < 0 ? '-' : '+';
    const amountClass = transaction.amount < 0 ? 'amount-negative' : 'amount-positive';
    
    const categoryIcons = {
        'comida': '🍔',
        'transporte': '🚗',
        'vivienda': '🏠',
        'servicios': '💡',
        'ocio': '🎬',
        'salud': '🏥',
        'educacion': '📚',
        'otros': '📦'
    };

    item.innerHTML = `
        <td>${formatDate(transaction.date)}</td>
        <td>${transaction.text}</td>
        <td>${categoryIcons[transaction.category] || ''} ${transaction.category}</td>
        <td class="${amountClass}">${sign}$${Math.abs(transaction.amount).toFixed(2)} MXN</td>
        <td>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        </td>
    `;

    const list = document.getElementById('transactions-list');
    if (list) {
        list.appendChild(item);
    }
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('es-ES', options);
}

// Actualizar balance, ingresos y gastos
function updateValues() {
    const amounts = transactions.map(transaction => transaction.amount);

    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
    const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);

    const balanceEl = document.getElementById('balance');
    const moneyPlusEl = document.getElementById('money-plus');
    const moneyMinusEl = document.getElementById('money-minus');

    if (balanceEl) balanceEl.innerText = `$${total} MXN`;
    if (moneyPlusEl) moneyPlusEl.innerText = `$${income} MXN`;
    if (moneyMinusEl) moneyMinusEl.innerText = `$${expense} MXN`;
}

// Eliminar transacción
function removeTransaction(id) {
    if (confirm('¿Estás seguro de eliminar esta transacción?')) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        updateLocalStorage();
        
        // Recargar la vista actual
        const activeMenu = document.querySelector('.menu-item.active span');
        if (activeMenu) {
            showSection(activeMenu.innerText);
        }
    }
}

// Actualizar Local Storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Inicializar gráficos
function initCharts() {
    const categoryCtx = document.getElementById('categoryChart');
    const weeklyCtx = document.getElementById('weeklyChart');
    
    if (!categoryCtx || !weeklyCtx) return;

    categoryChart = new Chart(categoryCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Comida', 'Transporte', 'Vivienda', 'Servicios', 'Ocio', 'Salud', 'Educación', 'Otros'],
            datasets: [{
                data: [0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', 
                    '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    weeklyChart = new Chart(weeklyCtx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Gastos',
                data: [0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#10b981',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Actualizar gráficos con datos reales
function updateCharts() {
    if (!categoryChart || !weeklyChart) return;

    const categoryTotals = {
        'comida': 0, 'transporte': 0, 'vivienda': 0, 'servicios': 0,
        'ocio': 0, 'salud': 0, 'educacion': 0, 'otros': 0
    };

    transactions.forEach(t => {
        if (t.amount < 0 && t.category) {
            categoryTotals[t.category] += Math.abs(t.amount);
        }
    });

    categoryChart.data.datasets[0].data = Object.values(categoryTotals);
    categoryChart.update();

    const weeklyTotals = [0, 0, 0, 0, 0, 0, 0];
    
    transactions.forEach(t => {
        if (t.amount < 0 && t.date) {
            const day = new Date(t.date).getDay();
            const dayIndex = day === 0 ? 6 : day - 1;
            weeklyTotals[dayIndex] += Math.abs(t.amount);
        }
    });

    weeklyChart.data.datasets[0].data = weeklyTotals;
    weeklyChart.update();
}

// Inicializar app
function init() {
    updateValues();
    updateCharts();
    
    const list = document.getElementById('transactions-list');
    if (list) {
        list.innerHTML = '';
        if (transactions.length === 0) {
            list.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay transacciones registradas</td></tr>';
        } else {
            transactions.forEach(addTransactionDOM);
        }
    }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    init();
});
