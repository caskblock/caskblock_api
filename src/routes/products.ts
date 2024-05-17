import { Request, Response } from "express";
import { initAirtable, getPublishedProductsData, getBurnWindows, getProductData} from '../lib/airtable';

export async function listPublishedProducts(req: Request, res: Response) {
  const base                   = await initAirtable();
  const distillerySlug: string = req.params.distillerySlug as string;

  const products = await getPublishedProductsData(base, distillerySlug);

  res.status(200).send(
    products
  );
}

export async function listBurnWindows(req: Request, res: Response) {
  const base = await initAirtable();

  const metadataIds = req.query.metadataIds as string[];

  const products = await getBurnWindows(base, metadataIds);

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

