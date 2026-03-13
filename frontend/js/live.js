let socket = null;

document.addEventListener('DOMContentLoaded', async () => {
    const user = await checkAuth();
    if (!user) return;
    document.getElementById('user-name').textContent = user.name;

    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');

    if (courseId) {
        connectToChat(courseId);
    }

    const chatForm = document.getElementById('chat-form');
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(input.value);
            input.value = '';
        } else {
            showToast('Not connected to chat', 'error');
        }
    });
});

function connectToChat(courseId) {
    const token = localStorage.getItem('token');
    // Assuming backend endpoint is /live-classes/{live_class_id}/chat
    // For simplicity in this demo, we'll try to get the first live class for this course
    // or just use 1 if it's a demo.
    const liveClassId = 1; 

    socket = new WebSocket(`ws://localhost:8000/live-classes/${liveClassId}/chat?token=${token}`);

    socket.onopen = () => {
        showToast('Connected to live chat');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        displayMessage(data);
    };

    socket.onclose = () => {
        showToast('Disconnected from chat', 'error');
        // Optional: Reconnect logic
    };

    socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };
}

function displayMessage(data) {
    const window = document.getElementById('chat-window');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message';
    
    // data structure based on ChatMessagePublic: { user_id, user_name, content, timestamp }
    msgDiv.innerHTML = `
        <div class="user">${data.user_name || 'User'} <span class="time">${new Date(data.timestamp).toLocaleTimeString()}</span></div>
        <div class="content">${data.content}</div>
    `;
    
    window.appendChild(msgDiv);
    window.scrollTop = window.scrollHeight;
}
