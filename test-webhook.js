const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// const url = 'http://localhost:3000/webhook/line';
const url = 'https://somewhere-funky-formats-instructions.trycloudflare.com/webhook/line';
const secret = process.env.LINE_CHANNEL_SECRET || 'your_channel_secret_here';

const body = JSON.stringify({
    events: [
        {
            type: 'message',
            message: {
                type: 'text',
                id: '123456789',
                text: 'Hello test from local script!',
            },
            timestamp: Date.now(),
            source: {
                type: 'user',
                userId: 'U1234567890abcdef',
            },
            replyToken: 'test-reply-token',
            mode: 'active',
        },
    ],
    destination: 'Uxxxxxxxxxxxxxx',
});

const signature = crypto
    .createHmac('sha256', secret)
    .update(Buffer.from(body))
    .digest('base64');

console.log('🚀 Sending test LINE event...');
console.log('📡 URL:', url);
console.log('🔑 Signature:', signature);

axios.post(url, body, {
    headers: {
        'Content-Type': 'application/json',
        'X-Line-Signature': signature,
    },
})
    .then(response => {
        console.log('✅ Success:', response.status, response.data);
    })
    .catch(error => {
        console.error('❌ Error:', error.response ? error.response.status : error.message);
        if (error.response) {
            console.error('📄 Response Data:', error.response.data);
        }
    });
