
class EmbeddedType{
    constructor(fields){
        if(
            !fields?.id ||
            !fields?.displayName ||
            false//!fields?.explanation //TODO: Enable
        ){
            throw new TypeError("Cannot create embedded type with missing fields");
        }
        this.#id = fields.id;
        this.#displayName = fields.displayName;
        this.#explanation = fields.explanation;
    }

    #id;
    get id(){
        return this.#id;
    }

    #displayName;
    get displayName(){
        return this.#displayName;
    }

    #explanation;
    get explanation(){
        return this.#explanation;
    }
}

class EmbeddedTypes{
    constructor(types){
        if(!types) throw new TypeError("Cannot create type collection without a list of types");
        for(const type of types){
            this.#types.push(new EmbeddedType({
                id: type.id,
                displayName: type.displayName,
                explanation: type.explanation,
            }));
        }
    }

    #types = [];
    get types(){
        return this.#types;
    }

    get(id){
        const type = this.#types.find(candidate => candidate.id === id);
        if(!type) throw new TypeError(`No embedded type with this ID exists: "${id}"`);
        return type;
    }
}

export default new EmbeddedTypes([
    {
        id: "string",
        displayName: "plain text",
        explanation: "",
    },
    {
        id: "link",
        displayName: "link",
        explanation: "",
    },
    {
        id: "json",
        displayName: "JSON",
        explanation: "",
    },
    {
        id: "color",
        displayName: "CSS color notation",
        explanation: "",
    },
    {
        id: "link",
        displayName: "link",
        explanation: "",
    },
    {
        id: "image",
        displayName: "image",
        explanation: "",
    },
    {
        id: "video",
        displayName: "video",
        explanation: "",
    },
    {
        id: "audio",
        displayName: "audio",
        explanation: "",
    },
    {
        id: "model",
        displayName: "3D model",
        explanation: "",
    },
    {
        id: "document",
        displayName: "document",
        explanation: "",
    },
    {
        id: "base64",
        displayName: "base64-encoded text",
        explanation: "",
    },
    {
        id: "uri",
        displayName: "URI-encoded text",
        explanation: "",
    },
    {
        id: "number",
        displayName: "number",
        explanation: "",
    },
    {
        id: "tombstone",
        displayName: "tombstone",
        explanation: "",
    },
]);