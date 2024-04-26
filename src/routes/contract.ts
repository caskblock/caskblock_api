import { Request, Response } from "express";
import config from "../config";
import { execute, deployContract } from '@mintbase-js/sdk';

export async function postContract(req: Request, res: Response) {

  const handleDeployContract = async (): Promise<void> => {

    const account = await config.getActorAccount();
  
    const response = await execute(
        {account},
        deployContract({
        factoryContractId: process.env["FACTORY_CONTRACT_ID"] ?? 'mintspace2.testnet',
        name: req.body.contractName,
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