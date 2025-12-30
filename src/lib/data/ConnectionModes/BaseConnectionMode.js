
export class BaseConnectionMode{
    constructor(fields){
        if(
            !fields?.id ||
            !fields?.displayName ||
            false //!fields?.explanation //TODO: Enable
        ){
            throw new TypeError("Cannot create embedded type with missing fields");
        }
        this.#id = fields.id;
        this.#displayName = fields.displayName;
        this.#explanation = fields.explanation;
        if(fields.supportCheck) this.#supportCheck = fields.supportCheck;
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

    #supportCheck = () => true;
    get isSupported(){
        return this.#supportCheck();
    }

    async connect(){

    }

    async disconnect(){

    }

    async connectOnMain(){

    }

    async disconnectOnMain(){
        
    }

}
