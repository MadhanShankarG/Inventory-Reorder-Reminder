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

    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/';
            return;
        }

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch('/api/summary', { headers });

        if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            sessionStorage.removeItem('role');
            window.location.href = '/';
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to fetch summary');
        }

        const data = await response.json();
        if (data.success) {
            document.getElementById('total-items').textContent = data.total_items || 0;
            document.getElementById('low-stock-items').textContent = data.low_stock_count || 0;
            if (data.out_of_stock_count !== undefined && document.getElementById('out-of-stock-items')) {
                document.getElementById('out-of-stock-items').textContent = data.out_of_stock_count || 0;
            }
            if (data.recent_activity && data.recent_activity.length > 0) {
                renderRecentActivity(data.recent_activity);
            } else {
                const tbody = document.getElementById('recent-activity-body');
                if (tbody) {
                    tbody.innerHTML = '<tr class="placeholder-row"><td colspan="4">No activity yet.</td></tr>';
                }
            }
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('total-items').textContent = '0';
        document.getElementById('low-stock-items').textContent = '0';
    }
}

function renderRecentActivity(entries) {
    const tbody = document.getElementById('recent-activity-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    entries.forEach(entry => {
        const row = document.createElement('tr');
        const time = entry.time ? new Date(entry.time).toLocaleString() : '–';
        const action = entry.action || '–';
        const itemName = entry.item_name || '–';
        const details = entry.details ? JSON.stringify(entry.details) : '–';
        row.innerHTML = `
            <td>${time}</td>
            <td>${action}</td>
            <td>${itemName}</td>
            <td>${details}</td>
        `;
        tbody.appendChild(row);
    });
}
