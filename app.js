const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const client = redis.createClient({
  url: 'redis://redis:6379'
});

client.connect().catch(console.error);

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


