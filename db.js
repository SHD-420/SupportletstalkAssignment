const { MongoClient, ServerApiVersion } = require("mongodb");

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

/**
 * @type {import("mongodb").Collection} The mongodb collection
 */
let _collection;

client
  .connect()
  .then((connectedClient) => {
    _collection = connectedClient.db(process.env.MONGODB_DB).collection("data");
  })
  .catch(() => process.exit(1));

module.exports = {
  client,

  /**
   * @returns The mongodb collection
   */
  collection: () => {
    if (_collection) return _collection;
    throw new Error("Database not loaded");
  },
};
