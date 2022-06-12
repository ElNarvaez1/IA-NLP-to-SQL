document.addEventListener("DOMContentLoaded", function () {
  //Elmentos del HTML
  let containerResult = document.getElementById("information-generate");
  let buttonGenerate = document.getElementById("generate");
  //Evento del boton
  buttonGenerate.addEventListener("click", (e) => {
    e.preventDefault();
    //Obtener el valor del input
    let nlp = document.getElementById("nlp").value;
    //url de la api
    let url = "http://localhost:5000/data";
    //Crear el objeto para renderizar markdown
    var md = window.markdownit({
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang }).value;
          } catch (__) {}
        }

        return ""; // use external default escaping
      },
    });
    document.getElementById("spinner").classList.remove("d-none");
    containerResult.innerHTML=""
    containerResult.classList.remove('bg-light')
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
        containerResult.innerHTML =''
        if (
          data.choices[0].text.includes("CREATE TABLE") ||
          data.choices[0].text.includes("create table")
        ) {
          containerResult.classList.add('bg-light')
          let endTable = data.choices[0].text.indexOf(");");
          let sqlTable = data.choices[0].text.substring(0, endTable + 2);
          if( sqlTable <= 0){
            endTable = data.choices[0].text.lastIndexOf(",");
            sqlTable = data.choices[0].text.substring(0, endTable)+");";
          }
          var result = md.render("```sql\n" + sqlTable + "\n```");
          containerResult.innerHTML = result;
        } else {
          containerResult.classList.remove('bg-light')
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
