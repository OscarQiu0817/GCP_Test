const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();  // 讀取 .env 文件

const app = express();
app.use(bodyParser.json());

const client = redis.createClient({
  url: 'redis://redis:6379'
});

client.connect().catch(console.error);

// 從環境變量中讀取 LINE Notify token
const lineNotifyToken = process.env.LINE_NOTIFY_TOKEN;

// Function to send notification
const sendLineNotify = async (message) => {
  try {
    await axios.post('https://notify-api.line.me/api/notify', 
      `message=${encodeURIComponent(message)}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${lineNotifyToken}`
        }
      }
    );
    console.log('Notification sent');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Schedule a task to run at 00:45 UTC (08:45 Taiwan time) from Monday to Friday
cron.schedule('45 0 * * 1-5', () => {
  sendLineNotify('\n別忘了到寬聯網站打上班卡~\nhttps://eip.kli.com.tw');
});

// Schedule a task to run at 00:45 UTC (08:45 Taiwan time) from Monday to Friday
cron.schedule('5 10 * * 1-5', () => {
  sendLineNotify('\n別忘了到寬聯網站打下班卡~ 謝謝\nhttps://eip.kli.com.tw');
});

app.post('/sendLineNotify/:word', (req, res) => {
  const { word } = req.params;
  sendLineNotify(`You just said ${word} `);
  sendLineNotify('\n別忘了到寬聯網站打下班卡~ 謝謝\nhttps://eip.kli.com.tw');
});

app.post('/data', async (req, res) => {
  try {
    const { key, value } = req.body;
    await client.set(key, value);
    res.send(`Data saved: ${key} = ${value}`);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.get('/data/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await client.get(key);
    res.send(`Data retrieved: ${key} = ${value}`);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.get('/say/:word', (req, res) => {
  const { word } = req.params;
  res.send(`You just said ${word} `);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});