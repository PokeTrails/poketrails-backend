const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const store = require("../controllers/StoreController");

router.get("/", auth, store.allStoreItems);
router.get("/view/:id", auth, store.viewItem);
router.patch("/buy/:id", auth, store.buyItem);

module.exports = router;
