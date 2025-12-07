document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('jwt');
    if (!token) {
        window.location.href = '/';
        return;
    }

    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        const token = sessionStorage.getItem('jwt');
        if (!token) {
            window.location.href = '/';
            return;
        }

        const response = await fetch('/api/summary', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            sessionStorage.removeItem('jwt');
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
        }

        await loadRecentActivity();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('total-items').textContent = '0';
        document.getElementById('low-stock-items').textContent = '0';
    }
}

async function loadRecentActivity() {
    try {
        const token = sessionStorage.getItem('jwt');
        if (!token) return;

        const response = await fetch('/api/items?per_page=5', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const tbody = document.getElementById('recent-activity-body');
            tbody.innerHTML = '';

            if (data.success && data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    const row = document.createElement('tr');
                    const date = item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A';
                    row.innerHTML = `
                        <td>${date}</td>
                        <td>Created</td>
                        <td>${item.name || 'N/A'}</td>
                        <td>Qty: ${item.quantity || 0}</td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr class="placeholder-row"><td colspan="4">No activity yet.</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}
