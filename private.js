document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    fetch('https://your-server-url.com/private', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            window.location.href = 'login.html';
        } else {
            document.getElementById('profileData').innerHTML = `
                <p>اسم المستخدم: ${data.username}</p>
                <p>البريد الإلكتروني: ${data.email}</p>
                <p>تاريخ الإنشاء: ${new Date(data.created_at).toLocaleString()}</p>
            `;
        }
    })
    .catch(err => {
        console.error('حدث خطأ:', err);
        window.location.href = 'login.html';
    });
});