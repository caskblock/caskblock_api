import { Request, Response } from "express";
import { initAirtable, listPublishedProducts } from '../lib/airtable';

export async function listProducts(req: Request, res: Response) {
  const base     = await initAirtable();
  const products = await listPublishedProducts(base);

  res.status(200).send(
    products
  );
}
