const readline = require('readline')
const fs = require('fs')
const ascii = /^[ -~]+$/;

let words = {
    spanish: []
}

let lines = fs.readFileSync("CREA_total.TXT").toString().split("\n")

let words_length = 0

for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    try {
        let word = line.split(";")[1].split(" ")[0]
        console.log(i + ": " + word)
        if (i%5000 == 0) fs.writeFileSync("words.json", JSON.stringify(words))
        if (ascii.test(word) && word.split("").length > 3) {
            words.spanish.push(word)
            words_length++
        } else {
            //console.log(line + " not accepted due to non-ascii characters.")
        }
        if (words_length > 100000) break
    } catch(e) {
        console.log("Error with line " + line)
    }

}
fs.writeFileSync("words.json", JSON.stringify(words))