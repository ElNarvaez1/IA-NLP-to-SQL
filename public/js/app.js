document.addEventListener("DOMContentLoaded", function () {
  //MNodal
  const modal = new bootstrap.Modal("#modalCarga", {});

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
  let urlSave = "http://localhost:5000/save";

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
        let agregar = true;
        // Necesitamos buscar si ya existe en el diccionario, si ya esta solo lo remplazamos.
        for (let index = 0; index < dictionary.length; index++) {
          const element = dictionary[index];
          if (element.original == str) {
            dictionary[index] = lexemaPorRemplazar;
            agregar = false;
            console.log("Remplazado");
            console.log(dictionary);
            break;
          }
        }
        if (agregar) {
          dictionary.push(lexemaPorRemplazar);
          let modal = document.querySelector("#modalBorrar .modal-body");
          modal.innerHTML = "";
          for (let index = 0; index < dictionary.length; index++) {
            modal.innerHTML += `<p data-id="${index}">${dictionary[index].original}</p>`;
          }
        }
        modal.show();
        //Una vez que lo hemos agregado al diccionario debemos de enviarlo al servidor
        //local para que lo guarde para las sugerencias.
        fetch(urlSave, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lexemaPorRemplazar),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.message) {
              modal.hide();
              dictionary = res.newDiccionario;
              document.getElementById("nameField").value = "";
              document.getElementById("selectorType").value = "";
            }
          });
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
    let nlpOld = nlp;
    dictionary.forEach((lexema) => {
      nlp = nlp.replaceAll(lexema.original, lexema.remplazo);
    });
    console.log(nlp);
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

  // ---------------------------------> Evento para borrar sugerencias <---------------------------------
  document.getElementById("modalBorrar").addEventListener("click", (e) => {
    if (e.target.tagName == "P") {
      let id = e.target.dataset.id;
      dictionary.splice(id, 1);
      e.target.remove();
      fetch("http://localhost:5000/saveAll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({diccionario:dictionary}),
      })
        .then((e) => e.json())
        .then((e) => {
          if (e.respuesta) {
            alert("Se ha borrado el lexema");
            const myModalAlternative = new bootstrap.Modal("#modalBorrar", {});
            myModalAlternative.hide();
          }
        });
    }
  });
});
