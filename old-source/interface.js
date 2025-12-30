
import * as config from "./config.js";
import { JSONEditor } from "./tools/vanilla-jsoneditor/index.js";

const ws = new WebSocket(`ws://${config.host}:${config.port}`);

const viewContainer = document.body.querySelector("#view");
const detachedViewContainer = document.body.querySelector("#detachedView");

ws.addEventListener("message", (event) => {
	const data = JSON.parse(event.data);
	if(data.path !== "!") return;
	displayData(viewContainer, data.content, data.content);
});

const souls = new Map();

async function displayData(parent, data, scopedData, prescope = "", isSoul = false, isFree = false, traversedScope = "", timestamp){

	if(scopedData[">"]) timestamp = parseFloat(scopedData[">"]);

	const scopes = prescope.split("");
	while(scopes.length > 1){
		const scope = scopes.shift();
		parent = await buildBox(parent, scope, timestamp, isFree, traversedScope, 1);
		traversedScope += scope;
		isFree = false;
	}
	prescope = scopes[0];

	switch(typeof scopedData){
		case "string": {
			parent = await buildBox(parent, prescope, timestamp, isFree, traversedScope, 2);
			traversedScope += prescope;
			prescope = "";
			timestamp = undefined;
			isFree = false;
			const json = parseEmbeddedJsonStructure(scopedData);
			const base64 = parseEmbeddedBase64(scopedData);
			if(!isSoul && json){
				buildEmbeddedViewtoggle(parent, true, "Decode JSON");
				const dataEl = document.createElement("div");
				dataEl.classList.add("scope-value");
				dataEl.classList.add("embedded");
				dataEl.classList.add("embedded-json");
				parent.appendChild(dataEl);
				new JSONEditor({
					target: dataEl,
					props: {
						content: {
							json,
						},
						readOnly: true,
					},
				});
			}else if(!isSoul && base64){
				buildEmbeddedViewtoggle(parent, false, "Decode Base64");
				const dataEl = document.createElement("p");
				dataEl.innerText = base64;
				dataEl.classList.add("scope-value");
				dataEl.classList.add("embedded");
				dataEl.classList.add("embedded-base64");
				parent.appendChild(dataEl);
			}
			const dataEl = document.createElement("p");
			dataEl.innerText = scopedData;
			dataEl.classList.add("scope-value");
			dataEl.classList.add("plain");
			if(isSoul) dataEl.classList.add("soul");
			parent.appendChild(dataEl);
			
			break;
		}
		case "number": {
			parent = await buildBox(parent, prescope, timestamp, isFree, traversedScope, 3);
			traversedScope += prescope;
			prescope = "";
			timestamp = undefined;
			isFree = false;
			const dataEl = document.createElement("p");
			dataEl.innerText = String(scopedData);
			parent.appendChild(dataEl);
			break;
		}	
		case "object": {
			for(const key of Object.keys(scopedData)){
				if(key === ">"){
					continue;
				}else if(key === ":"){
					await displayData(parent, data, scopedData[key], prescope, false, isFree, traversedScope, timestamp);
				}else if(key.startsWith("/")){
					await displayData(parent, data, scopedData[key], `${prescope}${key}`, false, true, traversedScope, timestamp);
				}else if(key === "#" && typeof scopedData[key] === "string"){
					await displayData(parent, data, scopedData[key], prescope, true, isFree, traversedScope, timestamp);
				}else{
					await displayData(parent, data, scopedData[key], `${prescope}${key}`, false, isFree, traversedScope, timestamp);
				}
			}
			break;
		}
	}
}

async function buildBox(parent, name, timestamp, isFree, traversedScope, n){
	if(isFree) parent = detachedViewContainer;

	const container = document.createElement("div");
	container.classList.add("scope");
	container.id = uniqueScopeDomId(traversedScope + name);
	parent.appendChild(container);
	const nameEl = document.createElement("p");
	nameEl.classList.add("name");
	nameEl.innerText = isFree ? traversedScope + name : name;
	if(isFree) nameEl.classList.add("soul");
	container.appendChild(nameEl);
	if(!isNaN(timestamp)){
		const stampEl = document.createElement("p");
		stampEl.classList.add("timestamp");
		updateTimestamp(stampEl, timestamp);
		container.appendChild(stampEl);
	}
	return container;
}

/**
 * 
 * @param {object} data 
 * @param {string} scope 
 */
async function followScope(data, scope){
	let scopedData = data;
	follow: while(scope.length > 1){
		for(const key of Object.keys(scopedData)){
			if(scope.startsWith(key)){
				scopedData = scopedData[key];
				scope = scope.substring(key.length, scope.length);
				continue follow;
			}
		}
		throw new Error(`Could not find a match for ${scope}`);
	}
	return scopedData;
}

function updateTimestamp(element, date){
	if(!element) return;
	element.innerText = timeSince(date);
	setTimeout(updateTimestamp, 10000, element, date);
}


function timeSince(date) {

	const seconds = Math.floor((Date.now() - date) / 1000);
  
	let interval = seconds / 31536000;
	if (interval > 1) {
		interval = Math.floor(interval);
	  return `${interval} year${interval > 1 ? "s" : ""} ago`;
	}

	interval = seconds / 2592000;
	if (interval > 1) {
		interval = Math.floor(interval);
		return `${interval} month${interval > 1 ? "s" : ""} ago`;
	}

	interval = seconds / 86400;
	if (interval > 1) {
		interval = Math.floor(interval);
		return `${interval} day${interval > 1 ? "s" : ""} ago`;
	}

	interval = seconds / 3600;
	if (interval > 1) {
		interval = Math.floor(interval);
		return `${interval} hour${interval > 1 ? "s" : ""} ago`;
	}

	interval = seconds / 60;
	if (interval > 1) {
		interval = Math.floor(interval);
		return `${interval} minute${interval > 1 ? "s" : ""} ago`;
	}

	return `${Math.floor(seconds)} second${interval > 1 ? "s" : ""} ago`;
}

let lastConnectSoulsCall = 0;
function connectSouls(force){
	// Ensure that this process doesn't run too often, as it is very heavy.
	if(!force && (lastConnectSoulsCall === 0 || Date.now() - lastConnectSoulsCall < 600) ){
		lastConnectSoulsCall = Date.now();
		setTimeout(connectSouls, 600);
	}


}

function buildEmbeddedViewtoggle(parent, active, label = "Decode value"){
	parent.classList.add("embedded");
	if(active) parent.classList.add("decode-embedded");

	const toggleLabel = document.createElement("label");
	toggleLabel.innerText = label;
	const toggle = document.createElement("input");
	toggle.type = "checkbox";
	if(active) toggle.checked = true;
	toggle.addEventListener("change", toggleDecodedView);
	toggleLabel.append(toggle);
	parent.appendChild(toggleLabel);
}

function toggleDecodedView(event){
	let scope = event.target;
	while(!scope.classList.contains("scope")){
		scope = scope.parentElement;
	}
	if(event.target.checked){
		scope.classList.add("decode-embedded");
	}else{
		scope.classList.remove("decode-embedded");
	}
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
				const base64 = false;//parseEmbeddedBase64(result[key]);
				if(base64) result[key] = base64;
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
	if(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/u.test(string)){
		return atob(string);
	}else{
		return false;
	}
}

/**
 * Returns an ID can be used as a DOMElement ID.
 * The ID will be unique to the string.
 * 
 * @param {string} string 
 * @returns {string}
 */
function uniqueScopeDomId(string){
	let b64 = btoa(string);
	let safe = b64.replaceAll("=", "");
	return `scope-${safe}`
}
