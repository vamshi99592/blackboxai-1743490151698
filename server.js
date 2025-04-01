require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const { OpenAI } = require('openai');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(express.json());
const port = process.env.PORT || 8000;

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    req.user = await admin.auth().verifyIdToken(idToken);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// API endpoint for answer analysis
app.post('/api/analyze', authenticate, async (req, res) => {
  try {
    const { question, answer } = req.body;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Analyze the student's answer for correctness and provide detailed feedback."
      }, {
        role: "user",
        content: `Question: ${question}\nStudent Answer: ${answer}\n\nProvide analysis:`
      }],
      temperature: 0.7,
      max_tokens: 500
    });

    res.json({ analysis: response.choices[0].message.content });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Serve static files
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`AI Study Tool server running on port ${port}`);
});