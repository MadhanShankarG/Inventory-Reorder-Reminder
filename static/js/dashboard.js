// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI elements
    initializeSidebar();
    initializeUserDropdown();
    updateDateTime();
    
    // Load dashboard data
    loadDashboardData();
    
    // Set up interval to refresh data
    setInterval(updateDateTime, 60000); // Update time every minute
    setInterval(loadDashboardData, 300000); // Refresh dashboard data every 5 minutes
});

// ======== UI FUNCTIONALITY ========

// Sidebar toggle functionality
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleBtn = document.getElementById('toggleSidebar');
    
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        
        // Change toggle icon based on sidebar state
        if (sidebar.classList.contains('collapsed')) {
            toggleBtn.innerHTML = '<i class="fas fa-angle-double-right"></i>';
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-angle-double-left"></i>';
        }
    });
}

// User dropdown functionality
function initializeUserDropdown() {
    const userProfile = document.getElementById('userProfile');
    const userDropdown = document.getElementById('userDropdown');
    
    userProfile.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        if (userDropdown.classList.contains('show')) {
            userDropdown.classList.remove('show');
        }
    });
}

// Update date and time display
function updateDateTime() {
    const dateTimeElement = document.getElementById('dateTime');
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateTimeElement.textContent = now.toLocaleDateString('en-IN', options);
}

// ======== DATA LOADING & UPDATES ========

// Load all dashboard data
function loadDashboardData() {
    // In a real application, these would be API calls
    loadSalesData();
    loadInventoryData();
    loadAlertData();
    updateNotifications();
}

// Load sales and revenue data
function loadSalesData() {
    // Simulate API call to get sales data
    fetchData('/api/sales')
        .then(data => {
            updateSalesStats(data.salesStats);
            updateRecentSales(data.recentSales);
        })
        .catch(error => {
            console.error('Error loading sales data:', error);
            // Load mock data for demonstration
            const mockSalesStats = {
                totalSales: 256,
                salesChange: 12.5,
                totalRevenue: 352450,
                revenueChange: 8.3
            };
            
            const mockRecentSales = [
                { name: 'UltraTech Cement (50kg)', quantity: 20, amount: 12000, date: '2025-03-22' },
                { name: 'ACC Cement (50kg)', quantity: 15, amount: 8625, date: '2025-03-21' },
                { name: 'Ambuja Cement (50kg)', quantity: 25, amount: 13750, date: '2025-03-21' },
                { name: 'Steel Bars (10mm)', quantity: 50, amount: 29500, date: '2025-03-20' },
                { name: 'Fine Sand (1 ton)', quantity: 3, amount: 9000, date: '2025-03-20' }
            ];
            
            updateSalesStats(mockSalesStats);
            updateRecentSales(mockRecentSales);
        });
}

// Load inventory data
function loadInventoryData() {
    // Simulate API call to get inventory data
    fetchData('/api/inventory')
        .then(data => {
            updateInventoryChart(data.inventoryItems);
            updateInventoryStatus(data.inventoryCategories);
        })
        .catch(error => {
            console.error('Error loading inventory data:', error);
            // Load mock data for demonstration
            const mockInventoryItems = [
                { name: 'UltraTech', category: 'Cement', stock: 85, maxStock: 100 },
                { name: 'ACC', category: 'Cement', stock: 64, maxStock: 100 },
                { name: 'Ambuja', category: 'Cement', stock: 92, maxStock: 100 },
                { name: 'Steel Bars', category: 'Steel', stock: 45, maxStock: 100 },
                { name: 'Wire Mesh', category: 'Steel', stock: 23, maxStock: 100 },
                { name: 'Fine Sand', category: 'Sand', stock: 18, maxStock: 100 },
                { name: 'Coarse Sand', category: 'Sand', stock: 5, maxStock: 100 }
            ];
            
            const mockInventoryCategories = [
                { name: 'Cement', items: 3, value: 185000 },
                { name: 'Steel', items: 2, value: 125000 },
                { name: 'Sand', items: 2, value: 35000 },
                { name: 'Bricks', items: 3, value: 48000 },
                { name: 'Tools', items: 5, value: 32500 }
            ];
            
            updateInventoryChart(mockInventoryItems);
            updateInventoryStatus(mockInventoryCategories);
        });
}

// Load alerts data
function loadAlertData() {
    // Simulate API call to get alert data
    fetchData('/api/alerts')
        .then(data => {
            updateStockAlerts(data.stockAlerts);
            updateAlertStats(data.alertStats);
        })
        .catch(error => {
            console.error('Error loading alert data:', error);
            // Load mock data for demonstration
            const mockStockAlerts = [
                { name: 'Fine Sand', category: 'Sand', stock: 18, maxStock: 100, status: 'warning' },
                { name: 'Wire Mesh', category: 'Steel', stock: 23, maxStock: 100, status: 'warning' },
                { name: 'Coarse Sand', category: 'Sand', stock: 5, maxStock: 100, status: 'danger' },
                { name: 'Water-proof Cement', category: 'Cement', stock: 0, maxStock: 50, status: 'danger' }
            ];
            
            const mockAlertStats = {
                lowStock: 2,
                outOfStock: 2,
                lowStockChange: 0,
                outOfStockChange: 50
            };
            
            updateStockAlerts(mockStockAlerts);
            updateAlertStats(mockAlertStats);
        });
}

// Update notification count
function updateNotifications() {
    // Simulate API call to get notification count
    fetchData('/api/notifications')
        .then(data => {
            document.getElementById('notificationCount').textContent = data.count;
        })
        .catch(error => {
            console.error('Error loading notifications:', error);
            // Set mock notification count
            document.getElementById('notificationCount').textContent = '4';
        });
}

// ======== UI UPDATE FUNCTIONS ========

// Update sales and revenue stats
function updateSalesStats(data) {
    document.getElementById('totalSales').textContent = data.totalSales.toLocaleString();
    document.getElementById('totalRevenue').textContent = '₹' + data.totalRevenue.toLocaleString();
    
    const salesChangeElement = document.getElementById('salesChange');
    salesChangeElement.innerHTML = `
        <i class="fas fa-arrow-${data.salesChange >= 0 ? 'up' : 'down'}"></i>
        <span>${Math.abs(data.salesChange)}% from last week</span>
    `;
    salesChangeElement.className = `stat-change ${data.salesChange >= 0 ? 'positive' : 'negative'}`;
    
    const revenueChangeElement = document.getElementById('revenueChange');
    revenueChangeElement.innerHTML = `
        <i class="fas fa-arrow-${data.revenueChange >= 0 ? 'up' : 'down'}"></i>
        <span>${Math.abs(data.revenueChange)}% from last week</span>
    `;
    revenueChangeElement.className = `stat-change ${data.revenueChange >= 0 ? 'positive' : 'negative'}`;
}

// Update recent sales table
function updateRecentSales(sales) {
    const tableBody = document.getElementById('recentSalesTable');
    tableBody.innerHTML = '';
    
    sales.forEach(sale => {
        const row = document.createElement('tr');
        const date = new Date(sale.date);
        const formattedDate = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        
        row.innerHTML = `
            <td>${sale.name}</td>
            <td>${sale.quantity}</td>
            <td>₹${sale.amount.toLocaleString()}</td>
            <td>${formattedDate}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Update inventory chart
function updateInventoryChart(items) {
    const chartContainer = document.getElementById('inventoryChart');
    chartContainer.innerHTML = '';
    
    // Get max stock level for scaling
    const maxStock = Math.max(...items.map(item => item.maxStock));
    
    // Filter to top items for better visibility
    const topItems = items.slice(0, 7);
    
    topItems.forEach(item => {
        const percentage = (item.stock / item.maxStock) * 100;
        let barColor = getStockLevelColor(percentage);
        
        // Height relative to chart container
        const barHeight = (item.stock / maxStock) * 230; // Adjust 230 based on chart height
        
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${barHeight}px`;
        bar.style.backgroundColor = barColor;
        
        const barLabel = document.createElement('div');
        barLabel.className = 'bar-label';
        barLabel.textContent = item.name;
        
        const barValue = document.createElement('div');
        barValue.className = 'bar-value';
        barValue.textContent = item.stock;
        
        bar.appendChild(barValue);
        bar.appendChild(barLabel);
        chartContainer.appendChild(bar);
    });
}

// Update inventory status table
function updateInventoryStatus(categories) {
    const tableBody = document.getElementById('inventoryStatusTable');
    tableBody.innerHTML = '';
    
    categories.forEach(category => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${category.name}</td>
            <td>${category.items}</td>
            <td>₹${category.value.toLocaleString()}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Update stock alerts table
function updateStockAlerts(alerts) {
    const tableBody = document.getElementById('stockAlertsTable');
    tableBody.innerHTML = '';
    
    alerts.forEach(item => {
        const row = document.createElement('tr');
        const percentage = (item.stock / item.maxStock) * 100;
        
        const statusClass = getStatusClass(item.status);
        const barClass = getBarClass(item.status);
        
        // Create item name with alert icon for low/out of stock
        let itemNameHtml = item.name;
        if (item.status === 'danger') {
            itemNameHtml = `
                <div class="item-name">
                    ${item.name}
                    <i class="fas fa-exclamation-circle alert-icon"></i>
                </div>
            `;
        }
        
        row.innerHTML = `
            <td>${itemNameHtml}</td>
            <td>
                <span class="status-indicator ${statusClass}"></span>
                ${getStatusText(item.status)}
            </td>
            <td>
                <div class="stock-level">
                    <div class="stock-level-bar ${barClass}" style="width: ${percentage}%"></div>
                </div>
                <div style="font-size: 0.8rem; margin-top: 5px;">${item.stock}/${item.maxStock}</div>
            </td>
        `;
        
        // Add click event to navigate to reminders page for low stock items
        if (item.status !== 'normal') {
            row.style.cursor = 'pointer';
            row.addEventListener('click', function() {
                window.location.href = 'reminders.html';
            });
        }
        
        tableBody.appendChild(row);
    });
}

// Update alert stats
function updateAlertStats(data) {
    document.getElementById('lowStockCount').textContent = data.lowStock;
    document.getElementById('outOfStockCount').textContent = data.outOfStock;
    
    const outOfStockChangeElement = document.getElementById('outOfStockChange');
    outOfStockChangeElement.innerHTML = `
        <i class="fas fa-arrow-${data.outOfStockChange >= 0 ? 'up' : 'down'}"></i>
        <span>${Math.abs(data.outOfStockChange)}% from last week</span>
    `;
    outOfStockChangeElement.className = `stat-change ${data.outOfStockChange <= 0 ? 'positive' : 'negative'}`;
}

// ======== HELPER FUNCTIONS ========

// Fetch data from API
function fetchData(url) {
    // In a real application, this would be a fetch call to your API
    return new Promise((resolve, reject) => {
        // Simulate API delay
        setTimeout(() => {
            // For demonstration purposes, reject to use mock data
            reject('API not available in demo');
        }, 300);
    });
}

// Get color for stock level
function getStockLevelColor(percentage) {
    if (percentage <= 10) {
        return 'var(--danger-color)';
    } else if (percentage <= 25) {
        return 'var(--warning-color)';
    } else {
        return 'var(--primary-color)';
    }
}

// Get status class for indicator
function getStatusClass(status) {
    switch (status) {
        case 'danger':
            return 'status-danger';
        case 'warning':
            return 'status-warning';
        default:
            return 'status-normal';
    }
}

// Get bar class for stock level
function getBarClass(status) {
    switch (status) {
        case 'danger':
            return 'danger';
        case 'warning':
            return 'warning';
        default:
            return 'normal';
    }
}

// Get text for status
function getStatusText(status) {
    switch (status) {
        case 'danger':
            return 'Out of stock';
        case 'warning':
            return 'Low stock';
        default:
            return 'In stock';
    }
}

// Format currency
function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Responsive handling for mobile
document.addEventListener('DOMContentLoaded', function() {
    // Check if we need to add mobile menu toggle
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    function handleMobileLayout(e) {
        if (e.matches) {
            // Add mobile menu toggle if it doesn't exist
            if (!document.querySelector('.mobile-menu-toggle')) {
                const header = document.querySelector('.header');
                const mobileToggle = document.createElement('button');
                mobileToggle.className = 'mobile-menu-toggle';
                mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
                header.insertBefore(mobileToggle, header.firstChild);
                
                // Add toggle functionality
                mobileToggle.addEventListener('click', function() {
                    document.getElementById('sidebar').classList.toggle('mobile-show');
                });
            }
        }
    }
    
    // Initial check
    handleMobileLayout(mediaQuery);
    
    // Add listener for screen size changes
    mediaQuery.addEventListener('change', handleMobileLayout);
});