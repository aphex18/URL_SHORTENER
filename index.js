import express from 'express';

import cors from 'cors';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

const corsOptions = {
  origin: [
    'https://urlshortener10.vercel.app',      // If you serve frontend on vercel
    'url-shortener-10.up.railway.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

import "dotenv/config";

import userRouter from './routes/user.routes.js';

import urlRouter from './routes/url.routes.js';

import { authenticationMiddleware } from './middlewares/auth.middleware.js';

const app = express();

app.use(cors(corsOptions));


app.use(express.json());

app.use(authenticationMiddleware);

app.use("/user", userRouter);

app.use(urlRouter);

const PORT = process.env.PORT ?? 8000;

app.get('/', (req, res) => {
    return res.json({status: "Server is running"})
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
})





// const corsOptions = {
//   origin: [
//     'http://localhost:3000',      // If you serve frontend on port 3000
//     'http://127.0.0.1:5500',      // VS Code Live Server
//     'http://localhost:5500',      // Alternative Live Server port // else your domain here

//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// };