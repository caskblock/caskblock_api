import { Request, Response } from "express";
import { initAirtable, getDistilleriesData, getDistilleryData } from '../lib/airtable';

export async function listDistilleries(req: Request, res: Response) {
  const base         = await initAirtable();
  const distilleries = await getDistilleriesData(base);

  res.status(200).send(
    distilleries
  );
}

export async function showDistillery(req: Request, res: Response) {
  const base         = await initAirtable();
  const distillerySlug: string = req.params.distillerySlug as string;

  const distillery = await getDistilleryData(base, distillerySlug);
  res.status(200).send(
    distillery
  );
}