import { Request, Response } from "express";
import { initAirtable, listPublishedProducts, getProductData } from '../lib/airtable';

export async function listProducts(req: Request, res: Response) {
  const base     = await initAirtable();
  const products = await listPublishedProducts(base);

  res.status(200).send(
    products
  );
}

export async function showProduct(req: Request, res: Response) {

  const productId = req.params.id;

  const base      = await initAirtable();
  const product   = await getProductData(base, productId);

  res.status(200).send(
    product
  );
}

