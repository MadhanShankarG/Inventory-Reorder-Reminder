document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('jwt');
    if (!token) {
        window.location.href = '/';
        return;
    }

    await loadReminders();
});

async function loadReminders() {
    try {
        const token = sessionStorage.getItem('jwt');
        if (!token) {
            window.location.href = '/';
            return;
        }

        const response = await fetch('/api/reminders', {
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
        const tbody = document.getElementById('reminders-table-body');
        tbody.innerHTML = '';

        if (data.success && data.reminders && data.reminders.length > 0) {
            data.reminders.forEach(item => {
                const row = document.createElement('tr');
                const status = item.quantity <= item.threshold ? 'Low Stock' : 'In Stock';
                const statusClass = item.quantity <= item.threshold ? 'status-low' : 'status-ok';
                row.innerHTML = `
                    <td>${item.name || 'N/A'}</td>
                    <td>${item.sku || 'N/A'}</td>
                    <td>${item.quantity || 0}</td>
                    <td>${item.threshold || 0}</td>
                    <td><span class="${statusClass}">${status}</span></td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr class="placeholder-row"><td colspan="5">No low-stock items right now.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading reminders:', error);
        const tbody = document.getElementById('reminders-table-body');
        tbody.innerHTML = '<tr class="placeholder-row"><td colspan="5">Error loading reminders.</td></tr>';
    }
}
