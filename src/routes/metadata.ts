import { Request, Response } from "express";
import { Product, initAirtable, getProductData, updateProductStatus } from '../lib/airtable';
import config from "../config";
import { execute, createMetadata } from '@mintbase-js/sdk';

export async function postMetadata(req: Request, res: Response) {

  const handleCreateMetadata = async (metadata: Product): Promise<string> => {

    const account = await config.getActorAccount();

    const response = await execute(
        {account},
        createMetadata({
            contractAddress: process.env["CONTRACT_ADDRESS"],
            metadata: {
                    title: metadata.title,
                    description: metadata.description,
                    media: 'https://i.ibb.co/0yQf0Gw/IMG-20220905-162735-1.jpg',
                },
            noReference: true,
            maxSupply: metadata.copies,
            price: 1,
            ftAddress: process.env["USDC_ADDRESS"],
        })

    );

    console.log('Metadata created successfully');
    console.log(response);

    if (response && "receipts_outcome" in response && "metadata" in response.receipts_outcome[0].outcome) {
      return response?.receipts_outcome?.[0]?.outcome?.metadata?.metadata_id ?? null;
    } else {
      // Handle the case where the response does not have a result property
      // For example, you can throw an error or return a default value
      throw new Error('Failed to execute createMetadata');
    }
  };

  const productID = 'recc4xnr0fPuuRTck';
  const base = await initAirtable();
  const metadata = await getProductData(base, productID)
  const metadataID = await handleCreateMetadata(metadata);
  // updateProductStatus(base, productID, "0");
  res.status(200).send();
}
