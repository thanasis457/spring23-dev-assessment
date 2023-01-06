import { MongoClient } from "mongodb";

// Connection URL
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

let _db;

export default {
  connectToServer: async () => {
    const db = await client.connect();
    if (db) {
      _db = db.db("BitsOfGood");
      console.log("Successfully connected to MongoDB.");
    }
  },
  getDb: function () {
    return _db;
  },
};
