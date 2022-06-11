/**
 * Lectura de un archivo TXT.
 * El archivo "db.txt" contiene los registros que
 * se usaran para el entrenamiento de la neurona
 */
/**
 *  ( 1 )
 * Importar las librerias
 * Leer el archivo txt
 */
const fs = require("fs");
// Lectura del archivos
let linesOfFile = fs.readFileSync("data/db.txt", "utf-8").split("\n");
//Arreglo con los registros en limpio
let clearData = [];

// Iteramos las lineas del archivo "db.txt", para descartar los
// elemento que no sean necesarios (repetidos)
linesOfFile.forEach((line) => {
  if (clearData.length > 0) {
    if (!clearData.includes(line.replace(",\\n", ""))) {
      clearData.push(line.replace(",\\n", ""));
    }
  } else {
    clearData.push(line.replace(",\\n", ""));
  }
});
console.log(`Total de lineas DB.txt ${linesOfFile.length}`);
console.log(`Total de lineas unicas ${clearData.length}`);

let JSONData = clearData.map((line) => {
  return {
    input: line.split(";")[0],
    output: line.split(";")[1],
  };
});

let information = {
  data: JSONData
}


// Escribimos un nuevo archivo con los datos limpiados
fs.writeFileSync("data/clearData.txt", clearData.join("\n"));
console.log("Datos guardados en clearData.txt");

fs.writeFileSync("data/clearDataJSON.json", JSON.stringify(information,null, 2));
console.log("Datos guardados en clearDataJSON.json");
