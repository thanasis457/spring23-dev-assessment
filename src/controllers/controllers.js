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

async function getUsers() {
  const users = await dbo
    .getDb()
    .collection("Users")
    .find({})
    .project({ password: false})
    .toArray();
  console.log(users);
  return users;
}

export default {
  addUser,
  addAnimal,
  addTraining,
  getUsers,
};
