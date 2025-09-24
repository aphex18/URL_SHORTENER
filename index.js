import express from 'express';

import "dotenv/config";

import userRouter from './routes/user.routes.js';

const app = express();

app.use(express.json());

app.use("/user", userRouter);

const PORT = process.env.PORT ?? 8000;

app.get('/', (req, res) => {
    return res.json({status: "Server is running"})
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})