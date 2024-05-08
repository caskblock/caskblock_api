import Airtable from 'airtable';
var cache = require('memory-cache');
const PRODUCTS_KEY = 'products';

// Define interface for the record
export interface Product {
  id?: string;
  title?: string;
  description?: string;
  media?: string;
  price?: number;
  copies?: number;
  issued_at?: string;
  expires_at?: string;
  starts_at?: string;
  status?: string;
  metadataId?: string;
}

export function initAirtable() {
  return new Airtable({ apiKey: process.env["AIRTABLE_API_KEY"] }).base(process.env["AIRTABLE_BASE_ID"] || '');
}

function buildProduct(record: any) {
  const { Name, Description, Price, Supply, Image, MetadataID } = record.fields;

  const metadata: Product = {
    id: record.id,
    title: Name,
    description: Description,
    copies: Supply,
    price: Price,
    media: Image,
    metadataId: MetadataID
  };

  return metadata;
}

export async function getProductData(base: any, id: string): Promise<Product> {
  const cachedProducts = cache.get(PRODUCTS_KEY);

  if (cachedProducts) {
    return cachedProducts.find((product: Product) => product.id === id);
  }

  return new Promise((resolve, reject) => {
    base(process.env["AIRTABLE_PRODUCTS"]).find(id, (err: any, record : any) => {
      if (err) {
        console.error('Error querying record:', err);
        return;
      }

      if (record) {
        const metadata: Product = buildProduct(record);
        resolve(metadata); // Return metadata;

      } else {
        console.error('Record not found');
        reject(new Error('Record not found'));
      }
    });

  })
}

export async function updateProductStatus(base: any, id: string, metadataID: string): Promise<void> {
  base(process.env["AIRTABLE_PRODUCTS"]).update(id, {
    Status: 'Published',
    MetadataID: metadataID

  }, (err: any) => {
    if (err) {
      console.error('Error updating record:', err);
      return;
    }
    console.log('Record updated successfully');

    cache.del(PRODUCTS_KEY);
  });
}

export async function listPublishedProducts(base: any): Promise<Product[]> {
  const cachedProducts = cache.get(PRODUCTS_KEY);

  if (cachedProducts) {
    return cachedProducts;
  }

  return new Promise((resolve, reject) => {
    const publishedProducts: Product[] = [];

    base(process.env["AIRTABLE_PRODUCTS"]).select({
      view: "Published"
    }).eachPage((page: any, fetchNextPage: any) => {

      page.forEach((record: any) => {
        if (record.fields.Status === 'Published') {
          publishedProducts.push(buildProduct(record));
        }
      });

      fetchNextPage();
    }, (err: any) => {
      if (err) {
        console.error('Error fetching records:', err);
        reject(err); // Reject the promise if there's an error
        return;
      }

      cache.put(PRODUCTS_KEY, publishedProducts);

      resolve(publishedProducts);
    });
  });
}

export async function createOrder(base: any, tokenID: string, name: string, email: string, walletAddress: string, transactionHx: string): Promise<void> {
  base(process.env["AIRTABLE_ORDERS"]).create({
    TokenID: tokenID,
    Name: name,
    Email: email,
    WalletAddress: walletAddress,
    TransactionHx: transactionHx,
  }, (err: any) => {
    if (err) {
      console.error('Error creating record:', err);
      return;
    }
    console.log('Record created successfully');
  });
}
