document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const role = sessionStorage.getItem('role');
    if (role !== 'admin') {
        const adminElems = document.querySelectorAll('.admin-only');
        adminElems.forEach(el => el.remove());
    }

    await loadInventory();
});

async function loadInventory() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/';
            return;
        }

        const response = await fetch('/api/items', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            sessionStorage.removeItem('role');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        const tbody = document.getElementById('inventory-table-body');
        tbody.innerHTML = '';

        if (data.success && data.items && data.items.length > 0) {
            data.items.forEach(item => {
                const row = document.createElement('tr');
                const role = sessionStorage.getItem('role');
                const actionsHtml = role === 'admin' ? `
                    <button class="btn-edit" data-id="${item.id}">Edit</button>
                    <button class="btn-delete" data-id="${item.id}">Delete</button>
                ` : '<span>View Only</span>';
                row.innerHTML = `
                    <td>${item.name || 'N/A'}</td>
                    <td>${item.sku || 'N/A'}</td>
                    <td>${item.quantity || 0}</td>
                    <td>${item.threshold || 0}</td>
                    <td>${actionsHtml}</td>
                `;
                tbody.appendChild(row);
            });

            if (sessionStorage.getItem('role') === 'admin') {
                document.querySelectorAll('.btn-edit').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.dataset.id;
                        editItem(id);
                    });
                });

                document.querySelectorAll('.btn-delete').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const id = e.target.dataset.id;
                        if (confirm('Are you sure you want to delete this item?')) {
                            await deleteItem(id);
                        }
                    });
                });
            }
        } else {
            tbody.innerHTML = '<tr class="placeholder-row"><td colspan="5">No items yet. Use "Add Item" to create one.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
        const tbody = document.getElementById('inventory-table-body');
        tbody.innerHTML = '<tr class="placeholder-row"><td colspan="5">Error loading inventory.</td></tr>';
    }
}

async function deleteItem(itemId) {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/';
            return;
        }

        const response = await fetch(`/api/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            sessionStorage.removeItem('role');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        if (data.success) {
            await loadInventory();
        } else {
            alert(data.message || 'Failed to delete item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
    }
}

function editItem(itemId) {
    window.location.href = `/add-inventory?edit=${itemId}`;
}
