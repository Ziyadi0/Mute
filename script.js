document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const profileImage = localStorage.getItem('profileImage');

    if (!token || !username) {
        window.location.href = 'login.html';
    }

    document.getElementById('welcomeMessage').textContent = `مرحبًا، ${username}!`;
    document.getElementById('profileImage').src = profileImage;
});

function showProfile() {
    window.location.href = 'profile.html';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('profileImage');
    localStorage.removeItem('lastNameChange');
    window.location.href = 'login.html';
}

async function createServer() {
    const serverName = prompt('أدخل اسم السيرفر:');
    const serverImage = prompt('أدخل رابط صورة السيرفر:');

    if (!serverName || !serverImage) {
        alert('الرجاء إدخال جميع الحقول');
        return;
    }

    const token = localStorage.getItem('token');
    const userId = jwt.decode(token).id;

    const response = await fetch('https://your-server-url.com/create-server', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: serverName, image: serverImage, ownerId: userId })
    });

    const result = await response.json();
    if (response.ok) {
        alert('تم إنشاء السيرفر بنجاح');
    } else {
        alert(result.message);
    }
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();

    if (messageText !== "") {
        const messagesContainer = document.getElementById('messages');
        const messageElement = document.createElement('div');
        messageElement.textContent = messageText;
        messagesContainer.appendChild(messageElement);
        messageInput.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}