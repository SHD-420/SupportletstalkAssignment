require("dotenv").config();
const { ObjectId } = require("mongodb");
const { collection } = require("./db");
const express = require("express");
const { join } = require("path");

const app = express();

app.use(express.json());

app.get("/", (_, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

/**
 *
 * Middleware to parse mongodb compatible ObjectId from req.params and
 * attach attach it to req object like: req.id
 *
 * @param {import("express").Request} req The express reqeuest object
 * @param {import("express").Response} res The express response object
 * @param {()=>void} next The next middleware in chain
 */
function parseObjectIdFromUrl(req, res, next) {
  try {
    req.id = new ObjectId(req.params.id);
    next();
  } catch (error) {
    // incase ObjectId constructor fails due to invalid "req.params.id" input
    res.status(404).json(null);
    return null;
  }
}

// list all the document ids
app.get("/data", async (_, res) => {
  const data = await collection().find().project({ _id: true }).toArray();
  return res.send(data.map(({ _id }) => _id));
});

// fetch one document
app.get("/data/:id", parseObjectIdFromUrl, async (req, res) => {
  const data = await collection().findOne(req.id);
  if (!data) return res.status(404).json(null);
  return res.json(data);
});

// create a new document
app.post("/data", async (req, res) => {
  const data = req.body;
  const { acknowledged, insertedId } = await collection().insertOne(data);
  if (!acknowledged) {
    return res.status(500).json(null);
  }
  return res.json({ _id: insertedId, ...data });
});

// update an existing document
app.patch("/data/:id", parseObjectIdFromUrl, async (req, res) => {
  const { matchedCount } = await collection().updateOne(
    { _id: req.id },
    { $set: req.body }
  );

  if (!matchedCount) {
    return res.status(404).json(null);
  }
  return res.json({ _id: req.id });
});

// delete a document
app.delete("/data/:id", parseObjectIdFromUrl, async (req, res) => {
  const { deletedCount } = await collection().deleteOne({ _id: req.id });

  if (!deletedCount) {
    return res.status(404).json(null);
  }

  return res.json({ _id: req.id });
});

app.listen(8000, () => console.log("App running on port 8000"));
