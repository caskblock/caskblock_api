import { Request, Response } from "express";
import { createOrder, initAirtable } from '../lib/airtable';

export async function postOrder(req: Request, res: Response) {

  const base = await initAirtable();

  const { tokenID, name, email, walletAddress, transactionHx } = req.body;

  const order = await createOrder(base, tokenID, name, email, walletAddress, transactionHx);

  res.status(200).send(
    order
  );
}
