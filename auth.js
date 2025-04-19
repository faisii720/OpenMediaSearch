// Authentication module

let currentUser = null;

function initAuth() {
    // Event listeners for auth buttons
    document.getElementById('login-btn').addEventListener('click', showLoginForm);
    document.getElementById('register-btn').addEventListener('click', showRegisterForm);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('cancel-login').addEventListener('click', hideAuthForms);
    document.getElementById('cancel-register').addEventListener('click', hideAuthForms);
    document.getElementById('submit-login').addEventListener('click', function(e) {
        e.preventDefault();
        handleLogin();
    });
    document.getElementById('submit-register').addEventListener('click', function(e) {
        e.preventDefault();
        handleRegister();
    });
}

function showLoginForm() {
    document.querySelector('.auth-forms').classList.remove('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function showRegisterForm() {
    document.querySelector('.auth-forms').classList.remove('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
}

function hideAuthForms() {
    document.querySelector('.auth-forms').classList.add('hidden');
    clearAuthForms();
}

function clearAuthForms() {
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-name').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
}

function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    // Email and password required
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Password length validation
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    // In a real app, this would call your backend API
    // For this demo, we'll use localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateUIForAuth();
        hideAuthForms();
        showNotification('Login successful', 'success');
    } else {
        showNotification('Invalid credentials', 'error');
    }
}

function handleRegister() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    // All fields required
    if (!name || !email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    // Full name validation
    if (name.length < 2) {
        showNotification('Full name must be at least 2 characters', 'error');
        return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Password length validation
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In a real app, you would hash the password
        savedSearches: []
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    updateUIForAuth();
    hideAuthForms();
    showNotification('Registration successful', 'success');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIForAuth();
    showNotification('Logged out successfully', 'success');
}

function checkAuthState() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        updateUIForAuth();
    }
}

function updateUIForAuth() {
    const isLoggedIn = currentUser !== null;
    
    document.getElementById('login-btn').classList.toggle('hidden', isLoggedIn);
    document.getElementById('register-btn').classList.toggle('hidden', isLoggedIn);
    document.getElementById('logout-btn').classList.toggle('hidden', !isLoggedIn);
    document.getElementById('save-search-btn').classList.toggle('hidden', !isLoggedIn);
    document.querySelector('.saved-searches-section').classList.toggle('hidden', !isLoggedIn);
    
    if (isLoggedIn) {
        loadSavedSearches();
    }
}

// Make currentUser accessible to other modules
function getCurrentUser() {
    return currentUser;
}