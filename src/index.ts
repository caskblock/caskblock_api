import express, { Express, Request, Response } from "express";
import cors from "cors";

import config from "./config";
import { postPaymentIntent } from "./routes/payment-intent";
import { postStripeWebhook } from "./routes/stripe-webhook";
import { postContract } from "./routes/contract";
import { postMetadata } from "./routes/metadata";

const app: Express = express();
app.use(cors());

app.get("/health", (_: Request, res: Response) => {
  res.status(200).send("Service is healthy");
});
app.post("/payment-intent", express.json(), postPaymentIntent);
app.post("/stripe-webhook", express.text({ type: "*/*" }), postStripeWebhook);
app.post("/contract", express.json(), postContract);
app.post("/metadata", express.json(), postMetadata);

app.listen(config.port, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${config.port}`
  );
});
