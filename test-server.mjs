import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'API is working!' });
});

app.listen(3401, () => {
  console.log('Test server on port 3401');
});
