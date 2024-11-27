const express = require('express');
const axios = require('axios');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // CORS middleware

const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;
const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B';

app.post('/generate-content', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await axios.post(
      HF_MODEL_URL,
      { 
        inputs: prompt,
        parameters: { max_length: 100, temperature: 0.7 },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
        },
      }
    );

    res.json({ content: response.data[0].generated_text });
  } catch (error) {
    console.error('Error response:', error.response?.data || error.message);
    res.status(500).json({ error: 'Content generation failed' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
