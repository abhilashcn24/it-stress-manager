

const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const micButton = document.getElementById('mic-button');
const modal = document.getElementById('coming-soon-modal');
const closeModal = document.getElementById('close-modal');

const quotes = [
    {
        "content": "The best way to predict the future is to create it.",
        "author": "Peter Drucker"
    },
    {
        "content": "The only way to do great work is to love what you do.",
        "author": "Steve Jobs"
    },
    {
        "content": "Believe you can and you're halfway there.",
        "author": "Theodore Roosevelt"
    },
    {
        "content": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "author": "Winston Churchill"
    },
    {
        "content": "The mind is everything. What you think you become.",
        "author": "Buddha"
    }
];

function getWelcomeMessage() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    appendMessage('bot', `Welcome! Here is a thought for the day: \"${randomQuote.content}\" - ${randomQuote.author}`);
}

async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage === '') return;

    appendMessage('user', userMessage);
    userInput.value = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        appendMessage('bot', result.message);

    } catch (error) {
        console.error("Error fetching bot response:", error);
        appendMessage('bot', 'I am currently unable to respond. Please try again later.');
    }
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('mb-4');

    let formattedMessage = message;
    if (sender === 'bot') {
        formattedMessage = formattedMessage.replace(/\n/g, '<br>');
    }

    messageElement.innerHTML = `
        <div class="font-bold ${sender === 'user' ? 'text-indigo-400' : 'text-green-400'}">${sender === 'user' ? 'You' : 'Solvia AI'}</div>
        <div class="text-white">${formattedMessage}</div>
    `;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Modal functionality for mic button
micButton.addEventListener('click', () => {
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.querySelector('div').classList.add('modal-show');
    }, 10);
});

closeModal.addEventListener('click', closeModalFunction);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModalFunction();
});

function closeModalFunction() {
    modal.querySelector('div').classList.remove('modal-show');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

document.addEventListener('DOMContentLoaded', getWelcomeMessage);

