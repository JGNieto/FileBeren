#!/usr/bin/node

const http = require('http')
const fs = require('fs')
const formidable = require('formidable')
const url_decoder = require('url')
const archiver = require('archiver')

let config = JSON.parse(fs.readFileSync("config.json"))
let words = null
let words_length = null
try {
    if (config.code_lang != "random") words = JSON.parse(fs.readFileSync("words.json"))[config.code_lang]
    words = words.length
} catch (e) {
    console.log("Specified language is not valid, using random")
}

if (!config.storage_directory.endsWith(config.directory_char)) config.storage_directory = config.storage_directory + config.directory_char

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

const choose_files = fs.readFileSync("pages/choose_files.html", "utf-8")

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

            let code = get_word(config.code_length)
            let word_tries = 0
	    
	    
            while (database[code] != null && word_tries < 50) {
                code = get_word()
                word_tries++
            }

            while (database[code] != null && word_tries < 100) {
                code = generate_code()
            }

            if (database[code] != null || code == null) {
                res.writeHead(500, { 'content-type': 'text/html' });
                res.write(error_generic)
                res.end()
                return
            }

            let directory = config.storage_directory + code + config.directory_char
            let error = false

            let database_entry = {
                files: [],
                time_created: new Date().getTime(),
                zipped: false,
                zip_path: null,
                directory: directory
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
                    for (let i = 0; i < files.length; i++) {
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

            response = upload_success.replace(/{NUMBER_OF_FILES_UPLOADED}/g, files.length).replace(/{UPLOAD_CODE}/g, code).replace(/{DELETE_HOURS}/g, config.milliseconds_until_deletion/(60*60*1000))
            res.writeHead(200, { 'content-type': 'text/html' });
            res.write(response)
            res.end()
        })
    
    } else if (url.startsWith("/file/download/unzipped") && req.method.toLowerCase() === "get") {
        try {
            let arguments = req.url.split("?")

            let code = arguments[1].replace("code=", "")

            if (database[code] == null || database[code].files.length == 0) {
                res.writeHead(400, { 'content-type': 'text/html' })
                res.write(error_bad_code)
                res.end()
                return
            }

            let db_file = database[code]
            
            if (db_file.files.length < 2) {
                res.writeHead(200, {'Content-Type': "application/octet-stream", 'Content-Disposition': 'attachment; filename=' + db_file.files[0].path.split(config.directory_char)[db_file.files[0].path.split(config.directory_char).length-1] })
                fs.createReadStream(database[code].files[0].path).pipe(res)
            } else {
                let page = choose_files

                let list = ""

                for (let i = 0; i < db_file.files.length; i++) {
                    let file_name = file_name_from_path(db_file.files[i].path)
                    list += "<li>"
                    list += "<a href='"
                    list += "/file/download/fileunzipped/" + file_name + "?code=" + code
                    list += "'>"
                    list += file_name
                    list += "</a></li>"
                }

                page = page.replace(/{FILE_LIST}/g, list)

                res.writeHead(400, { 'content-type': 'text/html' })
                res.write(page)
                res.end()

            }
        } catch(e) {
            res.writeHead(400, { 'content-type': 'text/html' });
            res.write(error_generic)
            res.end()
        }
    } else if (url.startsWith("/file/download/fileunzipped") && req.method.toLowerCase() === "get") {
        try {
            let filename = url.split("/")[4].split("?")[0]
            let code = url.split("?")[1].split("=")[1]

            if (database[code] == null) throw Error

            let file = null

            for (let i = 0; i < database[code].files.length; i++) {
                if (file_name_from_path(database[code].files[i].path).toLowerCase == filename.toLowerCase)
                    file = database[code].files[i].path
            }

            if (file == null) throw Error
            res.writeHead(200, {'Content-Type': "application/octet-stream", 'Content-Disposition': 'attachment; filename=' + filename })
            fs.createReadStream(file).pipe(res)
        } catch(e) {
            res.writeHead(400, { 'content-type': 'text/html' });
            res.write(error_generic)
            res.end()
        }
    } else if (url.startsWith("/file/download/zipped") && req.method.toLowerCase() === "get") {
        try {
            let code = url.split("?")[1].split("=")[1]

            if (database[code] == null || database[code].files.length == 0) {
                res.writeHead(400, { 'content-type': 'text/html' });
                res.write(error_bad_code)
                res.end()
                return
            }

            let db_file = database[code]
            
            let file_path = null

            if (db_file.zipped) {
                file_path = db_file.zip_path
                res.writeHead(200, {'Content-Type': "application/octet-stream", 'Content-Disposition': 'attachment; filename=' + code + ".zip" })
                fs.createReadStream(file_path).pipe(res)
            } else {
                let files = db_file.files
                file_path = config.storage_directory + config.directory_char + code + config.directory_char + code + ".zip"
                let output = fs.createWriteStream(file_path)
                let archive = archiver('zip')

                output.on('close', () => {
                    database[code].zipped = true
                    database[code].zip_path = file_path
                    res.writeHead(200, {'Content-Type': "application/octet-stream", 'Content-Disposition': 'attachment; filename=' + code + ".zip" })
                    fs.createReadStream(file_path).pipe(res)                    
                })

                archive.on('error', (err) => {
                    res.writeHead(500, { 'content-type': 'text/html' });
                    res.write(error_generic)
                    res.end()
                })

                archive.pipe(output)

                for (let i = 0; i < files.length; i++) {
                    archive.append(fs.createReadStream(files[i].path), {name: file_name_from_path(files[i].path)})
                }

                archive.finalize()
            }
        } catch(e) {
            console.log(e)
            res.writeHead(500, { 'content-type': 'text/html' });
            res.write(error_generic)
            res.end()
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

function get_word() {
    if (words == null) return generate_code(config.code_length)
    return words[Math.floor(Math.random() * words_length) - 1]
}

function save_database() {
    fs.writeFile("database.json", JSON.stringify(database), (err) => {
        if (err) console.log("Database save failed.\n" + err)
    })
}

function file_name_from_path(file_path) {
    return file_path.split(config.directory_char)[file_path.split(config.directory_char).length-1]
}

try {
    if (config.milliseconds_between_deletion_checks != null) {
	console.log("Preparing deletion interval")
        setInterval(() => {
	    try {
            console.log("Deleting old files...")
            let time = new Date().getTime()
            for (let key in database) {
                if (time - database[key].time_created >= config.milliseconds_until_deletion) {
		    console.log(" - " + key + ":")
                    let files = database[key].files
                    for (let i = 0; i < files.length; i++) {
			console.log("   - " + files[i].path)
			if (fs.existsSync(files[i].path)) fs.unlinkSync(files[i].path)
                    }
//                    fs.rmdirSync(database[key].directory)
                    delete database[key]
                }
            }
            console.log("Saving dabase after deletion")
            save_database()
            } catch (e) {
		    console.log("Error during this deleting round")
		    console.log(e)
	    }
        }, config.milliseconds_between_deletion_checks)
    }
} catch (e) {
    console.log("Error deleting files.")
    console.log(e)
}

server.listen(config.port)
console.log("Server listening on port " + config.port)
