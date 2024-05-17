import { Request, Response } from "express";
import { execute, createMetadata, deployContract, ftDepositStorage } from '@mintbase-js/sdk';
import { Product, initAirtable, getProductData, updateProductStatus } from '../lib/airtable';
import config from "../config";

export async function postContract(req: Request, res: Response) {

  const handleDeployContract = async (): Promise<void> => {

    const account = await config.getActorAccount();

    const deployResponse = await execute(
        {account},
        deployContract({
          factoryContractId: config.keys.mbContractV2,
          name: req.body.contractName ?? '',
          ownerId: process.env["ACTOR_ACCOUNT_ID"] ?? '',
          metadata: {
              symbol: ""
          }
        })
    )

    console.log("response", deployResponse);

    const storageResponse = await execute(
      {account},
      ftDepositStorage({
        accountId: process.env["CONTRACT_ADDRESS"],
        // @ts-ignore
        ftContractAddress: config.keys.ftAddresses.usdc,
      })
    );

    console.log("response", storageResponse);

  }

  handleDeployContract()
  res.status(200).send();
}

export async function postMetadata(req: Request, res: Response) {

  const handleCreateMetadata = async (metadata: Product): Promise<string> => {
    const account  = await config.getActorAccount();

    const {title, description, media, copies, price, distillerySlug} = metadata;

    if (title === '' || description === '' || media === '' || copies === 0 || price === 0 || distillerySlug === '') {
      delete metadata.metadataId;

      res.status(422).send({
        message: `Failed to create metadata, fields specified below must not be empty`,
        metadata: metadata
      });
    }

    const response = await execute(
        {account},
        createMetadata({
          contractAddress: process.env["CONTRACT_ADDRESS"],
          metadata: {
            title: title,
            description: description,
            media: media,
          },
          noReference: true,
          maxSupply: copies,
          price: price ?? 0,
          // @ts-ignore
          ftAddress: config.keys.ftAddresses.usdc,
          ftDecimals: 6,
        })
    );

    if (response && "receipts_outcome" in response){
      const logReceipt = response.receipts_outcome[0].outcome.logs[0];
      const log        = JSON.parse(logReceipt.substring(11));
      const metdataID  = log.data.metadata_id;

      return metdataID;

    } else {
      // Handle the case where the response does not have a result property
      // For example, you can throw an error or return a default value
      throw new Error('Failed to execute createMetadata');
    }
  };

  const productID  = req.query.productID as string;
  const base       = await initAirtable();
  const metadata   = await getProductData(base, productID)
  const metadataID = await handleCreateMetadata(metadata);

  updateProductStatus(base, productID, metadataID);

  res.status(200).send({
    message: `Metadata created successfully for '${metadata.title}'`,
    metadataID: metadataID
  }
  );
}
