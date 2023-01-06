import express, { json } from "express";
import { ObjectId } from "mongodb";
import Controllers from "../controllers/controllers.js";
import { body, validationResult } from "express-validator";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ Hello: "World", Version: 2 });
});

router.get("/healthy", (req, res) => {
  res.json({ healthy: true });
});

router.post(
  "/api/user",
  body("firstName").isString(),
  body("lastName").isString(),
  body("email").isString(),
  body("password").isString(),
  body("profilePicture").optional().isString(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json();
    }
    Controllers.addUser(req.body)
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        res.status(500).send();
      });
  }
);

router.post(
  "/api/animal",
  body("name").isString(),
  body("hoursTrained").isNumeric().toInt(),
  body("owner").isMongoId(),
  body("dateOfBirth").optional().isDate().toDate(),
  body("profilePicture").optional().isString(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    Controllers.addAnimal({ ...req.body, owner: ObjectId(req.body.owner) })
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        res.status(500).send();
      });
  }
);

router.post(
  "/api/training",
  body("date").isDate().toDate(),
  body("description").isString(),
  body("hours").isNumeric().toInt(),
  body("animal").isMongoId(),
  body("user").isMongoId(),
  body("trainingLogVideo").optional().isString(),

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    Controllers.addTraining({
      ...req.body,
      animal: ObjectId(req.body.animal),
      user: ObjectId(req.body.user),
    })
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        res.status(500).send();
      });
  }
);

export default router;
