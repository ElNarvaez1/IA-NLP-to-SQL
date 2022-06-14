const KEY_SECRET = ''
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: KEY_SECRET,
});
const openai = new OpenAIApi(configuration);

const getResponse = async (openai)  =>{
    const response = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: "En PostgreSQL, crear una tabla  de Mestros con salarios, puestos y antiguedad",
        temperature: 0.3,
        max_tokens: 60,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      return response
}

getResponse(openai).then(e=>e).then(e=>{
    console.log(e.data.choices[0].text);
});