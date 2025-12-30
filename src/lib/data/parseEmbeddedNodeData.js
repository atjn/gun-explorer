
export default async function(node){
    if(!node) return undefined;

    node.parsedValues = [];
    node.defaultDataType = undefined;

    switch(typeof node.value){
        case "string": {
            node.parsedValues.push({
                type: "string",
                value: node.value,
            });
            setLatestTypeAsDefault();

            const json = parseEmbeddedJsonStructure(node.value);
            if(json){
                node.parsedValues.push({
                    type: "json",
                    value: json,
                });
                setLatestTypeAsDefault();
            }
            const color = parseEmbeddedColor(json || node.value);
            if(color){
                node.parsedValues.push({
                    type: "color",
                    value: color,
                });
                setLatestTypeAsDefault();
            }

            if(!color){
                const link = parseEmbeddedLink(json || node.value);
                if(link){
                    node.parsedValues.push({
                        type: link.type,
                        value: link.value,
                    });
                    setLatestTypeAsDefault();
                }
                if(!json && !link){
                    const base64 = parseEmbeddedBase64(node.value);
                    if(base64){
                        node.parsedValues.push({
                            type: "base64",
                            value: base64,
                        });
                    }
                    const uri = parseEmbeddedUri(node.value);
                    if(uri){
                        node.parsedValues.push({
                            type: "uri",
                            value: uri,
                        });
                    }
                }
            }
            break;
        }
        case "number": {
            node.parsedValues.push({
                type: "number",
                value: node.value,
            });
            setLatestTypeAsDefault();
        }
        case "object": {
            if(node.value === null){
                node.parsedValues.push({
                    type: "tombstone",
                });
                setLatestTypeAsDefault();
            }else{
                throw new TypeError("Node values should never be objects. Objects should be parsed as new nodes.")
            }
        }	
    }

    function setLatestTypeAsDefault(){
        node.defaultDataType = node.parsedValues.at(-1).type;
    }

    return node;
}

function parseEmbeddedJsonStructure(string){
    if(typeof string !== "string") return false;

    try {
        const result = JSON.parse(string);
        const type = Object.prototype.toString.call(result);
        if(type === "[object Object]" || type === "[object Array]"){
            for(const key of Object.keys(result)){
                const json = parseEmbeddedJsonStructure(result[key]);
                if(json) result[key] = json;
            }
            return result;
        }else{
            return false;
        }
    } catch (error) {
        return false;
    }
}

function parseEmbeddedBase64(string){
    if(typeof string !== "string") return false;
    if(!/^[A-Za-z0-9+/]*={0,3}$/u.test(string)) return false;

    // The default interpreter expects the base64 value to be padded with "=". This ensures the value is padded.
    const repairedString = string.padEnd(string.length + (4-(string.length % 4)), "=");

    return atob(repairedString);
}

function parseEmbeddedUri(string){
    if(typeof string !== "string") return false;

    const decoded = decodeURIComponent(string);
    if(string === decoded){
        return false;
    }else{
        return decoded;
    }
}

function parseEmbeddedColor(string){
    if(typeof string !== "string") return false;

    /**
     * If the color has any standard CSS delimiters before or after it, they will be removed.
     * Example: "#FFF;" -> "#FFF"
     * Without this conversion, the string "#FFF;" would not be recognized as a color.
     */
    const isolated = ( string.match(/^[;,\s]*(?<color>.*?)[;,\s]*$/u) ).groups.color;

    // If it is a HEX color, use uppercase letters for consistency
    const transformed = isolated.startsWith("#") ? isolated.toUpperCase() : isolated;
    
    //TODO: Figure out how to use this in a worker
    const supported = false//CSS.supports("color", transformed);
    
    if(supported){
        return transformed;
    }else{
        return false;
    }
}

function parseEmbeddedLink(string){
    if(typeof string !== "string") return false;
    if(!URL.canParse?.(string)) return false;

    /**
     * This validator does not conform perfectly to RFC 6838 and RFC 3986, but for this purpose it should be pretty accurate.
    */
    const match = string.match(/^data:(?<mimeMajorType>[a-z0-9][a-z0-9.+\-]{1,20})\/[a-z0-9][a-z0-9.+\-]{1,63}(?:;[a-z0-9.+\-;= ]*)+,./iu);
    if(match?.groups?.mimeMajorType){
        if(["image", "video", "audio", "model"].includes(match.groups.mimeMajorType)){
            return {
                type: match.groups.mimeMajorType,
                value: string,
            };
        }else{
            return {
                type: "document",
                value: string,
            };
        }
    }else{
        const url = (new URL(string)).href;
        return {
            type: "link",
            value: {
                url,
                decoded: decodeURI(url),
            }
        };
    }
}