// 'Import' the Express module instead of http
const express = require("express");
// Initialize the Express application
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const deepl = require("deepl-node");
const fs = require("fs");

dotenv.config();

const PORT = process.env.PORT || 4040; // we use || to provide a default value

const app = express();

mongoose.connect(process.env.DATA_BASE);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once(
  "open",
  console.log.bind(console, "Successfully connected to database!")
);

const logging = (request, response, next) => {
  console.log(`${request.method} ${request.url}`);
  next();
};

// CORS Middleware
const cors = (req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type, Accept,Authorization,Origin"
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
};

app.use(cors);
app.use(express.json());
app.use(logging);

app.get("/status", (request, response) => {
  response.status(200).json({ message: "Service healthy" });
});

app.post("/translator", (request, response) => {
  const translator = new deepl.Translator(process.env.TRANSLATION_KEY);

  const sourceText = request.body.sourceText;
  const outputLanguage = request.body.outputLanguage; //the language we want the output to be

  translator
    .translateText(sourceText, null, outputLanguage)
    .then(result => {
      console.log(result.text); // Bonjour, le monde !

      const responseBody = {
        //if a key in an obj doesnt have a colon anf a value JS auto assumes that the value is itself
        // same as writting sourceText: sourceText
        text: result.text //this
      };

      response.json(responseBody);
    })
    .catch(error => {
      console.error(error);
    });
});

app.get("/country/:countryName", (request, response) => {
  fs.readFile(
    `./server/countryData/${request.params.countryName}.json`,
    {
      encoding: "utf8"
    },
    (error, data) => {
      if (error) {
        console.error(error);
        response.status(404).send();
      } else {
        response.status(200).json(JSON.parse(data)); //json parse turns json string into json obj
      }
    }
  );
}); //countryName is a var can be manipulated

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
