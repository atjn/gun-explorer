import { BaseConnectionMode } from "./BaseConnectionMode.js";
import { NodeConnectionMode } from "./NodeConnectionMode.js";


class ConnectionModes{
    constructor(modes){
        if(!modes) throw new TypeError("Cannot create connection type collection without a list of types");
        this.#modes = modes;
    }

    #modes = [];
    get modes(){
        return this.#modes;
    }

    get(id){
        const type = this.#modes.find(candidate => candidate.id === id);
        if(!type) throw new TypeError(`No embedded connection type with this ID exists: "${id}"`);
        return type;
    }
}

export default new ConnectionModes([
    new NodeConnectionMode(),
    new BaseConnectionMode({
        id: "database-remote",
        displayName: "Remote database view",
        explanation: "",
        supportCheck: () => true,
    }),
    new BaseConnectionMode({
        id: "database-local",
        displayName: "Local database view",
        explanation: "",
        supportCheck: () => "showDirectoryPicker" in globalThis,
    }),
    new BaseConnectionMode({
        id: "example",
        displayName: "Example data",
        explanation: "",
        supportCheck: () => true,
    }),
]);