const express = require('express');
const app = express();
const PORT = 3003;

app.get('/', (req, res) => {
  console.log('Request received');
  res.send('Minimal server works');
});

app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
