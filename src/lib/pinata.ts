import pinataSDK from '@pinata/sdk';

const traits = ['distillerySlug', 'burnWindowStart', 'burnWindowEnd'];

const traitDisplayNames = {
  'distillerySlug': 'Distillery',
  'burnWindowStart': 'Burn Window Start',
  'burnWindowEnd': 'Burn Window End'
}

interface Metadata {
  name: string;
  description: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
}

export async function uploadToIPFS(product: any) {
  const metadata = buildMetadata(product);
  const ipfsHash = await upload(metadata, `${product.id}.json`);

  return ipfsHash;
}

function buildMetadata(product: any) {
  const metadata: Metadata = {
    name: product.title,
    description: product.description,
    image: product.media,
    attributes: []
  };

  Object.keys(product).forEach(key => {
    if (traits.includes(key)) {
      metadata.attributes.push({
        trait_type: displayName(key),
        value: product[key]
      });
    }
  });

  return metadata;
}


function displayName(key: string) {
  return traitDisplayNames[key] || key
}


async function upload(metadata: any, filename: string) {
  try {
    const pinata = new pinataSDK(process.env['PINATA_API_KEY'], process.env['PINATA_API_SECRET']);

    const options = {
      pinataMetadata: {
        name: filename, // Set the name to product.id
      }
    };

    const result = await pinata.pinJSONToIPFS(metadata, options);

    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
  }

  return '';
}
