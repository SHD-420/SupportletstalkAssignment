const { MongoClient, ServerApiVersion, Db } = require("mongodb");

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

/**
 * @type {Db} The mongodb database
 */
let _db;
client
  .connect()
  .then((connectedClient) => {
    _db = connectedClient.db(process.env.MONGODB_DB);
  })
  .catch(() => process.exit(1));

module.exports = {
  client,
  db: () => {
    if (_db) return _db;
    throw new Error("Database not loaded");
  },
};