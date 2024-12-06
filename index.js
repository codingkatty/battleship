require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const app = express();
app.use(cookieParser());
app.use(express.static('public'));

const allowedOrigins = ['http://localhost:3000', 'https://codingkatty.github.io'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    }
}));

const upload = multer({ dest: 'uploads/' });

const supabaseUrl = 'https://spujdflzaohvsnolwmnx.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const bucketName = 'pfp-generator';
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;

    if (!file) {
        console.error('No file uploaded.');
        return res.status(400).send('No file uploaded.');
    }

    try {
        const fileBuffer = fs.readFileSync(file.path);

        const mime = require('mime-types');
        const mimeType = mime.lookup(file.originalname) || 'application/octet-stream';

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(file.originalname, fileBuffer, {
                cacheControl: '3600',
                upsert: false,
                contentType: mimeType
            });

        if (error) {
            console.error('Supabase upload error:', error.message);
            throw error;
        }

        console.log('Uploaded file data:', data);

        fs.unlinkSync(file.path);

        res.status(200).send({ path: data.Key });
    } catch (error) {
        console.error('Error uploading file:', error.message);
        res.status(500).send(error.message);
    }
});

app.get('/load', async (req, res) => {
    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .list();

        if (error) {
            console.error('Error listing files:', error.message);
            return res.status(500).send(error.message);
        }

        const urls = data.map(file => {
            const { publicURL, error } = supabase.storage
                .from(bucketName)
                .getPublicUrl(file.name);

            if (error) {
                console.error(`Error getting public URL for ${file.name}:`, error.message);
                return null;
            }

            console.log(`Generated URL for ${file.name}: ${publicURL}`);
            return publicURL;
        });

        res.status(200).send(urls);
    } catch (error) {
        console.error('Unexpected error in /load:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});