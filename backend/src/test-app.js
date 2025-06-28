import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Basic API working' });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});