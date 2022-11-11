const express = require("express"); 
const authenticate = require("../authentication/authenticate");

const router = express.Router();

router.get("/", authenticate, (req, res)=>{
    res.send({
        msg: "Here are the logged data!",
      });
})

module.exports = router;