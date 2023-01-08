import express, { json } from "express";
import { ObjectId } from "mongodb";
import Controllers from "../controllers/controllers.js";
import { body, query, validationResult } from "express-validator";

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
  body("email").isEmail(),
  body("password").isString(),
  body("profilePicture").optional().isString(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    Controllers.addUser(req.body)
      .then(() => {
        res.status(200).json();
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  }
);

router.post(
  "/api/animal",
  Controllers.AuthMiddleware,
  body("name").isString(),
  body("hoursTrained").isNumeric().toInt(),
  body("dateOfBirth").optional().isDate().toDate(),
  body("profilePicture").optional().isString(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    Controllers.addAnimal({ owner: ObjectId(req.payload._id), ...req.body })
      .then(() => {
        res.status(200).json();
      })
      .catch((err) => {
        res.status(500).json();
      });
  }
);

router.post(
  "/api/training",
  Controllers.AuthMiddleware,
  body("date").isDate().toDate(),
  body("description").isString(),
  body("hours").isNumeric().toInt(),
  body("animal").isMongoId(),
  body("trainingLogVideo").optional().isString(),

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    Controllers.addTraining({
      user: ObjectId(req.payload._id),
      ...req.body,
      animal: ObjectId(req.body.animal),
    })
      .then(() => {
        res.status(200).send();
      })
      .catch((err) => {
        if (err === 400) res.status(400).json();
        else res.status(500).json({ error: err });
      });
  }
);

router.get(
  "/api/admin/users",
  Controllers.AuthMiddleware,
  query("limit").optional().isNumeric().toInt(),
  query("lastIndex").optional().isMongoId(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json(errors);
    }
    formatPagination(req.query);
    Controllers.getUsers(req.query)
      .then((users) => res.json(users))
      .catch((err) => {
        console.log(err);
        res.status(500).json({ error: err });
      });
  }
);

router.get(
  "/api/admin/animals",
  Controllers.AuthMiddleware,
  query("limit").optional().isNumeric().toInt(),
  query("lastIndex").optional().isMongoId(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json(errors);
    }
    formatPagination(req.query);
    Controllers.getAnimals(req.query)
      .then((animals) => res.json(animals))
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
);

router.get(
  "/api/admin/training",
  Controllers.AuthMiddleware,
  query("limit").optional().isNumeric().toInt(),
  query("lastIndex").optional().isMongoId(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json(errors);
    }
    formatPagination(req.query);
    Controllers.getTraining(req.query)
      .then((training) => res.json(training))
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
);

router.get(
  "/api/admin/training",
  Controllers.AuthMiddleware,
  query("limit").optional().isNumeric().toInt(),
  query("lastIndex").optional().isMongoId(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json(errors);
    }
    formatPagination(req.query);
    Controllers.getTraining(req.query)
      .then((training) => res.json(training))
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }
);

router.post(
  "/api/user/login",
  body("email").isEmail(),
  body("password").exists(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json(errors);
    }
    Controllers.validateEmailPassword(req.body.email, req.body.password)
      .then(() => {
        res.status(200).json({ Success: "Passwords match!" });
      })
      .catch((err) => {
        res.status(403).json({ error: err });
      });
  }
);

router.post(
  "/api/user/verify",
  body("email").isEmail(),
  body("password").exists(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json(errors);
    }
    Controllers.validateEmailPassword(req.body.email, req.body.password)
      .then((user) => {
        //Email and Password match
        return Controllers.issueJWT(
          { _id: user._id, email: user.email },
          process.env.JWT_STRING
        );
      })
      .then((token) => {
        return res.status(200).json({ "Authentication Token": token });
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({ error: err });
      });
  }
);

function formatPagination(query) {
  if (query?.lastIndex) query.lastIndex = ObjectId(query.lastIndex);
  if (query?.limit) {
    if (query.limit < 1) query.limit = 20;
    else if (query.limit > 100) query.limit = 100;
  }
}

export default router;
