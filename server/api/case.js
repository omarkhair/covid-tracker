const express = require("express");
const authenticate = require("../authentication/authenticate");
const Case = require("../models/Case");

const router = express.Router();

router.post("/", authenticate, async (req, res) => {
  try {
    req.body.email = req.user.email;
    const newCase = new Case(req.body);
    // @ts-ignore
    const savedCase = await newCase.save();
    res.status(200).send(savedCase);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const cases = await Case.find();
    res.status(200).json(cases);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
