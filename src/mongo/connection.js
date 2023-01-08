import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.DATABASE_URI);

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
