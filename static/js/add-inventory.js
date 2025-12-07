document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('jwt');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const form = document.querySelector('.form');
    if (!form) return;

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
        loadItemForEdit(editId);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value.trim(),
            sku: document.getElementById('sku').value.trim(),
            quantity: parseInt(document.getElementById('quantity').value) || 0,
            threshold: parseInt(document.getElementById('threshold').value) || 0
        };

        if (!formData.name || !formData.sku) {
            alert('Name and SKU are required');
            return;
        }

        try {
            const token = sessionStorage.getItem('jwt');
            if (!token) {
                window.location.href = '/';
                return;
            }

            let response;
            if (editId) {
                response = await fetch(`/api/items/${editId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch('/api/items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
            }

            if (response.status === 401) {
                sessionStorage.removeItem('jwt');
                window.location.href = '/';
                return;
            }

            const data = await response.json();
            if (data.success) {
                alert(editId ? 'Item updated successfully' : 'Item added successfully');
                window.location.href = '/inventory';
            } else {
                alert(data.message || 'Failed to save item');
            }
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Error saving item');
        }
    });
});

async function loadItemForEdit(itemId) {
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

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.items) {
                const item = data.items.find(i => i.id === itemId);
                if (item) {
                    document.getElementById('name').value = item.name || '';
                    document.getElementById('sku').value = item.sku || '';
                    document.getElementById('quantity').value = item.quantity || 0;
                    document.getElementById('threshold').value = item.threshold || 0;
                    document.querySelector('h1').textContent = 'Edit Inventory Item';
                }
            }
        }
    } catch (error) {
        console.error('Error loading item:', error);
    }
}
