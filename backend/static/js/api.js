const BASE_URL = 'http://localhost:8000';

async function apiRequest(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (response.status === 401) {
            localStorage.removeItem('token');
            if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
                window.location.href = 'login.html';
            }
            throw new Error('Unauthorized');
        }

        const data = await response.json();

        if (!response.ok) {
            let errorMessage = 'Something went wrong';
            if (data.detail) {
                errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
            }
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        showToast(error.message, 'error');
        throw error;
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Global Auth State Helper
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html') && window.location.pathname !== '/' && !window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
        }
        return null;
    }

    try {
        const user = await apiRequest('/auth/me');
        return user;
    } catch (error) {
        return null;
    }
}
