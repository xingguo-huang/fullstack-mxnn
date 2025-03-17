import { MongoClient, Db, ServerApiVersion } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDb() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.karil.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.${process.env.MONGODB_CLUSTER}.mongodb.net/ecommerce-nextjs?retryWrites=true&w=majority`;

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  await client.connect();

  cachedClient = client;
  cachedDb = client.db('ecommerce-nextjs');

  return { client, db: client.db('ecommerce-nextjs') }
}