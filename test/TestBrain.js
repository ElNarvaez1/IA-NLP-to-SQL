/**
 * Para entrenar a la neurona necesitamos
 * tranformar los datos de "createData.txt", a
 * un objeto de entrada y salida
 */

const fs = require("fs");

let linesOfFileClearData = fs.readFileSync("data/clearData.txt", "utf-8").split("\n");
let JSONData = [];

// Iteramos en las lineas del archiva para poder convertirlas a JSON
linesOfFileClearData.forEach((line) => {
    JSONData.push({
        input: line.split(";")[0],
        output: line.split(";")[1],
    });
});
console.log('%cDatos convertidos a JSON','color:green;')