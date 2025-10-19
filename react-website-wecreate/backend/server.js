const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware - Updated CORS for production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Generate image endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { imageBase64, prompt, strength } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const API_URL = 'https://modelslab.com/api/v6/realtime/img2img';

    console.log('🎨 Sending base64 image to ModelsLab...');

    const body = {
      key: process.env.MODELLABS_API_KEY,
      model_id: 'seedream-4',
      prompt: prompt || 'enhance this drawing, make it beautiful and artistic',
      init_image: imageBase64,
      width: 512,
      height: 512,
      samples: 1,
      num_inference_steps: 30,
      guidance_scale: 7.5,
      strength: strength || 0.98,
      safety_checker: false,
      base64: 'yes',
      enhance_prompt: true,
      instant_response: false,
      n_samples: 1,
      negative_prompt: "ugly, blurry, bad anatomy",
      opacity: 0.7,
      outdir: 'out',
      padding_down: 10,
      padding_right: 10,
      scale_down: 6,
      seed: null,
      temp: false,
      watermark: 'no'
    };

    const response = await axios.post(API_URL, body, {
      headers: { 'Content-Type': 'application/json' }
    });

    const data = response.data;
    console.log('🧠 ModelsLab status:', data.status);

    // If still processing, wait and refetch
    if (data.status === 'processing' && data.fetch_result) {
      console.log(`⏳ Processing... ETA ${data.eta}s`);
      await new Promise(r => setTimeout(r, (data.eta + 1) * 1000));

      const fetchResponse = await axios.post(data.fetch_result, {
        key: process.env.MODELLABS_API_KEY
      });

      const fetched = fetchResponse.data;
      console.log('✅ Fetched result, status:', fetched.status);
      if (fetched.status === 'success' && fetched.output) {
        let imageUrl = Array.isArray(fetched.output) ? fetched.output[0] : fetched.output;
        
        // If the URL ends with .base64, fetch the actual base64 content
        if (imageUrl.endsWith('.base64')) {
          console.log('📥 Fetching base64 content from:', imageUrl);
          const base64Response = await axios.get(imageUrl);
          const base64Data = base64Response.data;
          console.log('✅ Got base64 data, length:', base64Data.length);
          return res.json({ success: true, output: base64Data });
        }
        
        return res.json({ success: true, output: fetched.output });
      } else {
        throw new Error(fetched.message || 'Failed to fetch result');
      }
    }

    if (data.status === 'success' && data.output) {
      console.log('✅ Success! Output:', data.output);
      
      let imageUrl = Array.isArray(data.output) ? data.output[0] : data.output;
      
      // If the URL ends with .base64, fetch the actual base64 content
      if (imageUrl.endsWith('.base64')) {
        console.log('📥 Fetching base64 content from:', imageUrl);
        const base64Response = await axios.get(imageUrl);
        const base64Data = base64Response.data;
        console.log('✅ Got base64 data, length:', base64Data.length);
        return res.json({ success: true, output: base64Data });
      }
      
      return res.json({ success: true, output: data.output });
    }

    throw new Error(data.message || 'Unknown API response');
  } catch (error) {
    console.error('❌ ModelsLab error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message,
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ API key ${process.env.MODELLABS_API_KEY ? 'loaded' : 'NOT FOUND'}`);
  console.log(`✅ CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});