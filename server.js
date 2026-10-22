
require('dotenv').config();

const express = require('express');
const path = require('path');
const OpenAI = require('openai');
const connectDB = require('./config/db');
const vlogRoutes = require('./routes/vlogRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming JSON requests
app.use(express.json());

// Serve frontend files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Health check API
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'TripGuide',
    aiConfigured: Boolean(process.env.OPENAI_API_KEY)
  });
});


const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// AI Chat API
app.post('/api/chat', async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({
        error: 'AI API key configured nahi hai. .env file check karo.'
      });
    }

    const { message, history = [] } = req.body || {};

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Apna question type karo.'
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: 'Message 4000 characters se chhota rakho.'
      });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            item =>
              item &&
              ['user', 'assistant'].includes(item.role) &&
              typeof item.content === 'string'
          )
          .slice(-8)
          .map(item => ({
            role: item.role,
            content: item.content.slice(0, 2000)
          }))
      : [];

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      instructions: `
        You are TripGuide AI, a helpful travel planning assistant.
        Help users plan trips, discover destinations, prepare itineraries,
        and estimate travel budgets.
        Respond in the language the user uses, including Hindi or English.
        Never invent live weather, current prices, or hotel availability.
        Clearly label estimates and explain when live data needs checking.
      `,
      input: [
        ...safeHistory,
        {
          role: 'user',
          content: message.trim()
        }
      ],
      max_output_tokens: 700
    });

    res.json({
      reply: response.output_text || 'Abhi response nahi mil paya.'
    });
  } catch (error) {
    console.error('AI request failed:', error.status || '', error.message);

    let msg = 'AI response nahi mil paya. Server logs check karo.';
    if (error instanceof TypeError && /create/.test(error.message)) {
      msg = 'OpenAI package purana hai. Terminal mein "npm install openai@latest" chalao aur server restart karo.';
    } else if (error.status === 401) {
      msg = 'OpenAI API key galat hai ya expire ho gayi. .env mein OPENAI_API_KEY check karo.';
    } else if (error.status === 404) {
      msg = 'Model nahi mila. .env mein OPENAI_MODEL ka naam check karo (ya us line ko hata do).';
    } else if (error.status === 429) {
      msg = 'OpenAI quota/limit khatam ho gayi. Billing ya usage check karo.';
    }

    res.status(500).json({ error: msg });
  }
});

// Vlog API routes
app.use('/api/vlogs', vlogRoutes);

// Frontend fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to MongoDB before starting the server
async function startServer() {
  try {
    await connectDB();
  } catch (error) {
    console.error('MongoDB connect nahi hua (vlogs band rahenge):', error.message);
  }

  app.listen(PORT, () => {
    console.log(`TripGuide running at http://localhost:${PORT}`);
  });
}

startServer();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
