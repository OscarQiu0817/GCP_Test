const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const axios = require('axios');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();  // 讀取 .env 文件

const app = express();
app.use(bodyParser.json());

app.use((req,res,next) => {
  const allowedOrigins = ['http://localhost','http://localhost:8000'];
  const origin = req.headers.origin;
  if( allowedOrigins.includes(origin) ){
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
})

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
cron.schedule('30 9 * * 1-5', () => {
  sendLineNotify('\n目送五點半同仁離開\n點播一首千里之外\nhttps://eip.kli.com.tw');
});

// Schedule a task to run at 00:45 UTC (08:45 Taiwan time) from Monday to Friday
cron.schedule('0 10 * * 1-5', () => {
  sendLineNotify('\n工時填了沒!別忘了到寬聯網站打下班卡~\nhttps://eip.kli.com.tw');
});

cron.schedule('0 7 * * 3', () => {
  sendLineNotify('\n週三警報 ! \n請填寫寬聯雲端工作項目回報, 填完請 done');
});


app.post('/sendLineNotify/:word', (req, res) => {
  const { word } = req.params;
  sendLineNotify(`You just said ${word} `);
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


// const FILE_PATH = path.join(__dirname, 'files', 'git-2.30-binary.tar.gz');

// app.get('/download',(req,res) => {
//     const fileStream = fs.createReadStream(FILE_PATH);
//     res.writeHead(200, {
//       'Content-Type': 'application/octet-stream',
//       'Content-Disposition': `attachment; filename=${path.basename(FILE_PATH)}`
//     });
//     fileStream.pipe(res);
// });



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});