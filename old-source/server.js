import http from "node:http";
import fs from "fs-extra";
import path from "node:path";
import { WebSocketServer } from "ws";
import chokidar from "chokidar";
import open from "open";

import * as config from "./config.js";


/**
 * Serves the explorer application files statically.
 * 
 * @param {http.IncomingMessage} request - The incoming request.
 * @param {http.ServerResponse<http.IncomingMessage>} response - The outgoing response.
 */
async function serveStatic(request, response){
	let filePath = path.join(config.applicationPath, `.${request.url}`);

	if(await fs.exists(filePath) && (await fs.lstat(filePath, {bigint: true})).isDirectory()){
		filePath = path.join(filePath, "index.html");
	}

	const contentType = getContentType(filePath);

	try{
		const content = await fs.readFile(filePath);
		response.writeHead(200, { "Content-Type": contentType });
		response.end(content, "utf-8");
	}catch(error){
		if (error.code === "ENOENT") {
			response.writeHead(404);
			response.end("File not found");
		} else {
			response.writeHead(500);
			response.end("Internal server error");
		}
	}
}

/**
 * Basic extension-based content type sniffer.
 * 
 * @param {string} filePath - The path of the file to sniff.
 * @returns {string} - The sniffed MIME type for that file.
 */
function getContentType(filePath){
	const extension = path.extname(filePath);
	switch (extension) {
		case ".html":
			return "text/html";
		case ".js":
			return "text/javascript";
		case ".css":
			return "text/css";
		case ".json":
			return "application/json";
		default:
			return "text/plain";
	}
}

/**
 * Serves the radata from the GUN store over a websocket.
 * `
 * @param {http.IncomingMessage} request - The incoming request.
 * @param {http.ServerResponse<http.IncomingMessage>} response - The outgoing response.
 */
async function serveRadata(ws){
	console.log("Websocket opened");

	const watcher = chokidar.watch(config.dataPath, {
		ignored: /(^|[\/\\])\../, // ignore dotfiles
		awaitWriteFinish: true,
	});

	watcher.on("ready", async () => {
		for(const path of await fs.readdir(config.dataPath)){
			sendEventually(path);
		}
	});
	watcher.on("add", path => sendEventually(path));
	watcher.on("change", path => sendEventually(path));
	watcher.on("unlink", path => sendEventually(path));

	ws.on("error", async () => {
		await watcher.close();
	});

	ws.on("close", async () => {
		await watcher.close();
	});

	let lastUpdate = 0;
	let sending = false;
	let senderQueued = false;
	const cache = new Map();
	/**
	 * 
	 * @param {string} filePath - The relative path to the file. 
	 */
	async function sendEventually(filePath){
		if(filePath){
			if(filePath.startsWith(config.dataPath)){
				const sliced = filePath.split(config.dataPath);
				sliced.shift();
				filePath = sliced.join(config.dataPath);
			}
			if(filePath.startsWith("/")){
				const sliced = filePath.split("/");
				sliced.shift();
				filePath = sliced.join("/");
			}
			cache.set(filePath, true);
		}

		if(!sending && Date.now() - lastUpdate > config.minUpdateDelay){
			sending = true;
			// The small delay ensures that any immediately following updates will be sent in this batch, rather than having to wait for next update tick.
			setTimeout(path => {
				const paths = [...cache.keys()];
				cache.clear();
				Promise.all(paths.map(path => readAndSend(path)));
				lastUpdate = Date.now();
				sending = false;
				if(!path) senderQueued = false;
			}, 300, filePath);
		}else if(!senderQueued){
			senderQueued = true;
			setTimeout(() => sendEventually(), Math.max(500, config.minUpdateDelay - (Date.now() - lastUpdate)));
		}
	}

	async function readAndSend(scope){
		const filePath = path.join(config.dataPath, scope);
		let content = {};
		if(await fs.exists(filePath)){
			try{
				content = await fs.readJSON(filePath);
			}catch(error){
				console.log(`Failed to read ${scope}, trying again in 1 sec`);
				setTimeout(scope => readAndSend(scope), 1000, scope);
			}
		}
		ws.send(JSON.stringify({
			path: scope,
			content,
		}));
	}

}

const server = http.createServer((request, response) => serveStatic(request, response));

const socketServer = new WebSocketServer({server});

socketServer.on("connection", ws => serveRadata(ws));

server.listen(config.port, config.host, () => {
	open(`http://localhost:${config.port}/`);
});
