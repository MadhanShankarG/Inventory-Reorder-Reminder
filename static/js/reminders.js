// reminders.js - Dynamic functionality for the Cement Store Inventory System Reminders Page

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const remindersList = document.getElementById('reminders-list');
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');
    const sortSelect = document.getElementById('sort-select');
    const acknowledgeAllBtn = document.getElementById('acknowledge-all');
    const alertBanner = document.getElementById('alert-banner');
    const alertMessage = document.getElementById('alert-message');
    const alertCount = document.getElementById('alert-count');
    
    // Inventory data structure
    let inventoryItems = [];
    let filteredItems = [];
    let acknowledgedAlerts = new Set();
    
    // Initialize the page
    init();
    
    // Main initialization function
    function init() {
        // Get inventory data from localStorage or API
        loadInventoryData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initial render of items
        filterAndRenderItems();
        
        // Check for critical alerts to display in the banner
        checkForCriticalAlerts();
    }
    
    // Load inventory data from localStorage or API
    function loadInventoryData() {
        try {
            // Try to load from localStorage first
            const storedInventory = localStorage.getItem('cementStoreInventory');
            
            if (storedInventory) {
                inventoryItems = JSON.parse(storedInventory);
                console.log('Loaded inventory from localStorage:', inventoryItems.length, 'items');
            } else {
                // If no localStorage data, try to fetch from API
                fetchInventoryFromAPI();
            }
            
            // If no data is available yet, create sample data for development
            if (!inventoryItems || inventoryItems.length === 0) {
                console.warn('No inventory data found, using development data');
                createDevelopmentData();
            }
        } catch (error) {
            console.error('Error loading inventory data:', error);
            createDevelopmentData();
        }
    }
    
    // Fetch inventory data from API
    async function fetchInventoryFromAPI() {
        try {
            const response = await fetch('/api/inventory');
            if (response.ok) {
                const data = await response.json();
                inventoryItems = data;
                console.log('Loaded inventory from API:', inventoryItems.length, 'items');
                
                // Save to localStorage for offline access
                localStorage.setItem('cementStoreInventory', JSON.stringify(inventoryItems));
            } else {
                throw new Error('Failed to fetch inventory data');
            }
        } catch (error) {
            console.error('API fetch error:', error);
            // Will fall back to development data if needed
        }
    }
    
    // Setup all event listeners
    function setupEventListeners() {
        // Search functionality
        searchInput.addEventListener('input', filterAndRenderItems);
        
        // Filter dropdown
        filterSelect.addEventListener('change', filterAndRenderItems);
        
        // Sort dropdown
        sortSelect.addEventListener('change', filterAndRenderItems);
        
        // Acknowledge all button
        acknowledgeAllBtn.addEventListener('click', acknowledgeAllAlerts);
        
        // Close alert banner
        document.getElementById('close-alert').addEventListener('click', function() {
            alertBanner.classList.add('hidden');
        });
        
        // Listen for inventory updates (for real-time updates)
        window.addEventListener('storage', function(e) {
            if (e.key === 'cementStoreInventory') {
                loadInventoryData();
                filterAndRenderItems();
                checkForCriticalAlerts();
            }
        });
    }
    
    // Filter and render items based on current filters and sort
    function filterAndRenderItems() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterOption = filterSelect.value;
        
        // Apply filters
        filteredItems = inventoryItems.filter(item => {
            // Search filter
            const matchesSearch = item.name.toLowerCase().includes(searchTerm);
            
            // Stock level filter
            let matchesFilter = true;
            if (filterOption === 'low-stock') {
                matchesFilter = item.currentStock <= item.reorderLevel;
            } else if (filterOption === 'out-of-stock') {
                matchesFilter = item.currentStock === 0;
            }
            
            return matchesSearch && matchesFilter;
        });
        
        // Apply sorting
        const sortOption = sortSelect.value;
        sortItems(sortOption);
        
        // Render the filtered and sorted items
        renderItems();
        
        // Update alert count
        updateAlertCount();
    }
    
    // Sort items based on the selected sort option
    function sortItems(sortOption) {
        switch(sortOption) {
            case 'stock-asc':
                filteredItems.sort((a, b) => a.currentStock - b.currentStock);
                break;
            case 'stock-desc':
                filteredItems.sort((a, b) => b.currentStock - a.currentStock);
                break;
            case 'alert-status':
                filteredItems.sort((a, b) => {
                    const alertLevelA = getAlertLevel(a);
                    const alertLevelB = getAlertLevel(b);
                    return alertLevelA - alertLevelB;
                });
                break;
            case 'name-asc':
                filteredItems.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Default sort by alert level
                filteredItems.sort((a, b) => {
                    const alertLevelA = getAlertLevel(a);
                    const alertLevelB = getAlertLevel(b);
                    return alertLevelA - alertLevelB;
                });
        }
    }
    
    // Get numeric alert level for sorting (0 = critical, 1 = warning, 2 = ok)
    function getAlertLevel(item) {
        if (item.currentStock < item.reorderLevel) return 0;
        if (item.currentStock === item.reorderLevel) return 1;
        return 2;
    }
    
    // Render the filtered items to the reminders list
    function renderItems() {
        // Clear the current list
        remindersList.innerHTML = '';
        
        if (filteredItems.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No items match your filters';
            remindersList.appendChild(emptyMessage);
            return;
        }
        
        // Create a card for each item
        filteredItems.forEach(item => {
            const card = createItemCard(item);
            remindersList.appendChild(card);
        });
    }
    
    // Create a card element for an inventory item
    function createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'reminder-card';
        card.dataset.id = item.id;
        
        // Determine alert status
        let alertStatus, alertClass, alertIcon;
        if (item.currentStock < item.reorderLevel) {
            alertStatus = 'Critical';
            alertClass = 'alert-critical';
            alertIcon = '⚠️';
        } else if (item.currentStock === item.reorderLevel) {
            alertStatus = 'Warning';
            alertClass = 'alert-warning';
            alertIcon = '⚠️';
        } else {
            alertStatus = 'OK';
            alertClass = 'alert-ok';
            alertIcon = '✅';
        }
        
        // Add acknowledged class if this alert was acknowledged
        if (acknowledgedAlerts.has(item.id)) {
            card.classList.add('acknowledged');
        }
        
        // Card content
        card.innerHTML = `
            <div class="card-header ${alertClass}">
                <h3>${item.name}</h3>
                <span class="alert-badge">${alertIcon} ${alertStatus}</span>
            </div>
            <div class="card-body">
                <div class="stock-info">
                    <p><span>Current Stock:</span> ${item.currentStock} ${item.unit}</p>
                    <p><span>Reorder Level:</span> ${item.reorderLevel} ${item.unit}</p>
                </div>
                <div class="stock-meter">
                    <div class="meter-bar">
                        <div class="meter-fill ${alertClass}" style="width: ${Math.min(100, (item.currentStock / (item.reorderLevel * 2)) * 100)}%"></div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-acknowledge" data-id="${item.id}">Acknowledge</button>
                    <button class="btn btn-restock" data-id="${item.id}">Restock Now</button>
                </div>
            </div>
        `;
        
        // Add event listeners to the buttons
        setTimeout(() => {
            const acknowledgeBtn = card.querySelector('.btn-acknowledge');
            const restockBtn = card.querySelector('.btn-restock');
            
            acknowledgeBtn.addEventListener('click', function() {
                acknowledgeAlert(item.id);
            });
            
            restockBtn.addEventListener('click', function() {
                window.location.href = `add_inventory.html?itemId=${item.id}`;
            });
        }, 0);
        
        return card;
    }
    
    // Acknowledge a single alert
    function acknowledgeAlert(itemId) {
        acknowledgedAlerts.add(itemId);
        const card = document.querySelector(`.reminder-card[data-id="${itemId}"]`);
        if (card) {
            card.classList.add('acknowledged');
        }
        updateAlertCount();
        
        // Save acknowledged alerts to localStorage
        localStorage.setItem('acknowledgedAlerts', JSON.stringify([...acknowledgedAlerts]));
    }
    
    // Acknowledge all alerts
    function acknowledgeAllAlerts() {
        filteredItems.forEach(item => {
            if (item.currentStock <= item.reorderLevel) {
                acknowledgedAlerts.add(item.id);
            }
        });
        
        document.querySelectorAll('.reminder-card').forEach(card => {
            card.classList.add('acknowledged');
        });
        
        updateAlertCount();
        
        // Save acknowledged alerts to localStorage
        localStorage.setItem('acknowledgedAlerts', JSON.stringify([...acknowledgedAlerts]));
        
        // Show confirmation message
        showToast('All alerts have been acknowledged');
    }
    
    // Show a toast message
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Check for critical alerts and display in banner if needed
    function checkForCriticalAlerts() {
        const criticalItems = inventoryItems.filter(item => 
            item.currentStock < item.reorderLevel && !acknowledgedAlerts.has(item.id)
        );
        
        if (criticalItems.length > 0) {
            // Display alert banner
            alertBanner.classList.remove('hidden');
            
            // Set alert message
            if (criticalItems.length === 1) {
                alertMessage.textContent = `${criticalItems[0].name} is critically low on stock (${criticalItems[0].currentStock}/${criticalItems[0].reorderLevel})`;
            } else {
                alertMessage.textContent = `${criticalItems.length} items are critically low on stock and need attention`;
            }
        } else {
            alertBanner.classList.add('hidden');
        }
    }
    
    // Update the alert count badge
    function updateAlertCount() {
        const lowStockCount = inventoryItems.filter(item => 
            item.currentStock <= item.reorderLevel && !acknowledgedAlerts.has(item.id)
        ).length;
        
        alertCount.textContent = lowStockCount;
        
        if (lowStockCount > 0) {
            alertCount.classList.remove('hidden');
        } else {
            alertCount.classList.add('hidden');
        }
    }
    
    // Load acknowledged alerts from localStorage
    function loadAcknowledgedAlerts() {
        try {
            const storedAcknowledged = localStorage.getItem('acknowledgedAlerts');
            if (storedAcknowledged) {
                acknowledgedAlerts = new Set(JSON.parse(storedAcknowledged));
            }
        } catch (error) {
            console.error('Error loading acknowledged alerts:', error);
        }
    }
    
    // Create development data for testing
    function createDevelopmentData() {
        inventoryItems = [
            {
                id: 1,
                name: 'Portland Cement (PPC)',
                currentStock: 120,
                reorderLevel: 200,
                unit: 'bags'
            },
            {
                id: 2,
                name: 'White Cement',
                currentStock: 45,
                reorderLevel: 50,
                unit: 'bags'
            },
            {
                id: 3,
                name: 'Rapid Hardening Cement',
                currentStock: 8,
                reorderLevel: 100,
                unit: 'bags'
            },
            {
                id: 4,
                name: 'Portland Blast Furnace Cement',
                currentStock: 0,
                reorderLevel: 30,
                unit: 'tons'
            },
            {
                id: 5,
                name: 'Masonry Cement',
                currentStock: 35,
                reorderLevel: 30,
                unit: 'bags'
            },
            {
                id: 6,
                name: 'Ready Mix Concrete',
                currentStock: 50,
                reorderLevel: 50,
                unit: 'cubic yards'
            },
            {
                id: 7,
                name: 'Waterproof Cement',
                currentStock: 120,
                reorderLevel: 75,
                unit: 'bags'
            },
            {
                id: 8,
                name: 'Portland Pozzolana Cement',
                currentStock: 15,
                reorderLevel: 50,
                unit: 'tons'
            }
        ];
    }
    
    // Add an inventory item and update storage
    function addInventoryItem(item) {
        inventoryItems.push(item);
        saveInventoryToStorage();
        filterAndRenderItems();
        checkForCriticalAlerts();
    }
    
    // Update an inventory item's stock level
    function updateItemStock(itemId, newStock) {
        const item = inventoryItems.find(item => item.id === itemId);
        if (item) {
            const oldStock = item.currentStock;
            item.currentStock = newStock;
            
            // Check if this update triggered a new alert
            if (oldStock > item.reorderLevel && newStock <= item.reorderLevel) {
                showNewAlertNotification(item);
            }
            
            saveInventoryToStorage();
            filterAndRenderItems();
            checkForCriticalAlerts();
        }
    }
    
    // Save inventory to localStorage
    function saveInventoryToStorage() {
        localStorage.setItem('cementStoreInventory', JSON.stringify(inventoryItems));
    }
    
    // Show notification for newly triggered alerts
    function showNewAlertNotification(item) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Inventory Alert', {
                body: `${item.name} is now at or below reorder level. Current stock: ${item.currentStock}`,
                icon: '/images/logo.png'
            });
        } else {
            // Show in-page notification
            const alertPopup = document.createElement('div');
            alertPopup.className = 'alert-popup';
            alertPopup.innerHTML = `
                <div class="alert-popup-content">
                    <h3>New Stock Alert</h3>
                    <p>${item.name} is now at or below reorder level.</p>
                    <p>Current stock: ${item.currentStock} / ${item.reorderLevel}</p>
                    <button class="btn btn-close">Close</button>
                </div>
            `;
            
            document.body.appendChild(alertPopup);
            
            setTimeout(() => {
                alertPopup.classList.add('show');
            }, 100);
            
            alertPopup.querySelector('.btn-close').addEventListener('click', function() {
                alertPopup.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(alertPopup);
                }, 300);
            });
        }
    }
    
    // Request notification permission
    function requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }
    
    // Add to public API for use from other pages
    window.cementStoreReminders = {
        addInventoryItem,
        updateItemStock,
        loadInventoryData,
        renderItems
    };
    
    // Initial loads
    loadAcknowledgedAlerts();
    requestNotificationPermission();
});