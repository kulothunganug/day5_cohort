// Auth Logic
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            try {
                // Using fetch directly as apiRequest expects JSON, but /auth/login expects Form Data
                const response = await fetch('http://localhost:8000/auth/login', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || 'Login failed');

                localStorage.setItem('token', data.access_token);
                showToast('Login successful!');
                
                // Redirect based on role
                const user = await apiRequest('/auth/me');
                redirectUser(user.role);
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value
            };

            try {
                await apiRequest('/auth/register', 'POST', payload);
                showToast('Registration successful! Please login.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                // Error handled by apiRequest toast
            }
        });
    }
});

function redirectUser(role) {
    if (role === 'instructor') {
        window.location.href = 'instructor.html';
    } else {
        window.location.href = 'student.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
