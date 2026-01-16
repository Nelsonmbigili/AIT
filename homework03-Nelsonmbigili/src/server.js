import * as webLib from './web-lib.js';
import * as path from "path";
import * as fs from "fs";

import { fileURLToPath } from 'url';

const fileName = fileURLToPath(import.meta.url);
console.log(" Filename: ", fileName);
const directoryName = path.dirname(fileName);
console.log(" Dir name: ", directoryName);

const configPath = path.join(directoryName, 'config.json');
console.log("Config Path", configPath);

fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
        console.error("Failed to read the file:", err);
        process.exit(1);
    }

    const config = JSON.parse(data);
    console.log("Config ", config);
    const rootDir = config.root_directory;
    const redirectMap = config.redirect_map;
    const fullPath = path.join(directoryName, "..", rootDir);

    const server = new webLib.HTTPServer(fullPath, redirectMap);
    server.listen(3000, '127.0.0.1');
    console.log('Server running at http://127.0.0.1:3000/');
});
