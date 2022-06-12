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

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nlp: nlp }),
    })
      .then((e) => e.json())
      .then((data) => {
        var result = md.render("```sql\n" + data.choices[0].text + "\n```");
        containerResult.innerHTML = result;
        //containerResult.innerHTML += result
      });
  });
});
