const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const { logger } = require("./middleware/logger.js");

const port = process.env.PORT || 8000;
const app = express();

// Logger middleware
app.use(logger);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
