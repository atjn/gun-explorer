
export default class Debouncer{
    constructor(func, waitTime){
        if(!func || isNaN(waitTime)) throw new TypeError("Cannot debounce without a valid function and waitTime");
        this.#func = func;
        this.#waitTime = waitTime;
    }

    #func;
    #waitTime;

    #aciveTimeout;

    call(...args){
        const activeTimeout = this.#aciveTimeout;
        if(activeTimeout) clearTimeout(activeTimeout);
        this.#aciveTimeout = setTimeout(this.#func, this.#waitTime, ...args);
    }
}