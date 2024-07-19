import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";

import { postMetadata } from "./routes/admin";
import { listPublishedProducts, listBurnWindows, showProduct }  from "./routes/products";
import { listDistilleries, showDistillery } from "./routes/distillieries";

import { postOrder, putOrder } from "./routes/orders";
import config from "./config";

// TODO: switch to basic authentication in the future
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

app.get("/product/:id",                   express.json(), showProduct);

app.get("/products/burn_windows",         express.json(), listBurnWindows);
app.get("/products/:distillerySlug",      express.json(), listPublishedProducts);
app.get("/products",                      express.json(), listPublishedProducts);

app.get("/distilleries/:distillerySlug",  express.json(), showDistillery);
app.get("/distilleries",                  express.json(), listDistilleries);

app.put("/orders/:orderId", express.json(), putOrder);
app.post("/orders", express.json(), postOrder);

const adminRouter = express.Router();
// adminRouter.post("/contract", validateKey, express.json(), postContract);
adminRouter.get("/metadata", validateKey, express.json(), postMetadata);
app.use("/" + process.env["ADMIN_PATH"], adminRouter);

app.listen(config.port, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${config.port}`
  );
});
