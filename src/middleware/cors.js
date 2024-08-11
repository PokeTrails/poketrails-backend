const cors = require("cors");

const corsOptions = {
    // origin: ["https://www.poketrails.com", "https://dev.poketrails.com"],
    optionsSucessStatus: 200
};

module.exports = cors(corsOptions);
