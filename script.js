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

// Función para agregar transacción
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
    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();
    updateCharts();

    // Limpiar formulario
    text.value = '';
    amount.value = '';
    document.getElementById('add-modal').style.display = 'none';
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
    
    // Icono de categoría
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

    transactionsList.appendChild(item);
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

    balance.innerText = `$${total} MXN`;
    money_plus.innerText = `$${income} MXN`;
    money_minus.innerText = `$${expense} MXN`;
}

// Eliminar transacción
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    init();
}

// Actualizar Local Storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Inicializar gráficos
function initCharts() {
    // Gráfico de Dona - Categorías
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
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
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Gráfico de Barras - Semanal
    const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
    weeklyChart = new Chart(weeklyCtx, {
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
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Actualizar gráficos con datos reales
function updateCharts() {
    if (!categoryChart || !weeklyChart) return;

    // Calcular gastos por categoría
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

    // Calcular gastos por día de la semana
    const weeklyTotals = [0, 0, 0, 0, 0, 0, 0];
    
    transactions.forEach(t => {
        if (t.amount < 0 && t.date) {
            const day = new Date(t.date).getDay();
            const dayIndex = day === 0 ? 6 : day - 1; // Convertir domingo (0) a índice 6
            weeklyTotals[dayIndex] += Math.abs(t.amount);
        }
    });

    weeklyChart.data.datasets[0].data = weeklyTotals;
    weeklyChart.update();
}

// Inicializar app
function init() {
    transactionsList.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
    updateCharts();
}

// Event Listeners
form.addEventListener('submit', addTransaction);

// Inicializar
initCharts();
init();
