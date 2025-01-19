async function login() {
    const usernameOrEmail = document.getElementById('usernameOrEmail').value;
    const password = document.getElementById('password').value;

    if (!usernameOrEmail || !password) {
        alert('الرجاء إدخال جميع الحقول');
        return;
    }

    const response = await fetch('https://your-server-url.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
    });

    const result = await response.json();
    if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('username', result.username);
        localStorage.setItem('profileImage', result.profileImage || 'profile-icon.png');
        localStorage.setItem('lastNameChange', result.lastNameChange);
        window.location.href = 'index.html'; // الانتقال إلى الصفحة الرئيسية
    } else {
        alert(result.message);
    }
}

async function register() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // إزالة رسائل الخطأ السابقة
    document.getElementById('usernameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';

    let isValid = true;

    if (!username) {
        document.getElementById('usernameError').textContent = 'الرجاء إدخال اسم المستخدم';
        isValid = false;
    }

    if (!email) {
        document.getElementById('emailError').textContent = 'الرجاء إدخال البريد الإلكتروني';
        isValid = false;
    } else if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = 'البريد الإلكتروني غير صحيح';
        isValid = false;
    }

    if (!password) {
        document.getElementById('passwordError').textContent = 'الرجاء إدخال كلمة المرور';
        isValid = false;
    }

    if (!confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'الرجاء تأكيد كلمة المرور';
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'كلمة المرور غير متطابقة';
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    const response = await fetch('https://your-server-url.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });

    const result = await response.json();
    if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('username', result.username);
        localStorage.setItem('profileImage', result.profileImage || 'profile-icon.png');
        localStorage.setItem('lastNameChange', result.lastNameChange);
        window.location.href = 'index.html'; // الانتقال إلى الصفحة الرئيسية
    } else {
        alert(result.message);
    }
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('profileImage');
    localStorage.removeItem('lastNameChange');
    window.location.href = 'login.html';
}