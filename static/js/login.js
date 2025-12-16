document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const f = e.target;
        const body = { username: f.username.value.trim(), password: f.password.value };

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const json = await res.json();
            if (res.ok && json.success && json.token) {
                localStorage.setItem('access_token', json.token);
                if (json.refresh) {
                    localStorage.setItem('refresh_token', json.refresh);
                }
                if (json.role) {
                    sessionStorage.setItem('role', json.role);
                }
                window.location.href = '/dashboard';
            } else {
                document.getElementById('loginError').innerText = json.message || 'Login failed';
            }
        } catch (err) {
            console.error(err);
            document.getElementById('loginError').innerText = 'Network error';
        }
    });
});
