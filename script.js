// Variables globales
let categoryChart = null;
let weeklyChart = null;
let transactions = [];

// Cargar transacciones del LocalStorage al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const stored = localStorage.getItem('transactions');
    if (stored) {
        transactions = JSON.parse(stored);
    }
    
    // Establecer fecha de hoy por defecto
    document.getElementById('date').valueAsDate = new Date();
    
    // Inicializar gráficos
    initCharts();
    
    // Actualizar todas las vistas
    updateAllViews();
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar formulario
    document.getElementById('form').addEventListener('submit', addTransaction);
});

// Configuración de navegación
function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover active de todos
            menuItems.forEach(i => i.classList.remove('active'));
            // Agregar active al actual
            item.classList.add('active');
            
            // Obtener sección
            const sectionId = item.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

// Mostrar sección
function showSection(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Actualizar vista específica si es necesario
        if (sectionId === 'gastos') {
            updateGastosView();
        } else if (sectionId === 'ingresos') {
            updateIngresosView();
        } else if (sectionId === 'inicio') {
            updateAllViews();
        }
    }
}

// Modal functions
function openModal(type = '') {
    const modal = document.getElementById('add-modal');
    modal.style.display = 'block';
    
    if (type === 'expense') {
        document.getElementById('type').value = 'expense';
    } else if (type === 'income') {
        document.getElementById('type').value = 'income';
    }
    
    toggleCategory();
}

function closeModal() {
    document.getElementById('add-modal').style.display = 'none';
    document.getElementById('form').reset();
    document.getElementById('date').valueAsDate = new Date();
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('add-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Mostrar/ocultar categoría según tipo
function toggleCategory() {
    const type = document.getElementById('type').value;
    const categoryGroup = document.getElementById('category-group');
    
    if (type === 'income') {
        categoryGroup.style.display = 'none';
    } else {
        categoryGroup.style.display = 'block';
    }
}

// Agregar transacción
function addTransaction(e) {
    e.preventDefault();
    
    const type = document.getElementById('type').value;
    const text = document.getElementById('text').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    
    if (!text || !amount || !date) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        text: text,
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        category: type === 'expense' ? category : 'ingreso',
        date: date,
        type: type
    };
    
    transactions.push(transaction);
    saveTransactions();
    closeModal();
    updateAllViews();
}

// Eliminar transacción
function removeTransaction(id) {
    if (confirm('¿Estás seguro de eliminar esta transacción?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
        updateAllViews();
    }
}

// Guardar en LocalStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Borrar todos los datos
function clearAllData() {
    if (confirm('⚠️ ¿ESTÁS SEGURO de borrar TODOS los datos? Esta acción no se puede deshacer.')) {
        transactions = [];
        localStorage.removeItem('transactions');
        updateAllViews();
        alert('Todos los datos han sido eliminados');
    }
}

// Actualizar todas las vistas
function updateAllViews() {
    updateSummary();
    updateTransactionsList();
    updateGastosView();
    updateIngresosView();
    updateCharts();
}

// Actualizar resumen (tarjetas)
function updateSummary() {
    const total = transactions.reduce((acc, t) => acc + t.amount, 0);
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expense = Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0));
    
    const balanceEl = document.getElementById('balance');
    const plusEl = document.getElementById('money-plus');
    const minusEl = document.getElementById('money-minus');
    
    if (balanceEl) balanceEl.textContent = `$${total.toFixed(2)} MXN`;
    if (plusEl) plusEl.textContent = `$${income.toFixed(2)} MXN`;
    if (minusEl) minusEl.textContent = `$${expense.toFixed(2)} MXN`;
}

// Actualizar lista de transacciones (inicio)
function updateTransactionsList() {
    const list = document.getElementById('transactions-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (transactions.length === 0) {
        list.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #999;">No hay transacciones registradas</td></tr>';
        return;
    }
    
    // Mostrar últimas 10 transacciones
    const recent = transactions.slice().reverse().slice(0, 10);
    recent.forEach(t => {
        list.appendChild(createTransactionRow(t));
    });
}

// Actualizar vista de gastos
function updateGastosView() {
    const list = document.getElementById('gastos-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const gastos = transactions.filter(t => t.amount < 0);
    
    if (gastos.length === 0) {
        list.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #999;">No hay gastos registrados</td></tr>';
        return;
    }
    
    gastos.reverse().forEach(t => {
        list.appendChild(createTransactionRow(t));
    });
}

// Actualizar vista de ingresos
function updateIngresosView() {
    const list = document.getElementById('ingresos-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    const ingresos = transactions.filter(t => t.amount > 0);
    
    if (ingresos.length === 0) {
        list.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #999;">No hay ingresos registrados</td></tr>';
        return;
    }
    
    ingresos.reverse().forEach(t => {
        const row = createTransactionRow(t, true);
        list.appendChild(row);
    });
}

// Crear fila de transacción
function createTransactionRow(transaction, showCategory = true) {
    const row = document.createElement('tr');
    
    const sign = transaction.amount < 0 ? '-' : '+';
    const amountClass = transaction.amount < 0 ? 'amount-negative' : 'amount-positive';
    const amount = Math.abs(transaction.amount).toFixed(2);
    
    const categoryIcons = {
        'comida': '🍔',
        'transporte': '🚗',
        'vivienda': '🏠',
        'servicios': '💡',
        'ocio': '🎬',
        'salud': '🏥',
        'educacion': '📚',
        'salario': '💰',
        'inversion': '📈',
        'otros': '📦',
        'ingreso': '💵'
    };
    
    const icon = categoryIcons[transaction.category] || '📦';
    const date = formatDate(transaction.date);
    
    if (showCategory) {
        row.innerHTML = `
            <td>${date}</td>
            <td>${transaction.text}</td>
            <td>${icon} ${transaction.category}</td>
            <td class="${amountClass}">${sign}$${amount} MXN</td>
            <td>
                <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    } else {
        row.innerHTML = `
            <td>${date}</td>
            <td>${transaction.text}</td>
            <td class="${amountClass}">${sign}$${amount} MXN</td>
            <td>
                <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    }
    
    return row;
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

// Inicializar gráficos
function initCharts() {
    // Gráfico de categorías
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Comida', 'Transporte', 'Vivienda', 'Servicios', 'Ocio', 'Salud', 'Educación', 'Otros'],
                datasets: [{
                    data: [0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#10b981', '#3b82f6', '#f59e0b', '#ef4444', 
                        '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico semanal
    const weeklyCtx = document.getElementById('weeklyChart');
    if (weeklyCtx) {
        weeklyChart = new Chart(weeklyCtx, {
            type: 'bar',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Gastos',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: '#10b981',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}

// Actualizar gráficos
function updateCharts() {
    if (!categoryChart || !weeklyChart) return;
    
    // Calcular gastos por categoría
    const categoryTotals = {
        'comida': 0, 'transporte': 0, 'vivienda': 0, 'servicios': 0,
        'ocio': 0, 'salud': 0, 'educacion': 0, 'otros': 0
    };
    
    transactions.forEach(t => {
        if (t.amount < 0 && t.category && categoryTotals.hasOwnProperty(t.category)) {
            categoryTotals[t.category] += Math.abs(t.amount);
        }
    });
    
    categoryChart.data.datasets[0].data = Object.values(categoryTotals);
    categoryChart.update();
    
    // Calcular gastos por día de la semana
    const weeklyTotals = [0, 0, 0, 0, 0, 0, 0];
    
    transactions.forEach(t => {
        if (t.amount < 0 && t.date) {
            const date = new Date(t.date);
            let dayIndex = date.getDay() - 1;
            if (dayIndex < 0) dayIndex = 6; // Domingo
            weeklyTotals[dayIndex] += Math.abs(t.amount);
        }
    });
    
    weeklyChart.data.datasets[0].data = weeklyTotals;
    weeklyChart.update();
}
