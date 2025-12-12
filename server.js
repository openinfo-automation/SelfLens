// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000; // Render will provide PORT

// Serve all static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle SPA: send index.html for any route not matching a static file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`SelfLens running on port ${PORT}`);
});
