const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

// Helper to load/save data
const loadData = () => {
  if (!fs.existsSync(DATA_FILE)) return { profile: {}, incidents: [] };
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
};
const saveData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// Endpoints
app.get('/data', (req, res) => {
  res.json(loadData());
});

app.post('/data', (req, res) => {
  saveData(req.body);
  res.json({ status: 'ok' });
});

// Serve static frontend
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
