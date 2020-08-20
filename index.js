#!/usr/bin/node

const http = require('http')
const fs = require('fs')
const formidable = require('formidable')
const { RSA_NO_PADDING } = require('constants')

// Initialise database file if it does not exist:


const config = JSON.parse(fs.readFileSync("config.json"))
fs.writeFile("database.json", "{}", { flag: 'wx' }, function (err) {
    if (err) {
        console.log("Database not created. Probably already exists!")
        return
    }
    console.log("Database  initialised.");
});

// HTML
const index = fs.readFileSync("pages/index.html")
const upload_form = fs.readFileSync("pages/forms/upload.html")
const download_form = fs.readFileSync("pages/forms/download.html")
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

            

            res.writeHead(200, { 'content-type': 'text/html' });

        });
    
    } else if (url = "/file/download" && req.method.toLowerCase === "post") {

    } else {
        res.writeHead(404, {'Content-Type': 'text/html'})
        res.write(error_404)
        res.end()
    }
})

server.listen(config.port)
console.log("Server listening on port " + config.port)