import { Request, Response } from "express";
import config from "../config";
import { execute, deployContract } from '@mintbase-js/sdk';

export async function postContract(req: Request, res: Response) {

  const handleDeployContract = async (): Promise<void> => {

    const account = await config.getActorAccount();

    const response = await execute(
        //because no contract factory id is provided it defaults to 'mintspace2.testnet'
        {account},
        deployContract({
        factoryContractId: 'mintspace3.testnet',
        name: 'secondMintbaseV2',
        ownerId: process.env["ACTOR_ACCOUNT_ID"] ?? 'finalmintbaseaccount.testnet',
        metadata: {
            symbol: ""
        }
        })
    )

    console.log("response", response);
  }


  handleDeployContract()
  res.status(200).send();
}