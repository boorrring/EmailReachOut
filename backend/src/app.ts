import express from "express";
import emailsRouter from "./routes/emails";

const app = express();

app.use(express.json());

app.use("/emails", emailsRouter);

export default app;

