import { Request, Response } from "express";
import { initAirtable, getProductData } from '../lib/airtable';

export async function showProduct(req: Request, res: Response) {

  const productId = req.params.id;

  const base      = await initAirtable();
  const product   = await getProductData(base, productId);

  res.status(200).send(
    product
  );
}
