
class Setup{

    #instanceIdName = "instanceId";
    get instanceIdName(){
        return this.#instanceIdName;
    }

    #instanceId;
    get instanceId(){
        if(!this.#instanceId){
            const presetValue = getInitialSessionValue(this.#instanceIdName);
            if(presetValue !== null){
                this.#instanceId = presetValue;
            }else{
                this.#instanceId = crypto.randomUUID();
            }
        }

        return this.#instanceId;
    }

    #dataWorker;
    setupDataWorker(){
        if(this.#dataWorker) return;

        const url = new URL("./data/dataSharedWorker.js", import.meta.url);
        url.searchParams.append(this.#instanceIdName, this.instanceId); 
        this.#dataWorker = new SharedWorker(url, {type: "module"});
    }

}

export const setup = new Setup();

export const defaultMode = "node";

export class SessionStore{
    constructor({ name, defaultValue }){
        this.#name = name;
        this.#value = defaultValue;
    }

    open(){
        if(!this.#isClosed) throw new Error("Cannot open a session store that is already open");

        this.#isClosed = false;
        const initialSessionValue = getInitialSessionValue(this.#name);
        if(initialSessionValue !== null){
            this.set(initialSessionValue);
        }else{
            this.set(this.#value);
        }
    }

    #name;

    #isClosed = true;

    #value;
    get value(){
        return this.#value;
    }

    #subscribers = [];

    subscribe(subscriber){
        this.#subscribers.push(subscriber);
        subscriber(this.#value);
        
        // Return a function that can unsubscribe the handler
        return () => (this.#subscribers = this.#subscribers.filter(candidate => candidate !== subscriber));
    };

    set(value){
        if(this.#isClosed) throw new Error("Cannot set a value on a closed session store");

        this.#value = value;
        if("sessionStorage" in globalThis){
            sessionStorage.setItem(this.#name, this.#value);
        }
        for(const subscriber of this.#subscribers){
            subscriber(this.#value);
        }
    }

    update(updateFunction){
        if(this.#isClosed) throw new Error("Cannot update the value of a closed session store");

        this.set(updateFunction(this.#value));
    }

}

export class BroadcastStore{
    constructor({ name, isController, defaultValue }){
        this.#name = name;
        this.#isController = isController;
        this.#value = defaultValue;
    }

    open(){
        if(this.#isOpen) return;

        this.#isOpen = true;
        this.#broadcastChannel = new BroadcastChannel(`${setup.instanceId}/${this.#nameScope}${this.#name}`);
        this.#broadcastChannel.addEventListener("message", event => this.#handleMessage(event));
        this.#broadcastChannel.postMessage({ type: "subscribe" });
    }

    close(){
        if(!this.#isOpen) return;

        this.#isOpen = false;
        this.#broadcastChannel.close();
        this.#subscribers = [];
    }

    #handleMessage(event){
        const type = event.data?.type;
        switch(type){
            case "set": {
                this.#setLocally(event.data.value);
                break;
            }
            case "subscribe": {
                if(this.#isController){
                    this.#broadCastValue();
                }
                break;
            }
            default: {
                throw new TypeError(`Unable to handle broadcast message of unknown type: ${type}`);
            }
        }
    }

    #broadCastValue(){
        this.#broadcastChannel.postMessage({
            type: "set",
            value: this.#value,
        });
    }

    // A string to prepend the channel names with, to make it less likely that they will interfere with any other broadcast channels.
    #nameScope = "__broadcastStore__";

    #name;

    /**
     * Ideally there should only be one "controller" store and a number of "dependent" stores for each name.
     * When a new store is connected, the controller store will send its value, while dependent stores keep quiet.
     */
    #isController;

    #isOpen = false;

    #broadcastChannel;

    #value;
    get value(){
        return this.#value;
    }

    #subscribers = [];

    subscribe(subscriber){
        this.#subscribers.push(subscriber);
        subscriber(this.#value);
        
        // Return a function that can unsubscribe the handler
        return () => (this.#subscribers = this.#subscribers.filter(candidate => candidate !== subscriber));
    };

    set(value){
        this.#value = value;
        if(this.#isOpen) this.#broadCastValue();
        this.#setLocally(value);
    }
    #setLocally(value){
        this.#value = value;
        for(const subscriber of this.#subscribers){
            subscriber(this.#value);
        }
    }

    update(updateFunction){
        this.set(updateFunction(this.#value));
    }

}

function getInitialSessionValue(name){
    let value = null;

    const url = new URL(location);
    const urlValue = url.searchParams.get(name);

    if(urlValue !== null){
        value = urlValue;
        if("sessionStorage" in globalThis){
            url.searchParams.delete(name);
            history.replaceState(null, "", url);
        }

    }else if("sessionStorage" in globalThis){
        const storageValue = sessionStorage.getItem(name);
        if(storageValue !== null){
            value = storageValue;
        }
    }

    return value;
}

