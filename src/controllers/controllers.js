import dbo from "../mongo/connection.js";


async function addUser(newUser) {
  await dbo.getDb().collection("Users").insertOne(newUser);
}

async function addAnimal(newAnimal) {
  await dbo
    .getDb()
    .collection("Animals")
    .insertOne(newAnimal);
}

async function addTraining(newTraining) {
  await dbo.getDb().collection("Training").insertOne(newTraining);
}

export default {
  addUser,
  addAnimal,
  addTraining
};
