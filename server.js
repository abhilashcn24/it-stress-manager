require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs'); // Import the fs module

const app = express();
const port = 3000;

// Read the knowledge bank file
let knowledgeBank = '';
try {
    knowledgeBank = fs.readFileSync(path.join(__dirname, 'knowledge_bank.txt'), 'utf8');
} catch (err) {
    console.error('Error reading knowledge bank file:', err);
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
        const prompt = `${knowledgeBank}\n\nThe user is seeking wellness advice or has a question about the Solvia application. Here is their message: \"${userMessage}\". Respond in a supportive and helpful tone, using the provided information about Solvia to answer any questions about the application.`;
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});