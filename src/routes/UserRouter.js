const express = require("express");
const router = express.Router();

router.get("/", async (request, response, next) => {
    response.json({
        message:"user router test"
    })
})

module.exports = router;
