import { ObjectID } from "bson";
import dbo from "../mongo/connection.js";

async function addUser(newUser) {
  await dbo.getDb().collection("Users").insertOne(newUser);
}

async function addAnimal(newAnimal) {
  await dbo.getDb().collection("Animals").insertOne(newAnimal);
}

async function addTraining(newTraining) {
  const validOwner = (
    await dbo.getDb().collection("Animals").findOne({ _id: newTraining.animal })
  ).owner;
  console.log(validOwner);
  console.log(newTraining.user);
  if (!validOwner.equals(newTraining.user)) {
    throw 400;
  }
  await dbo.getDb().collection("Training").insertOne(newTraining);
}

async function getUsers({ limit = 20, lastIndex = ObjectID("000000000000") }) {
  console.log(limit, lastIndex);
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

async function getAnimals() {
  const animals = await dbo.getDb().collection("Animals").find({}).toArray();
  return animals;
}

async function getTraining() {
  const training = await dbo.getDb().collection("Training").find({}).toArray();
  return training;
}

export default {
  addUser,
  addAnimal,
  addTraining,
  getUsers,
  getAnimals,
  getTraining,
};
