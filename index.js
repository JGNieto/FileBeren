#!/usr/bin/node

const http = require('http')
const fs = require('fs')
const formidable = require('formidable')
const { RSA_NO_PADDING } = require('constants')
const url_decoder = require('url')
const archiver = require('archiver')

let config = JSON.parse(fs.readFileSync("config.json"))

if (!config.storage_directory.endsWith("/")) config.storage_directory = config.storage_directory + "/"

// Initialise database file if it does not exist:


let database = null

try {
    database = JSON.parse(fs.readFileSync("database.json"))
} catch (e) {
    fs.writeFileSync("database.json", "{}")
    database = {}
}

if (database == null) process.exit(1)


// HTML
const index = fs.readFileSync("pages/index.html")
const upload_form = fs.readFileSync("pages/forms/upload.html")
const download_form = fs.readFileSync("pages/forms/download.html")

const upload_success = fs.readFileSync("pages/upload_success.html", "utf-8")

const error_404 = fs.readFileSync("pages/404.html")
const error_generic = fs.readFileSync("pages/error.html")
const error_bad_code = fs.readFileSync("pages/code_not_found.html")

// CSS
const floating_labels_css = fs.readFileSync("css/floating-labels.css")
const bootstrap_min_css = fs.readFileSync("css/bootstrap.min.css")

// JS
const jquery = fs.readFileSync("js/jquery.min.js")

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
    },
    "/js/jquery.min.js": {
        file: jquery,
        content_type: "text/javascript"
    }
}

const server = http.createServer((req, res) => {
    let url = req.url.toLowerCase()

    if (pages[url] != null) {
        res.writeHead(200, {'Content-Type': pages[url].content_type})
        res.write(pages[url].file)
        res.end()
    
    } else if (url == "/favicon.ico") {
        res.writeHead(200, {'Content-Type': 'image/x-icon'})
        fs.createReadStream('assets/favicon.ico').pipe(res)
    } else if (url == "/file/upload" && req.method.toLowerCase() === "post") {
        const form = formidable({ multiples: true })

        form.parse(req, (err, fields, file_data) => {
            files = file_data.multipleFiles
            
            if (err || files.length == 0) {
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
                time_created: new Date().getTime(),
                zipped: false
            }

            let database_files = []

            if (!fs.existsSync(directory)) fs.mkdirSync(directory)

            if (files.length == null) files = [files]

            for (let i = 0; i < files.length; i++) {
                if (error) continue
                let new_file_path = directory + files[i].name

                fs.rename(files[i].path, new_file_path, function(err) {
                    if (err) {
                        console.log(err)
                        error = true
		            	i = files.length
                    }
                })

                let file_entry = {
                    path: new_file_path,
                    type: files[i].type
                }
                database_files.push(file_entry)
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

            database_entry.files = database_files

            database[code] = database_entry
            save_database()

            response = upload_success.replace(/{NUMBER_OF_FILES_UPLOADED}/g, files.length).replace(/{UPLOAD_CODE}/g, code) 
            res.writeHead(200, { 'content-type': 'text/html' });
            res.write(response)
            res.end()
        })
    
    } else if (url.startsWith("/file/download") && req.method.toLowerCase() === "get") {

        let arguments = req.url.split("?")
        if (arguments.length != 2 || !arguments[1].startsWith("code=")) {
            res.writeHead(400, { 'content-type': 'text/html' });
            res.write(error_generic)
            res.end()
            return
        }

        let code = arguments[1].replace("code=", "")

        if (database[code] == null || database[code].files.length == 0) {
            res.writeHead(400, { 'content-type': 'text/html' });
            res.write(error_bad_code)
            res.end()
            return
        }

        let db_file = database[code]
        
        if (db_file.files.length < 2) {
            res.writeHead(200, {'Content-Type': "application/octet-stream", 'Content-Disposition': 'attachment; filename=' + db_file.files[0].path.split("/")[db_file.files[0].path.split("/").length-1] })
            fs.createReadStream(database[code].files[0].path).pipe(res)
        } else {
            
        }

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
