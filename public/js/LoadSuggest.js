// Diccionario global de remplazos de palabras
let dictionary = [];
fetch('http://localhost:5000/getData',{
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    }
}).then(res =>res.json()).then(res=>{
    if(res.sugerencias){
        dictionary=res.sugerencias
        console.log(dictionary);
        let modal = document.querySelector("#modalBorrar .modal-body");
        modal.innerHTML = "";
          for (let index = 0; index < dictionary.length; index++) {
            modal.innerHTML += `<p data-id="${index}">${dictionary[index].original}</p>`;
          }
    }
})
