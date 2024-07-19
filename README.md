### Required config

###### Create ENV file with the following vars:

- NEAR_NETWORK=testnet
- AIRTABLE_API_KEY
- AIRTABLE_BASE_ID
- AIRTABLE_PRODUCTS
- AIRTABLE_ORDERS

- ADMIN_ACCESS_KEY
- ADMIN_PATH

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

