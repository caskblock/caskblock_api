import { Request, Response } from "express";
import { createOrder, initAirtable, updateOrder } from '../lib/airtable';

export async function postOrder(req: Request, res: Response) {

  const base = await initAirtable();

  const { tokenId, walletAddress, name, surname, email, idCard, vat, propertyName, propertyVat, address, country } = req.body;

  const orderId = await createOrder(base, tokenId, walletAddress, name, surname, email, idCard, vat, propertyName, propertyVat, address, country);
  res.status(200).send(
    {orderId: orderId}
  );
};

export async function putOrder(req: Request, res: Response) {

  const base = await initAirtable();

  const { orderId } = req.params;
  const { transactionHx } = req.body;

  const order = await updateOrder(base, orderId, transactionHx);

  res.status(200).send(
    order
  );
};