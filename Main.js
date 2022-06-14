/**
 * Importamos los modulos.
 */
const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const configurationApp = require("./Meta.js");
const { toTokens, toLetter } = require("./data/Tokenizer.js");
const fs = require("fs");
const { log } = require("console");
/**
 * Declaracion de constantes
 */
const app = express();
const port = 5000;
let diccionario = [];

// express
app.use(express.static("public"));
app.use(express.json());

// OpenIA
const configuration = new Configuration({
  apiKey: configurationApp.secretKey,
});
/**
 * Funcion que realiza la peticion a la api de OpenIA.
 * @param {string} nlp - Texto que se quiere enviar a la api.
 */
const getResponse = async (nlp) => {
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: "# En PostgreSQL, " + nlp + ":\n",
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
    })
    .catch((err) => {
      res.json({ error: "error, La llave no es valida" });
    });
});

/**
 * Funcion que recibe los datos a guardar en el archivo.
 * (diccionario de cambios)
 */
app.post("/save", (req, resp) => {
  if (req.body) {
    //console.log(req.body);
    let newInput = toTokens(req.body.original);
    let newOutput = toTokens(req.body.remplazo);
    let dataNew = {
      input: newInput,
      output: newOutput,
    };
    //Necesitamos preguntar si ese registro ya existe
    let existe = false;
    for (let index = 0; index < diccionario.length; index++) {
      const element = diccionario[index];
      if (toLetter(element.input) == req.body.original) {
        diccionario[index] = dataNew;
        existe = true
      }
    }
    if(!existe){
      // console.log(dataNew);
      diccionario.push(dataNew);
    }
    //Escribimos el diccionario en un JSON
    fs.writeFileSync("data/tokens.json", JSON.stringify(diccionario, null, 2));
    let linesOfFile = fs.readFileSync("data/tokens.json", "utf-8");
    let tokens = JSON.parse(linesOfFile);
    let newDiccionario = tokens.map((json) => {
      let newInput = toLetter(json.input);
      let newOutput = toLetter(json.output);
      return {
        original: newInput,
        remplazo: newOutput,
      };
    });
    // respondemos la peticion
    resp.json({
      message: "Se guardo el cambio",
      newDiccionario: newDiccionario,
    });
  }
});


app.post('/saveAll',(req,resp)=>{
  if(req.body){
    log(req.body);

    let newSave = req.body.diccionario.map(e=>{
      return {
        input:toTokens(e.original),
        output:toTokens(e.remplazo)
      }  
    });
    fs.writeFileSync("data/tokens.json", JSON.stringify(newSave, null, 2));
    resp.json({
      respuesta:"OK"
    })
  }

});

/**
 * Enviamos el diccionario
 */
app.post("/getData", (req, resp) => {
  let linesOfFile = fs.readFileSync("data/tokens.json", "utf-8");
  if (linesOfFile.length > 0) {
    let tokens = JSON.parse(linesOfFile);
    resp.json({
      message: "Se obtuvo el diccionario",
      sugerencias: tokens.map((json) => {
        return {
          original: toLetter(json.input),
          remplazo: toLetter(json.output),
        };
      }),
    });
  }else{
    resp.json({
      message: "No hay diccionario",
    });
  }
});

//Se ejecuta cuando el servidor esta listo
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
