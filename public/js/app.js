document.addEventListener("DOMContentLoaded", function () {
  let containerResult = document.getElementById("information-generate");
  let buttonGenerate = document.getElementById("generate");
  buttonGenerate.addEventListener("click", (e) => {
    e.preventDefault();
    let nlp = document.getElementById("nlp").value;
    let url = "http://localhost:5000/data";

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nlp: nlp }),
    })
      .then((e) => e.json())
      .then((data) => {
        containerResult.innerHTML = data.choices[0].text
      });
  });
});
