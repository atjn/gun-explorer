import cluster from "node:cluster";
import http from "node:http";
import findOpenPort from "find-open-port";
import { GunEnvironment } from "usable-gun";
import serverPlugin from "usable-gun/lib/server.js";

const config = {
	port: await findOpenPort(),
	peers: [],
};

const gunEnvironment = new GunEnvironment({
	environmentHint: "server",
});

await gunEnvironment.usePlugins([
	serverPlugin,	
]);

if(cluster.isPrimary){
	cluster.fork();
	cluster.on("exit", () => {
		cluster.fork();
		import("gun/lib/crashed.js");
	});
}else{	
	config.server = http.createServer(await gunEnvironment.exports.lib.server.serve("node_modules/gun/examples"));
	
	gunEnvironment.exports.lib.server({web: config.server.listen(config.port), peers: config.peers});
	
	console.log(`http://localhost:${config.port}/gun`);
}