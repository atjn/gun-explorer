import { BaseConnectionMode } from "./BaseConnectionMode.js";

import { GunEnvironment, defaultBrowserPlugin, ConsoleDebugger } from "usable-gun";
import seaPlugin from "usable-gun/sea";
import radixPlugin from "usable-gun/lib/radix.js";
import radiskPlugin from "usable-gun/lib/radisk.js";
import storePlugin from "usable-gun/lib/store.js";
import rindexedPlugin from "usable-gun/lib/rindexed.js";
import axePlugin from "usable-gun/axe.js";


export class NodeConnectionMode extends BaseConnectionMode{
    constructor(){
        super({
            id: "node",
            displayName: "GUN node",
            explanation: "",
        });
    }

    #connected = false;
    get connected(){
        return this.#connected;
    }

    #gun;
    get gun(){
        return this.#gun;
    }
    #settingsStore;
    #peerConnectionStatusStore;
    get peerConnectionStatusStore(){
        return this.#peerConnectionStatusStore;
    }

    // TODO: GUN should definitely not be running on main thread, but it is being a dick about it
    async connectOnMain(){
        if(this.#connected) return;
        this.#connected = true;
        const { BroadcastStore } = await import("../../global.js");


        function tPlugin(environment){
          
            const library = environment.library;

            //console.log(library);
          
            library.Gun.on("opt", (context) => {
                library.debug.warn("opt", context);
                for(const o of [
                    "out",
                    "in",
                    "get",
                    "put",
                    "auth",
                    "secure",
                    "hear",
                    "hi",
                    "bye",
                    "ack",
                    "off",
                ]){
                    context.on(o, arg => {
                        library.debug.warn(o, arg);
                        return arg;
                });
                }
                return context;
            })

            library.Gun.on("create", (context) => {
                library.debug.warn("create", context);
                return context;
            })
          }

        //await waitForGun();
        /*this.#gun = window.Gun({
            radisk: true,
            localStorage: false,
        });
        const gun = this.#gun;*/
        //const gun = new TGClient();
        //window.deb = 
        const gunEnvironment = new GunEnvironment({
            iContributeToGun: true,
            debugger: new ConsoleDebugger(),
        })
        await gunEnvironment.usePlugins([
            defaultBrowserPlugin,
            seaPlugin,
            radixPlugin,
            radiskPlugin,
            storePlugin,
            rindexedPlugin,
            axePlugin,
            //tPlugin,
        ]);
        console.log("env", gunEnvironment, gunEnvironment.library);
        this.#gun = new gunEnvironment.library.Gun({
            radisk: true,
            localStorage: true,
        });
        const gun = this.#gun;
        window.gun = gun;
        console.log("env2", gunEnvironment, gunEnvironment.library);
        
        this.#settingsStore = new BroadcastStore({
            name: "settings",
            isController: false,
            defaultValue: {
                limits: {},
            },
        });
        this.#settingsStore.open();
        this.#settingsStore.subscribe(handleNewSettings);
        
        function handleNewSettings(settings){
            if(settings?.peers) gun.opt({peers: settings.peers});
            let scope = gun;
            if(settings.baseSteps){
                for(const step of settings.baseSteps){
                    scope = scope.get(step);
                }
            }
            //scope.get({".": {"%": 50000}}).once().map().once();
            console.log(scope);
        }

        
        this.#peerConnectionStatusStore = new BroadcastStore({
            name: "peerConnectionStatus",
            isController: true,
            defaultValue: {},
        })
        this.#peerConnectionStatusStore.open();
        
        this.updatePeerStatus();
    }

    updatePeerStatus(classReference){
        classReference ||= this;
        if(!classReference.connected) return;
    
        const peersData = Object.values(classReference.gun.back("opt.peers"));
        let peerConnectionStatus = {};
    
        for(const peerData of peersData){
            let status;
            if(peerData.wire?.readyState === undefined){
                status = "disconnected";
            }else if(peerData.wire?.readyState === 1){
                status = "connected";
            }else if(peerData.wire?.readyState === 0){
                status = "connecting";
            }else{
                status = "disconnected";
            }
            
            
            // IDK:
            /*else{  
                const lastConnectionAttemptRelative = ( peerData.SH || peerData.met || peerData.tried || Date.now() ) - Date.now();
                console.log(peerData, lastConnectionAttemptRelative);
                if(lastConnectionAttemptRelative < 2000){
                    status = "connecting";
                }else{
                    status = "disconnected";
                }
            }*/
            peerConnectionStatus[peerData.url] = status;
        }
    
        classReference.peerConnectionStatusStore.set(peerConnectionStatus);
        setTimeout(classReference.updatePeerStatus, 3000, classReference);
    }

    async disconnectOnMain(){
        if(!this.#connected) return;
        this.#connected = false;

        this.#gun = undefined;

        this.#settingsStore.close();
        this.#settingsStore = undefined;

        this.#peerConnectionStatusStore.close();
        this.#peerConnectionStatusStore = undefined;
    }

}
