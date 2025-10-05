// Impor library yang dibutuhkan
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // Memuat variabel dari file .env
const cors = require('cors');

// Konfigurasi dasar
const app = express();
const port = 3000;

// Middleware (fungsi perantara)
app.use(cors()); // Mengizinkan request dari frontend
app.use(express.json()); // Memungkinkan server membaca data JSON yang dikirim
app.use(express.static('public')); // Menyajikan file dari folder 'public' (HTML, CSS, dan script.js Anda)

// Inisialisasi Google Generative AI dengan API Key dari .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Membuat Endpoint API '/generate'
// Ini adalah alamat yang akan dihubungi oleh script.js Anda
app.post('/generate', async (req, res) => {
    try {
        // Mengambil 'prompt' dari body request yang dikirim frontend
        const { prompt } = req.body;

        // Validasi sederhana: pastikan prompt tidak kosong
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Menghubungi API Gemini dengan prompt yang diterima
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Mengirim kembali jawaban dari Gemini ke frontend
        res.json({ aiResponse: text });

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Gagal berkomunikasi dengan Gemini API' });
    }
});

// Menjalankan server
app.listen(port, () => {
    console.log(`🚀 Server berjalan di http://localhost:${port}`);
    console.log('Buka alamat tersebut di browser Anda untuk mengakses aplikasi.');
});