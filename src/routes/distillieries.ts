import { Request, Response } from "express";
import { initAirtable, getDistilleriesData } from '../lib/airtable';

export async function listDistilleries(req: Request, res: Response) {
  const base         = await initAirtable();
  const distilleries = await getDistilleriesData(base);

  res.status(200).send(
    distilleries
  );
}