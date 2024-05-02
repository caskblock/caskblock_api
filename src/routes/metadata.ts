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
            price: metadata.price,
            // ftAddress: process.env["USDC_ADDRESS"],
            // ftDecimals: 6,
        })

    );

    if (response && "receipts_outcome" in response){
      const logReceipt = response.receipts_outcome[0].outcome.logs[0];
      const log = JSON.parse(logReceipt.substring(11));
      const metdataID = log.data.metadata_id;
      return metdataID;

    } else {
      // Handle the case where the response does not have a result property
      // For example, you can throw an error or return a default value
      throw new Error('Failed to execute createMetadata');
    }
  };

  const productID = req.query.productID as string;
  const base = await initAirtable();
  const metadata = await getProductData(base, productID)
  const metadataID = await handleCreateMetadata(metadata);
  updateProductStatus(base, productID, metadataID);
  res.status(200).send({
    message: `Metadata created successfully for '${metadata.title}'`,
    metadataID: metadataID
  }
  );
}
