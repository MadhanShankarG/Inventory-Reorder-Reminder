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

    await loadReminders();
});

async function loadReminders() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/';
            return;
        }

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch('/api/reminders', { headers });

        if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            sessionStorage.removeItem('role');
            window.location.href = '/';
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to fetch reminders');
        }

        const data = await response.json();
        const tbody = document.getElementById('reminders-body');
        tbody.innerHTML = '';

        if (data.success && data.reminders && data.reminders.length > 0) {
            data.reminders.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name || '–'}</td>
                    <td>${item.sku || '–'}</td>
                    <td>${item.quantity || 0}</td>
                    <td>${item.threshold || 0}</td>
                    <td><span class="status-low">Low Stock</span></td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr class="placeholder-row"><td colspan="5">No low-stock items right now.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading reminders:', error);
        const tbody = document.getElementById('reminders-body');
        tbody.innerHTML = '<tr class="placeholder-row"><td colspan="5">Error loading reminders.</td></tr>';
    }
}
