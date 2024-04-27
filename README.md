### Required config

###### Create ENV file with the following vars:

- USDC_ADDRESS=usdc.fakes.testnet
- NEAR_NETWORK=testnet
- FACTORY_CONTRACT_ID=mintspace3.testnet
- STRIPE_SECRET_KEY=STRIPE_SECRET_KEY
- STRIBE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET

###### Generate account and export secret key, then add the following to the env vars:

- ACTOR_ACCOUNT_ID=
- ACTOR_SECRET_KEY=

###### Call contract endpoint to generate a v2 contract passing the contract's desired name in the request's body as a JSON:
`{ "contractName": "CONTRACT_NAME" }`

###### Add generated contract address to the env vars:

- CONTRACT_ADDRESS=CONTRACT_NAME.mintspace3.testnet

###### Call metadata endpoint to generate metadata passing the following attributes in the request's body as a JSON:
`{
    "name": "NAME",
    "description": "DESCRIPTION",
    "media": "MEDIA_URL",
    "maxSupply": MAX_SUPPLY,
    "price": PRICE
}`

