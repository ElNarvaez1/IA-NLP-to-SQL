let ALL_CHARACTERS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZabcdefghijklmñnopqrstuvwxyz0123456789(),.-;:!¡?¿\" ';
const toTokens = (str) => {
    let array = []
    for (let i = 0; i < str.length; i++) {
        array.push(ALL_CHARACTERS.indexOf(str[i]))
    }
    return array
};
/**
 * @param {array} tokens - Arreglo con los tokens del texto.
 */
const toLetter = (tokens) =>{
    let str = ''
    for (let i = 0; i < tokens.length; i++) {
        str += ALL_CHARACTERS[tokens[i]]
    }
    return str
}
module.exports={toTokens,toLetter};