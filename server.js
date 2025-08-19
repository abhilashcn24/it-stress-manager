require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs'); // Import the fs module
const { spawn } = require('child_process');

const app = express();
const port = 3000;

// Read the knowledge bank file
let knowledgeBank = '';
let chatbotPrompt = '';
try {
    knowledgeBank = fs.readFileSync(path.join(__dirname, 'knowledge_bank.txt'), 'utf8');
    chatbotPrompt = fs.readFileSync(path.join(__dirname, 'chatbot.prompt'), 'utf8');
} catch (err) {
    console.error('Error reading knowledge bank or chatbot prompt file:', err);
}

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/ai-chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'ai-chat.html'));
});

app.get('/guest', (req, res) => {
    res.sendFile(path.join(__dirname, 'guest.html'));
});

app.get('/hr', (req, res) => {
    res.sendFile(path.join(__dirname, 'hr.html'));
});

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        // Add the knowledge bank content to the prompt
        const prompt = `${chatbotPrompt}\n\n${knowledgeBank}\n\nUser: ${userMessage}`.replace('{{ user input }}', userMessage);
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const response = await axios.post(apiUrl, payload);

        if (response.data.candidates && response.data.candidates.length > 0) {
            const botMessage = response.data.candidates[0].content.parts[0].text;
            res.json({ message: botMessage });
        } else {
            res.status(500).json({ error: 'No response from AI' });
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    // Dummy login logic: accept any email and password
    if (email && password) {
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(400).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/pinecone', (req, res) => {
    const { vector } = req.body;

    if (!vector || !Array.isArray(vector)) {
        return res.status(400).json({ error: 'Invalid or missing vector in the request body.' });
    }

    const pythonProcess = spawn('python', ['pinecone_client.py', JSON.stringify(vector)]);

    let data = '';
    pythonProcess.stdout.on('data', (chunk) => {
        data += chunk.toString();
    });

    let error = '';
    pythonProcess.stderr.on('data', (chunk) => {
        error += chunk.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Python script exited with code ${code}`);
            return res.status(500).json({ error: 'Failed to query Pinecone.', details: error });
        }
        try {
            const results = JSON.parse(data);
            res.json(results);
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse Pinecone response.', details: data });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});