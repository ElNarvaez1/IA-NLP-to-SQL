document.addEventListener("DOMContentLoaded", function () {
  // Diccionario global de remplazos de palabras
  let dictionary = [];

  //Elmentos del HTML
  let containerResult = document.getElementById("information-generate");
  let buttonGenerate = document.getElementById("generate");
  //Crear el objeto para renderizar markdown
  let md = window.markdownit({
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      }

      return ""; // use external default escaping
    },
  });
  //url de la api
  let url = "http://localhost:5000/data";

  // ---------------------------------> Evento para enviar sugerencias <---------------------------------
  document
  .getElementById("btnSugerencia")
  .addEventListener("click", function (e) {
    e.preventDefault();
    let str = document.getElementById("nameField").value;
    let opcion = document.getElementById("selectorType").value;
    if (!str || opcion == "") {
      alert("Por favor especifique lo que desea agregar como sugerencia");
    } else {
      let consulta = (str + " " + opcion + "").replaceAll("'", '"');
      let lexemaPorRemplazar = {
          original: str,
          remplazo: consulta,
        };
        dictionary.push(lexemaPorRemplazar);
        //Una vez que lo hemos agregado al diccionario debemos de enviarlo al servidor 
        //local para que lo guarde para las sugerencias.
      }
    });
    // ---------------------------------> Fin del evento para enviar sugerencias <---------------------------------
    
  //Evento del boton
  buttonGenerate.addEventListener("click", (e) => {
    e.preventDefault();
    //Obtener el valor del input
    let nlp = document.getElementById("nlp").value;

    // --------------------------> Tratado del NLP <--------------------------
    //Antes de enviar el lenguaje natural a la api, debemos de remplazar las palabras
    //que esten en el diccionario.
    let nlpOld = nlp
    dictionary.forEach((lexema) => {
      nlp = nlp.replaceAll(lexema.original, lexema.remplazo);
    });

    document.getElementById("spinner").classList.remove("d-none");
    containerResult.innerHTML = "";
    containerResult.classList.remove("bg-light");
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nlp: nlp }),
    })
      .then((e) => e.json())
      .then((data) => {
        document.getElementById("spinner").classList.add("d-none");
        //Necesitamos veririfcar algunas cosas antes de renderizar
        //comprueba si si es una instruccion valida para crear una tabla (SQL)
        containerResult.innerHTML = "";
        if (
          data.choices[0].text.includes("CREATE TABLE") ||
          data.choices[0].text.includes("create table")
        ) {
          containerResult.classList.add("bg-light");
          let endTable = data.choices[0].text.indexOf(");");
          let sqlTable = data.choices[0].text.substring(0, endTable + 2);
          if (sqlTable <= 0) {
            endTable = data.choices[0].text.lastIndexOf(",");
            sqlTable = data.choices[0].text.substring(0, endTable) + ");";
          }
          var result = md.render("```sql\n" + sqlTable + "\n```");
          containerResult.innerHTML = result;
        } else {
          containerResult.classList.remove("bg-light");
          containerResult.innerHTML =
            '<div class="text-warning">Lo sentimos pero el resultado puede que no satisfaga ' +
            "con las condiciones requeridas " +
            "<br>Verifique la entrada</div>";
        }

        //containerResult.innerHTML += result
      })
      .catch((err) => {
        document.getElementById("spinner").classList.add("d-none");
        containerResult.innerHTML =
          '<div class="text-danger">Algo salio muy mal a la hora de generar el resultado :c ....';
        containerResult.innerHTML +=
          "\nVerifica que tu entrada sea valida</div>";
      });
  });

  // Validacion de cantidad de carcateres escritos, en el textarea
  let textarea = document.getElementById("nlp");
  textarea.addEventListener("input", (e) => {
    const value = e.target.value;
    const length = value.length;
    if (length == e.target.maxLength) {
      e.target.classList.add("is-invalid");
      document.getElementById("feedback").innerHTML =
        "* Número de caracteres excedido";
    } else {
      document.getElementById("feedback").innerHTML = "";
      e.target.classList.remove("is-invalid");
    }
  });
});
