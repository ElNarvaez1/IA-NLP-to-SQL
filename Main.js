const express = require("express");
const app = express();
const port = 5000;
//const data  = require('./data/clearDataJSON.json');
const KEY_SECRET = "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";
const { Configuration, OpenAIApi } = require("openai");

// express
app.use(express.static("public"));
app.use(express.json());

// OpenIA
const configuration = new Configuration({
  apiKey: KEY_SECRET,
});

const getResponse = async (nlp) => {
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: "# En PostgreSQL, " + nlp+':\n',
    temperature: 0.3,
    max_tokens: 80,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return response.data;
};

// Enrutador alv
app.get("/", (req, res) => {
  res.send("index.html");
});

app.get("/data", (req, res) => {
  res.send("Método GET :)");
});

app.post("/data", (req, res) => {
  //console.log(req.body);
  getResponse(req.body.nlp)
    .then((e) => e)
    .then((data) => {
      console.log(data);
      res.json(data);
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
