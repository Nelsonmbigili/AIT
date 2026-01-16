import * as path from "path";
import * as net from "net";
import * as fs from "fs";
import MarkdownIt from "markdown-it";

const MIME_TYPES = {
    "jpg" : "image/jpg",
    "jpeg" : "image/jpeg",
    "png" : "image/png",
    "html" : "text/html",
    "css" : "text/css",
    "txt" : "text/plain"
};

/**
 * returns the extension of a file name (for example, foo.md returns md)
 * @param fileName (String)
 * @return extension (String)
 */
function getExtension(fileName) {
    const formatPath = path.extname(fileName).toLowerCase();
    if (formatPath.startsWith(".")) {
        return formatPath.substring(1);
    }
    return formatPath;
}

/**
 * determines the type of file from a file's extension (for example,
 * foo.html returns text/html
 * @param: fileName (String)
 * @return: MIME type (String), undefined for unkwown MIME types
 */
function getMIMEType(fileName) {
    const ext = path.extname(fileName);
    return ext.length > 0 ? MIME_TYPES[ext.substring(1)] : null;
}

class Request {
    constructor(reqStr) {
        const [method, path] = reqStr.split(" ");
        this.method = method;
        this.path = path;
    }
}

class Response {

    static STATUS_CODES = {
        200 : "OK",
        308 : "Permanent Redirect",
        404 : "Page Not Found",
        500 : "Internal Server Error"
    };

    constructor(socket, statusCode = 200, version = "HTTP/1.1") {
        this.sock = socket;
        this.statusCode = statusCode;
        this.version = version;
        this.headers = {};
        this.body = null;
    }

    setHeader(name, value) {
        this.headers[name] = value;
        return this;
    }

    status(statusCode) {
        this.statusCode = statusCode;
        return this;
    }

    send(body) {
        this.body = body ?? "";
      
        if (!Object.hasOwn(this.headers, "Content-Type")) {
            this.headers["Content-Type"] = "text/html";
        }

        const statusCodeDesc = Response.STATUS_CODES[this.statusCode];

        const headersString = Object.entries(this.headers).reduce((s, [name, value]) => {
            return s + `${name}: ${value} \r\n`;
        }, "");

        this.sock.write(`${this.version} ${this.statusCode} ${statusCodeDesc}\r\n`);
        this.sock.write(`${headersString}\r\n`);
        this.sock.write(this.body);

        this.sock.end();
    }
}

class HTTPServer {
    constructor(rootDirFull, redirectMap) {
        this.rootDirFull = rootDirFull;
        this.redirectMap = redirectMap;
        this.server = net.createServer(this.handleConnection.bind(this));
        this.md = new MarkdownIt({ html: true });
    }

    listen(port, host) {
        this.server.listen(port, host);
    }

    handleConnection(sock) {
        sock.on("data", data => this.handleRequest(sock, data));
    }

    sendError(res, statusCode) {
        const description = Response.STATUS_CODES[statusCode] || 'Error';
        res.status(statusCode).setHeader('Content-Type', 'text/plain').send(description);
    }

    serveDirectory(req, res, fullPath) {
        fs.readdir(fullPath, { withFileTypes: true }, (err, files) => {
            if (err) {
                this.sendError(res, 500);
                return;
            }

            let listItems = '';
            files.forEach(file => {
                const fileName = file.name + (file.isDirectory() ? '/' : '');
                const linkPath = path.join(req.path, file.name) + (file.isDirectory() ? '/' : '');
                listItems += `<li><a href="${linkPath}">${fileName}</a></li>`;
            });

            const html = `
                <!DOCTYPE html>
                <html>
                <head><title>Index of ${req.path}</title></head>
                <body>
                    <h1>Index of ${req.path}</h1>
                    <ul>${listItems}</ul>
                </body>
                </html>`;
            res.status(200).setHeader('Content-Type', 'text/html').send(html);
        });
    }

    serveFile(res, fullPath) {
        const ext = getExtension(fullPath);
        const isMarkdown = ext === 'md' || ext === 'markdown';
        
        fs.readFile(fullPath, isMarkdown ? 'utf8' : null, (err, data) => {
            if (err) {
                this.sendError(res, 500);
                return;
            }

            if (isMarkdown) {
                const html = this.md.render(data);
                res.status(200).setHeader('Content-Type', 'text/html').send(html);
            } else {
                const mimeType = getMIMEType(fullPath);
                res.status(200).setHeader('Content-Type', mimeType).send(data);
            }
        });
    }


    handleRequest(sock, binaryData) {
        const req = new Request(binaryData.toString());
        const res = new Response(sock);
        const reqPathFull = path.join(this.rootDirFull, req.path);

        if(this.redirectMap && Object.hasOwn(this.redirectMap, req.path)){
            const newPath = this.redirectMap[req.path];
            res.status(308).setHeader("Location", newPath).send();
            return;
        }

        const normalizedPath = path.normalize(reqPathFull);
        if (!normalizedPath.startsWith(this.rootDirFull)) {
            this.sendError(res, 404);
            return;
        }

        fs.access(normalizedPath, fs.constants.F_OK, (err) => {
            if (err) {
                this.sendError(res, 404);
            } else {
                fs.stat(normalizedPath, (statErr, stats) => {
                    if (statErr) {
                        this.sendError(res, 500);
                    } else if (stats.isFile()) {
                        this.serveFile(res, normalizedPath);
                    } else if (stats.isDirectory()) {
                        this.serveDirectory(req, res, normalizedPath);
                    }
                });
            }
        });
    }
}


export {
    Request,
    Response,
    HTTPServer
};