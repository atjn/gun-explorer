
export async function transformData(radata){
    const links = [];
    const nodes = [{
        soul: "pseudo-root",
        name: "root",
    }];

    await displayData(links, nodes, "pseudo-root", radata);

    return {links, nodes};
}

const splitSymbol = "";

async function displayData(linksData, nodesData, parentSoul, scopedData, prescope = "", isSoul = false, isFree = false, traversedScope = "", timestamp) {

    if (scopedData?.[">"]) timestamp = parseFloat(scopedData[">"]);

    const scopes = prescope.split("");
    while (scopes.length > 1) {
        const scope = scopes.shift();
        parentSoul = await buildNode(parentSoul, scope, timestamp, isFree, false, traversedScope, undefined, linksData, nodesData);
        traversedScope += `${scope}${splitSymbol}`;
        isFree = false;
    }
    prescope = scopes[0];

    if(typeof scopedData === "object" && scopedData !== null) {
        for (const key of Object.keys(scopedData)) {
            if (key === ">") {
                continue;
            } else if (key === ":") {
                await displayData(linksData, nodesData, parentSoul, scopedData[key], prescope, false, isFree, traversedScope, timestamp);
            } else if (key.startsWith("/")) {
                await displayData(linksData, nodesData, parentSoul, scopedData[key], `${prescope}${key}`, false, true, traversedScope, timestamp);
            } else if (key === "#" && typeof scopedData[key] === "string") {
                await displayData(linksData, nodesData, parentSoul, scopedData[key], prescope, true, isFree, traversedScope, timestamp);
            } else {
                await displayData(linksData, nodesData, parentSoul, scopedData[key], `${prescope}${key}`, false, isFree, traversedScope, timestamp);
            }
        }
    }else{
        parentSoul = await buildNode(parentSoul, prescope, timestamp, isFree, isSoul, traversedScope, scopedData, linksData, nodesData);
        traversedScope += prescope;
        prescope = "";
        timestamp = undefined;
        isFree = false;
    }
}

async function buildNode(parentSoul, name, timestamp, isFree, isSoul, traversedScope, value, linksData, nodesData) {

    const soul = `${traversedScope}${name}`;
    
    nodesData.push({
        soul,
        name,
        value: isSoul ? undefined : value,
        timestamp: isNaN(timestamp) ? undefined : timestamp,
    });

    if(parentSoul && !isFree){
        linksData.push({
            source: parentSoul,
            target: soul,
            type: "direct",
        });
    }

    if(isSoul){
        linksData.push({
            source: soul,
            target: value,
            type: "soul",
        });
    }

    return soul;
}

/**
 * Returns an ID can be used as a DOMElement ID.
 * The ID will be unique to the string.
 * 
 * @param {string} string 
 * @returns {string}
 */
export function uniqueScopeDomId(string){
	let b64 = btoa(string);
	let safe = b64.replaceAll("=", "");
	return `scope-${safe}`
}

/**
 * Returns an ID can be used as a DOMElement ID.
 * The ID will be unique to the string.
 * 
 * @param {string} string 
 * @returns {string}
 */
export function IDfromdom(string){
    string = string.substring(5, string.length);
    string = string.padEnd(string.length + (string.length % 4), "=");
	let rev = atob(string);
	return rev;
}