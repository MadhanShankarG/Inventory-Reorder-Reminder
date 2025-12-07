document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('jwt');
    if (!token) {
        window.location.href = '/';
        return;
    }

    await loadInventory();
});

async function loadInventory() {
    try {
        const token = sessionStorage.getItem('jwt');
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
            sessionStorage.removeItem('jwt');
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        const tbody = document.getElementById('inventory-table-body');
        tbody.innerHTML = '';

        if (data.success && data.items && data.items.length > 0) {
            data.items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name || 'N/A'}</td>
                    <td>${item.sku || 'N/A'}</td>
                    <td>${item.quantity || 0}</td>
                    <td>${item.threshold || 0}</td>
                    <td>
                        <button class="btn-edit" data-id="${item.id}">Edit</button>
                        <button class="btn-delete" data-id="${item.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

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
        const token = sessionStorage.getItem('jwt');
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
            sessionStorage.removeItem('jwt');
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
