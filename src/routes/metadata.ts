import { Request, Response } from "express";
import config from "../config";
import { execute, createMetadata } from '@mintbase-js/sdk';

export async function postMetadata(req: Request, res: Response) {
  const handleCreateMetadata = async (): Promise<void> => {
    
    const account = await config.getActorAccount();

    const response = await execute(
        {account},
        createMetadata({ 
            contractAddress: process.env["CONTRACT_ADDRESS"], 
            metadata: { 
                    title: req.body.name,
                    description: req.body.description,
                    media: req.body.media,
                },
            noReference: true,
            maxSupply: req.body.maxSupply,
            price: req.body.price,
            ftAddress: process.env["USDC_ADDRESS"],
        })
        
    );
    console.log("response", response);
  };

  handleCreateMetadata();
  res.status(200).send();
}