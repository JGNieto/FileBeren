const readline = require('readline')
const fs = require('fs')
const ascii = /^[ -~]+$/;

let words = {
    spanish: []
}

const readInterface = readline.createInterface({
    input: fs.createReadStream('CREA_total.TXT'),
    output: process.stdout,
    console: false
});

let i = 0

readInterface.on('line', (line) => {
    try {
        let word = line.split(";")[1].split(" ")[0]
        i++
        if (i%5000 == 0) fs.writeFileSync("words.json", JSON.stringify(words))
        if (ascii.test(word)) {
            words.spanish.push(word)
        } else {
            console.log(line + " not accepted due to non-ascii characters.")
        }
    } catch(e) {
        console.log("Error with line " + line)
    }
    
})

fs.writeFileSync("words.json", JSON.stringify(words))