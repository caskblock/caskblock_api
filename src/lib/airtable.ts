import Airtable from 'airtable';

// Define interface for the record
export interface Product {
  title?: string;
  description?: string;
  media?: string;
  price?: number;
  copies?: number;
  issued_at?: string;
  expires_at?: string;
  starts_at?: string;
  status?: string;
}

export function initAirtable() {
  return new Airtable({ apiKey: process.env["AIRTABLE_API_KEY"] }).base(process.env["AIRTABLE_BASE_ID"] || '');
}

function buildProduct(record: any) {
  const { Name, Description, Price, Supply } = record.fields;

  const metadata: Product = {
    title: Name,
    description: Description,
    copies: Supply,
    price: Price
  };

  return metadata;
}

export async function getProductData(base: any, id: string): Promise<Product> {
  return new Promise((resolve, reject) => {
    base(process.env["AIRTABLE_TABLE_NAME"]).find(id, (err: any, record : any) => {
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

  base(process.env["AIRTABLE_TABLE_NAME"]).update(id, {
    Status: 'Published',
    MetadataID: metadataID

  }, (err: any) => {
    if (err) {
      console.error('Error updating record:', err);
      return;
    }
    console.log('Record updated successfully');
  });
}

export async function listPublishedProducts(base: any): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const publishedProducts: Product[] = [];

    base(process.env["AIRTABLE_TABLE_NAME"]).select({
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

      resolve(publishedProducts);
    });
  });
}

