#!/usr/bin/node

const http = require('http')
const fs = require('fs')
const { RSA_NO_PADDING } = require('constants')

const config = JSON.parse(fs.readFileSync("config.json"))

// HTML
const index = fs.readFileSync("pages/index.html")
const upload_form = fs.readFileSync("pages/forms/upload.html")
const code_form = fs.readFileSync("pages/forms/code.html")
const error_404 = fs.readFileSync("pages/404.html")

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
    "/form/code": {
        file: code_form,
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
    } else {
        res.writeHead(404, {'Content-Type': 'text/html'})
        res.write(error_404)
        res.end()
    }
})

server.listen(config.port)
