<script>
    import DeleteOutline from "svelte-material-icons/DeleteOutline.svelte";
    import Plus from "svelte-material-icons/Plus.svelte";
    import { BroadcastStore } from "../global";
    import Debouncer from "../tools/debounce.js";
    import deepEqual from "deep-equal";

    let settingsStore = new BroadcastStore({
        name: "settings",
        isController: true,
        defaultValue: {
            limits: {},
        },
    });


    let baseSteps = [];

    let fromEnabled = false;
    let from = "";
    let toEnabled = false;
    let to = "";
    let megaBytesEnabled = true;
    let megaBytes = 1;
    
    const updateLimitsDebouncer = new Debouncer(updateLimits, 1000);
    $: updateLimitsDebouncer.call(baseSteps, fromEnabled, from, toEnabled, to, megaBytesEnabled, megaBytes);
    function updateLimits(baseSteps, fromEnabled, from, toEnabled, to, megaBytesEnabled, megaBytes){
        const newLimits = {
            baseSteps,
            from: fromEnabled ? from : undefined,
            to: toEnabled ? to : undefined,
            megaBytes: megaBytesEnabled ? megaBytes : undefined,
        };
        if(!deepEqual(newLimits, $settingsStore?.limits, {strict: true})){
            $settingsStore.limits = newLimits;
        }
    }

    $: receiveUpdatedLimits($settingsStore?.limits);
    function receiveUpdatedLimits(limits){
        if(!limits) return;
        if(limits.baseSteps) baseSteps = limits.baseSteps;
        if(limits.from === undefined){
            fromEnabled = false;
        }else{
            fromEnabled = true;
            from = limits.from;
        }
        if(limits.to === undefined){
            toEnabled = false;
        }else{
            toEnabled = true;
            to = limits.to;
        }
        if(limits.megaBytes === undefined){
            megaBytesEnabled = false;
        }else{
            megaBytesEnabled = true;
            megaBytes = limits.megaBytes;
        }
    }

    function addBaseStep(){
        baseSteps.push({
            name: "",
        });

        // To make svelte update the UI
        baseSteps = baseSteps;
    }

    function removeBaseStep(index){
        baseSteps.splice(index, 1);

        // To make svelte update the UI
        baseSteps = baseSteps;
    }
</script>

<form>
    <fieldset>
        <legend>Base</legend>
        {#if baseSteps.length <= 0}
            <input type="text" value="Root" disabled>
        {/if}
        {#each Object.entries(baseSteps) as [index, step]}
            <input type="text" bind:value={step.name}>
            <button on:click={() => {removeBaseStep(index)}} >
                <DeleteOutline/>
            </button>
        {/each}
        <button on:click={addBaseStep} >
            <Plus/>
        </button>
    </fieldset>
    <fieldset>
        <legend>Limits</legend>
        <label>From</label>
        <input type="checkbox" bind:checked={fromEnabled}>
        <input type="text" placeholder="First node" bind:value={from} disabled={!fromEnabled}>
        <label>To</label>
        <input type="checkbox" bind:checked={toEnabled}>
        <input type="text" placeholder="Last node" bind:value={to} disabled={!toEnabled}>
        <label>MegaBytes</label>
        <input type="checkbox" bind:checked={megaBytesEnabled}>
        <input type="number" bind:value={megaBytes} disabled={!megaBytesEnabled}>
    </fieldset>
</form>

<style>
    input:not([type=checkbox]){
        width: 10em;
    }
</style>