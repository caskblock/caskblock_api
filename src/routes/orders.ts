import { Request, Response } from "express";
import { createOrder, initAirtable } from '../lib/airtable';

export async function postOrder(req: Request, res: Response) {
  const base        = await initAirtable();
  const orderParams = req.body;
  const order       = await createOrder(base, orderParams.tokenID, orderParams.name, orderParams.email, orderParams.walletAddress);

  res.status(200).send(
    order
  );
}
