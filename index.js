#!/usr/bin/node

const http = require('http')
const fs = require('fs')
const formidable = require('formidable')
const { RSA_NO_PADDING } = require('constants')

let config = JSON.parse(fs.readFileSync("config.json"))

if (!config.storage_directory.endsWith("/")) config.storage_directory = config.storage_directory + "/"

// Initialise database file if it does not exist:
fs.writeFile("database.json", "{}", { flag: 'wx' }, function (err) {
    if (err) {
        console.log("Database not created. Probably already exists!")
        return
    }
    console.log("Database  initialised.");
});
let database = JSON.parse(fs.readFileSync("database.json"))

// HTML
const index = fs.readFileSync("pages/index.html")
const upload_form = fs.readFileSync("pages/forms/upload.html")
const download_form = fs.readFileSync("pages/forms/download.html")

const upload_success = fs.readFileSync("pages/upload_success.html")

const error_404 = fs.readFileSync("pages/404.html")
const error_generic = fs.readFileSync("pages/error.html")

// CSS
const floating_labels_css = fs.readFileSync("css/floating-labels.css")
const bootstrap_min_css = fs.readFileSync("css/bootstrap.min.css")


const pages = {
    "/": {
        file: index,
        content_type: "text/html"
    },
    "/form/upload": {
        file: upload_form,
        content_type: "text/html"
    },
    "/form/download": {
        file: download_form,
        content_type: "text/html"
    },
    "/css/floating-labels.css": {
        file: floating_labels_css,
        content_type: "text/css"
    },
    "/css/bootstrap.min.css": {
        file: bootstrap_min_css,
        content_type: "text/css"
    },
    "/css/bootstrap.min.css": {
        file: bootstrap_min_css,
        content_type: "text/css"
    }
}

const server = http.createServer((req, res) => {
    let url = req.url
    if (pages[url] != null) {
        res.writeHead(200, {'Content-Type': pages[url].content_type})
        res.write(pages[url].file)
        res.end()
    
    } else if (url == "/favicon.ico") {
        res.writeHead(200, {'Content-Type': 'mage/x-icon'})
        fs.createReadStream('assets/favicon.ico').pipe(res)
    } else if (url == "/file/upload" && req.method.toLowerCase() === "post") {
        const form = formidable({ multiples: true })

        form.parse(req, (err, fields, files) => {
            if (err) {
                res.writeHead(500, { 'content-type': 'text/html' });
                res.write(error_generic)
                res.end()
            }

            let code = generate_code(config.code_length)

            while (database[code] != null) {
                code = generate_code(config.code_length) 
            }

            let directory = config.storage_directory + code + "/"
            let error = false

            let database_entry = {
                files: [],
                time_created: new Date().time()
            }

            for (let i = 0; i < files.lenght; i++) {
                if (error) break
                let new_file_path = directory + files[i].name
                fs.rename(files[i].path, new_file_path, function(err) {
                    if (err) {
                        console.log(err)
                        error = true
                    } else {
                        database_entry.files.push(new_file_path)
                    }
                })
            }

            if (error) {
                res.writeHead(500, { 'content-type': 'text/html' });
                res.write(error_generic)
                res.end()
                try {
                    for (let i = 0; i < files.lenght; i++) {
                        fs.unlink(files[i].path)
                    }
                } catch (e) {
                    console.log("Error deleting files after error: " + e)
                }
                return
            }

            database[code] = database_entry
            save_database()

            response = upload_success.replace("{NUMBER_OF_FILES_UPLOADED}", files.length).replace("{UPLOAD_CODE}", code) 
            res.writeHead(200, { 'content-type': 'text/html' });
            res.write(response)
            res.close()
        })
    
    } else if (url = "/file/download" && req.method.toLowerCase === "post") {

    } else {
        res.writeHead(404, {'Content-Type': 'text/html'})
        res.write(error_404)
        res.end()
    }
})

function generate_code(length) {
    var result           = '';
    var characters       = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function save_database() {
    fs.writeFileSync("database.json", JSON.stringify(database), (err) => {
        if (err) console.log("Database save failed.\n" + err)
    })
}

server.listen(config.port)
console.log("Server listening on port " + config.port)