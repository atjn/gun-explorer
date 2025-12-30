import { data } from "../testradata.js";
import { transformData } from "../transformer.js";
import { BroadcastStore, defaultMode } from "../global.js";
import connectionModes from "./ConnectionModes/ConnectionModes.js";
import parseEmbeddedNodeData from "./parseEmbeddedNodeData.js";
import generateLinkData from "./generateLinkData.js";

let currentConnectionMode;

const modeStore = new BroadcastStore({
    name: "mode",
    isController: true,
    defaultValue: defaultMode,
});
modeStore.open();
modeStore.subscribe(setNewMode);

const settingsStore = new BroadcastStore({
    name: "settings",
    isController: true,
    defaultValue: {
        limits: {},
    },
});
settingsStore.open();

async function setNewMode(mode){
    await currentConnectionMode?.disconnect();
    if(!mode) return;

    currentConnectionMode = connectionModes.get(mode);
    await currentConnectionMode?.connect();
}

const mapDataStore = new BroadcastStore({
    name: "mapData",
    isController: true,
});
mapDataStore.open();

const selectedNodeSoulStore = new BroadcastStore({
    name: "selectedNodeSoul",
    isController: true,
});
selectedNodeSoulStore.open();
selectedNodeSoulStore.subscribe(handleNewSelectedNode);

const selectedNodeDataStore = new BroadcastStore({
    name: "selectedNodeData",
    isController: true,
});
selectedNodeDataStore.open();

const result = await transformData(data);
mapDataStore.set(result);

async function handleNewSelectedNode(soul){
    const selectedNodeData = mapDataStore.value?.nodes?.find(candidate => candidate.soul === soul) || {};

    const embeddedParserResult = await parseEmbeddedNodeData(selectedNodeData);

    selectedNodeData.parsedValues = embeddedParserResult?.parsedValues;
    selectedNodeData.selectedDataType = embeddedParserResult?.defaultDataType;

    const selectorChains = generateLinkData(selectedNodeData, mapDataStore.value?.links);

    
    selectedNodeDataStore.set(selectedNodeData);
}