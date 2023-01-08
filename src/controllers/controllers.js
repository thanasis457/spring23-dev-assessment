// Controllers assume data is formatted correctly (formatted by the caller/route file)
import { ObjectID } from "bson";
import dbo from "../mongo/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Multer from "multer";
import { Storage } from "@google-cloud/storage";
import uuidv1 from "uuidv1";

const whitelistImage = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const whitelistVideo = [
  "video/mp4",
  "video/mpeg",
  "video/ogg",
  "video/webm",
  "video/quicktime",
];

const storage = new Storage({
  keyFilename: process.env.GCS_KEYFILE,
});

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: { fileSize: 100000000 },
});

const bucket = storage.bucket(process.env.GCS_BUCKET);

async function addUser(newUser) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(newUser.password, saltRounds);
  newUser.password = hash;
  await dbo.getDb().collection("Users").insertOne(newUser);
}

async function addAnimal(newAnimal) {
  await dbo.getDb().collection("Animals").insertOne(newAnimal);
}

async function addTraining(newTraining) {
  const validOwner = (
    await dbo.getDb().collection("Animals").findOne({ _id: newTraining.animal })
  ).owner;
  if (!validOwner || !validOwner.equals(newTraining.user)) {
    throw 400;
  }
  await dbo.getDb().collection("Training").insertOne(newTraining);
}

async function getUsers({
  limit = 20,
  lastIndex = ObjectID("0".repeat(24)),
} = {}) {
  const users = await dbo
    .getDb()
    .collection("Users")
    .find({ _id: { $gt: lastIndex } })
    .sort({ _id: 1 })
    .limit(limit)
    .project({ password: false })
    .toArray();
  return users;
}

async function getAnimals({
  limit = 20,
  lastIndex = ObjectID("0".repeat(24)),
} = {}) {
  const animals = await dbo
    .getDb()
    .collection("Animals")
    .find({ _id: { $gt: lastIndex } })
    .sort({ _id: 1 })
    .limit(limit)
    .toArray();
  return animals;
}

async function getTraining({
  limit = 20,
  lastIndex = ObjectID("0".repeat(24)),
} = {}) {
  const training = await dbo
    .getDb()
    .collection("Training")
    .find({ _id: { $gt: lastIndex } })
    .sort({ _id: 1 })
    .limit(limit)
    .toArray();
  return training;
}

async function validateEmailPassword(email, password) {
  const user = await dbo.getDb().collection("Users").findOne({ email: email });

  if (!user) throw "Email not matched to any user";
  const res = await bcrypt.compare(password, user.password);
  if (res) {
    return user;
  }
  throw "Email and password do not match";
}

function issueJWT(payload = {}, secretJWT = process.env.JWT_STRING) {
  const token = jwt.sign(payload, secretJWT, { expiresIn: "30 minutes" });
  return token;
}

async function AuthMiddleware(req, res, next) {
  try {
    //Getting token from headers
    let token = req.headers.authorization.split(" ")[1];
    //Veirfying token
    req.payload = jwt.verify(token, process.env.JWT_STRING);
    return next();
  } catch (err) {
    console.log(err);
    return res.sendStatus(401);
  }
}

const multerMiddleware = multer.single("file");
const multerMiddlewareFilter = (req, res, next) => {
  if (!req.file) return res.sendStatus(500);
  if (req.body.type == "UserProfile" || req.body.type == "AnimalProfile") {
    if (whitelistImage.includes(req.file.mimetype)) {
      return next();
    } else {
      return res.sendStatus(500);
    }
  } else if (req.body.type == "TrainingVideo") {
    if (whitelistVideo.includes(req.file.mimetype)) {
      return next();
    } else {
      return res.sendStatus(500);
    }
  }
};

function uploadHandler(file, db_id, fileType) {
  return new Promise((resolve, reject) => {
    //Prepare stream
    const newFileName = uuidv1() + "-" + file.originalname;
    const blob = bucket.file(newFileName);
    const blobStream = blob.createWriteStream();

    //Upload to Google Cloud Storage
    blobStream.on("error", (err) => reject(err));
    blobStream.on("finish", async () => {
      //Update user with profile URL
      const publicUrl = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${blob.name}`;
      try {
        if (fileType == "UserProfile") {
          const res = await dbo
            .getDb()
            .collection("Users")
            .updateOne({ _id: db_id }, { $set: { profilePicture: publicUrl } });
          if (!res.matchedCount) {
            throw new Error();
          }
          resolve();
        } else if (fileType == "AnimalProfile") {
          const res = await dbo
            .getDb()
            .collection("Animals")
            .updateOne({ _id: db_id }, { $set: { profilePicture: publicUrl } });
          if (!res.matchedCount) {
            throw new Error();
          }
          resolve();
        } else if (fileType == "TrainingVideo") {
          const res = await dbo
            .getDb()
            .collection("Training")
            .updateOne({ _id: db_id }, { $set: { trainingLogVideo: publicUrl } });
          if (!res.matchedCount) {
            throw new Error();
          }
          resolve();
        }
        reject("Error");
      } catch (err) {
        console.log(err);
        return reject(
          "Could not update database. You may have entered an invalid ID"
        );
      }
    });
    blobStream.end(file.buffer);
  });
}

export default {
  addUser,
  addAnimal,
  addTraining,
  getUsers,
  getAnimals,
  getTraining,
  validateEmailPassword,
  issueJWT,
  AuthMiddleware,
  multerMiddleware,
  multerMiddlewareFilter,
  uploadHandler,
};
