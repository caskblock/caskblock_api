import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";

import config from "./config";
import { postPaymentIntent } from "./routes/payment-intent";
import { postStripeWebhook } from "./routes/stripe-webhook";
import { postContract } from "./routes/contract";
import { postMetadata } from "./routes/metadata";
import { listProducts } from "./routes/listProducts";

// maybe switch to basic authentication in the future
const validateKey = (req: Request, res: Response, next: NextFunction) => {
  const key = req.query.key as string;
  if (key === undefined || key !== process.env["ADMIN_ACCESS_KEY"]) {
    return res.status(401).send("Unauthorized");
  }
  next();
};

const app: Express = express();
app.use(cors());

app.get("/health", (_: Request, res: Response) => {
  res.status(200).send("Service is healthy");
});

app.post("/payment-intent", express.json(), postPaymentIntent);
app.post("/stripe-webhook", express.text({ type: "*/*" }), postStripeWebhook);
app.get("/products", express.json(), listProducts);

const adminRouter = express.Router();
adminRouter.post("/contract", validateKey, express.json(), postContract);
adminRouter.post("/metadata", validateKey, express.json(), postMetadata);
app.use("/" + process.env["ADMIN_PATH"], adminRouter);

app.listen(config.port, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${config.port}`
  );
});
