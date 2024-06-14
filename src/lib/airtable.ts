import Airtable from 'airtable';
var cache = require('memory-cache');
const PUBLISHED_PRODUCTS_KEY = 'published_products';
const BURN_WINDOWS_KEYS = 'burn_windows';
const DISTILLERIES_KEY = 'distilleries';

// Define interface for the record
export interface Product {
  id?: string;
  title?: string;
  description?: string;
  media?: string;
  price?: number;
  copies?: number;
  status?: string;
  metadataId?: string;
  distillerySlug?: string;
  burnWindowStart?: string;
  burnWindowEnd?: string;
  productType?: string;
  country?: string;
  brand?: string;
  cask?: string;
  style?: string;
  alcohol?: string;
  volume?: string;
}

export interface Distillery {
  id?: string;
  title?: string;
  description?: string;
  slug?: string;
  status?: string;
  media?: string;
  hasProducts?: boolean;
}

interface Filter {
  view?: string;
  filterByFormula?: string;
}

interface BurnWindow {
  metadataId?: string;
  burnWindowStart?: string;
  burnWindowEnd?: string;
}

export function initAirtable() {
  return new Airtable({ apiKey: process.env["AIRTABLE_API_KEY"] }).base(process.env["AIRTABLE_BASE_ID"] || '');
}

function buildProduct(record: any) {
  const { Name, Description, Price, Supply, Image, MetadataID, DistillerySlug, BurnWindowStart, BurnWindowEnd,
          ProductType, Country, Brand, Cask, Style, Alcohol, Volume } = record.fields;

  const metadata: Product = {
    id: record.id,
    title: Name || '',
    description: Description || '',
    copies: Supply || 0,
    price: Price || 0,
    media: Image || '',
    metadataId: MetadataID || '',
    distillerySlug: DistillerySlug && DistillerySlug.length > 0 ? DistillerySlug[0] : '',
    burnWindowStart: BurnWindowStart || '',
    burnWindowEnd: BurnWindowEnd || '',
    productType: ProductType || '',
    country: Country || '',
    brand: Brand || '',
    cask: Cask || '',
    style: Style || '',
    alcohol: Alcohol || '',
    volume: Volume || '',
  };

  return metadata;
}

function buildDestillery(record: any) {
  const { Name, Description, Slug, ImageCover, Status, Products } = record.fields;

  const hasProducts = Products && Products.length > 0;

  const distillery: Distillery = {
    id: record.id,
    title: Name,
    description: Description,
    slug: Slug,
    media: ImageCover,
    status: Status,
    hasProducts: hasProducts,
  };

  return distillery;
}

export async function getProductData(base: any, id: string): Promise<Product> {
  const cachedProducts = cache.get(PUBLISHED_PRODUCTS_KEY);

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

const filterBurnWindowsWithMetadataIds = (burnWindows: BurnWindow[], metadataIds: string[]) => {
  return burnWindows.filter((burnWindow: BurnWindow) => metadataIds.includes(burnWindow.metadataId as string));
}

export async function getBurnWindows(base: any, metadataIds?: string[]): Promise<Product[]> {
  const cachedWindows = cache.get(BURN_WINDOWS_KEYS);

  if (cachedWindows) {
    return filterBurnWindowsWithMetadataIds(cachedWindows, metadataIds as string[]);
  }

  const publishedProducts = await getPublishedProductsData(base);

  const burnWindows = publishedProducts.map((product: Product) => ({
    metadataId: product.metadataId,
    burnWindowStart: product.burnWindowStart,
    burnWindowEnd: product.burnWindowEnd
  }));

  cache.put(BURN_WINDOWS_KEYS, burnWindows);

  return filterBurnWindowsWithMetadataIds(burnWindows, metadataIds as string[]);
}


const filterProductsByDistillerySlug = (products: Product[], distillerySlug: string) => {
  return products.filter((product: Product) => product.distillerySlug === distillerySlug);
}

export async function getPublishedProductsData(base: any, distillerySlug?: string): Promise<Product[]> {
  const cachedProducts = cache.get(PUBLISHED_PRODUCTS_KEY);

  if (cachedProducts) {
    const filteredProducts = distillerySlug ? filterProductsByDistillerySlug(cachedProducts, distillerySlug) : cachedProducts;
    return filteredProducts;
  }

  return new Promise((resolve, reject) => {
    const publishedProducts: Product[] = [];

    const filter: Filter = { view: "Published" };

    base(process.env["AIRTABLE_PRODUCTS"]).select(
      filter
    ).eachPage((page: any, fetchNextPage: any) => {

      page.forEach((record: any) => {
        try {
          if (record.fields.Status === 'Published') {
            publishedProducts.push(buildProduct(record));
          }
        } catch (err) {
          console.log('Error inside eachPage:', err)
        }
      });

      fetchNextPage();
    }, (err: any) => {
      if (err) {
        console.error('Error fetching records:', err);
        reject(err); // Reject the promise if there's an error
        return;
      }

      cache.put(PUBLISHED_PRODUCTS_KEY, publishedProducts);

      const filteredProducts = distillerySlug ? filterProductsByDistillerySlug(publishedProducts, distillerySlug) : publishedProducts;
      resolve(filteredProducts);
    });
  });
}

export async function getDistilleryData(base: any, distillerySlug: string): Promise<Distillery> {
  const distilleries = await getDistilleriesData(base);

  const distillery = distilleries.find((distillery: Distillery) => distillery.slug === distillerySlug);
  return distillery as Distillery;
}

export async function getDistilleriesData(base: any): Promise<Distillery[]> {
  const cachedDistilleries = cache.get(DISTILLERIES_KEY);

  if (cachedDistilleries) {
    return cachedDistilleries;
  }

  return new Promise((resolve, reject) => {
    const distilleries: Distillery[] = [];

    base(process.env["AIRTABLE_DISTILLERIES"]).select().eachPage((page: any, fetchNextPage: any) => {

      page.forEach((record: any) => {
        distilleries.push(buildDestillery(record));
      });

      fetchNextPage();
    }, (err: any) => {
      if (err) {
        console.error('Error fetching records:', err);
        reject(err); // Reject the promise if there's an error
        return;
      }

      cache.put(DISTILLERIES_KEY, distilleries);

      resolve(distilleries);
    });
  });
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

    cache.del(BURN_WINDOWS_KEYS);
    cache.del(PUBLISHED_PRODUCTS_KEY);
  });
}

export async function createOrder(base: any, tokenId: string, walletAddress: string, name: string, surname: string, email: string, idCard: string, vat: string, propertyName: string, propertyVat: string, address: string, country: string): Promise<void> {
  try {
    const requiredFields = [name, surname, email, idCard, vat, propertyName, propertyVat, address, country];

    if (requiredFields.some(field => !field || field.trim() === "")) {
      throw new Error('Missing required parameters');
    }

    const metadataId = tokenId.split(':')[0];

    const cachedProducts = cache.get(PUBLISHED_PRODUCTS_KEY);
    const product = cachedProducts.find((product: Product) => product.metadataId === metadataId);
    const productType = product?.productType;

    const record = await base(process.env["AIRTABLE_ORDERS"]).create({
      TokenID: tokenId,
      WalletAddress: walletAddress,
      Name: name,
      Surname: surname,
      Email: email,
      IDCard: idCard,
      VAT: vat,
      PropertyName: propertyName,
      PropertyVAT: propertyVat,
      Address: address,
      Country: country,
      ProductType: productType,
    });

    console.log('Record created successfully:', record.id);
    return record.id;
  } catch (err) {
    console.error('Error creating record:', err);
    return;
  }
}

export async function updateOrder(base: any, orderId: string, transactionHx: string): Promise<void> {
  base(process.env["AIRTABLE_ORDERS"]).update(orderId, {
    TransactionHx: transactionHx
  }, (err: any) => {
    if (err) {
      console.error('Error updating record:', err);
      return;
    }
    console.log('Record updated successfully');
  });
}
