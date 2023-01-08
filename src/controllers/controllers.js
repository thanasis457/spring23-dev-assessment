// Controllers assume data is formatted correctly (formatted by the caller/route file)
import { ObjectID } from "bson";
import dbo from "../mongo/connection.js";
import bcrypt from "bcrypt";
import { secret } from "../routes/assessment.route.js";
import jwt from "jsonwebtoken";

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
  console.log(user);
  const res = await bcrypt.compare(password, user.password);
  console.log(res);
  if (res) {
    return user;
  }
  throw "Email and password do not match";
}

function issueJWT(payload = {}, secretJWT = secret) {
  const token = jwt.sign(payload, secretJWT, { expiresIn: "30 minutes" });
  return token;
}

async function AuthMiddleware(req, res, next) {
  console.log(req.headers);
  
  try{
    //Getting token from headers
    let token = req.headers.authorization.split(' ')[1];
    //Veirfying token
    req.payload = jwt.verify(token, secret);
    return next();
  } catch(err){
    console.log(err);
    return res.sendStatus(401);
  }
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
};
