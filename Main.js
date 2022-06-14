/**
 * Importamos los modulos.
 */
const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const configuration = require('./Meta.js')
/**
 * Declaracion de constantes
 */
const app = express();
const port = 5000;

// express
app.use(express.static("public"));
app.use(express.json());

// OpenIA
const configuration = new Configuration({
  apiKey: configuration.key_secret,
});
/**
 * Funcion que realiza la peticion a la api de OpenIA.
 * @param {string} nlp - Texto que se quiere enviar a la api. 
 */
const getResponse = async (nlp) => {
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: "# En PostgreSQL, " + nlp+':\n',
    temperature: 0.3,
    max_tokens: 90,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return response.data;
};

// Muestra el archivo index.html
app.get("/", (req, res) => {
  res.send("index.html");
});
/**
 * Ruta que regresa un texto. 
 */
app.get("/data", (req, res) => {
  res.send("Método GET :)");
});
/**
 * Ruta que recibe los datos, en formato JSON, para posteriormente 
 * enviar una respuesta al cliente. 
 */
app.post("/data", (req, res) => {
  getResponse(req.body.nlp)
    .then((e) => e)
    .then((data) => {
      console.log(data);
      res.json(data);
    }).catch((err) => {
      res.json({error:'error, La llave no es valida'});
    });
});
//Se ejecuta cuando el servidor esta listo
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
