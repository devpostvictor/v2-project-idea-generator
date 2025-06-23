document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    let threadId = null;

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (!message) return;

        addMessageToChat('user', message);
        messageInput.value = '';

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, threadId }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server.');
            }

            const data = await response.json();
            threadId = data.threadId; // Store the thread ID from the first response
            addMessageToChat('ai', data.reply);

        } catch (error) {
            console.error('Error:', error);
            addMessageToChat('ai', 'Sorry, I encountered an error. Please try again.');
        }
    });

    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-bubble');
        if (sender === 'user') {
            messageElement.classList.add('user-message');
        } else {
            messageElement.classList.add('ai-message');
        }
        messageElement.textContent = message;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Add a welcome message when the page loads
    addMessageToChat('ai', "Hello! What are your interests or skills? Let's brainstorm some project ideas.");
}); 