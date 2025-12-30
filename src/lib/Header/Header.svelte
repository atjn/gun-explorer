<script>
    import connectionModes from "../data/ConnectionModes/ConnectionModes.js";
    import getVolunteerRelays from "../data/getVolunteerRelays.js";
    import { BroadcastStore, defaultMode } from "../global.js";

    import { onMount, onDestroy } from "svelte";
    import Scope from "./Scope.svelte";
    import ConnectionStatus from "./ConnectionStatus.svelte";

    import Plus from "svelte-material-icons/Plus.svelte";

    let live = false;

    let currentConnectionMode;

    const modeStore = new BroadcastStore({
        name: "mode",
        isController: false,
        defaultValue: defaultMode,
    });
    const settingsStore = new BroadcastStore({
        name: "settings",
        isController: true,
        defaultValue: {
            limits: {},
        },
    });

    $: k($modeStore);
    async function k(mode){
        await currentConnectionMode?.disconnectOnMain();
        if(!mode || !live) return;

        currentConnectionMode = connectionModes.get(mode);
        await currentConnectionMode?.connectOnMain();
    }

    let newRelayUrlInput;
    let unusedVolunteerRelays = [];
    $: updateUnusedVolunteerRelays($settingsStore);
    async function updateUnusedVolunteerRelays(settings){
        if(live) unusedVolunteerRelays = (await getVolunteerRelays()).filter(relay => !settings?.peers?.find(candidate => candidate === relay));
    }

    const peerConnectionStatusStore = new BroadcastStore({
        name: "peerConnectionStatus",
        isController: false,
        defaultValue: {},
    })

    onMount(() => {
        live = true;
        modeStore.open();
        settingsStore.open();
        peerConnectionStatusStore.open();
        updateUnusedVolunteerRelays($settingsStore);
    })

    onDestroy(() => {
        live = false;
        modeStore.close();
        settingsStore.close();
        peerConnectionStatusStore.close();
    })

    function addRelay(){
        if(!newRelayUrlInput.checkValidity() || newRelayUrlInput.value === "") return;

        settingsStore.update(value => {
            value.peers ||= [];
            value.peers.push(newRelayUrlInput.value);
            return value;
        });

        newRelayUrlInput.value = "";
    }

    async function requestLocalRadataAccess(){
        const directoryHandle = await window.showDirectoryPicker();
        for await (const entry of directoryHandle.values()) {
            console.log(entry.kind, entry.name);
        }
    }
</script>

<header>
    <h1>GUN Explorer</h1>
    <form>
        <label for="mode-select">Mode</label>
        <select name="mode" id="mode-select" bind:value={$modeStore}>
            {#each connectionModes.modes as mode}
                {#if mode.isSupported}
                    <option value={mode.id}>{mode.displayName}</option>
                {/if}
            {/each}
        </select>

        {#if $modeStore === "node"}
            <fieldset>
                <legend>Sync with relays</legend>
                {#each ($settingsStore?.peers || []) as url}
                    <div>
                        <input type="url" bind:value={url} disabled>
                        <ConnectionStatus status={$peerConnectionStatusStore?.[url]} />
                    </div>
                {/each}
                <input type="url" list="unused-volunteer-relays" bind:this={newRelayUrlInput}>
                <button on:click={addRelay} >
                    <Plus/>
                </button>
                <datalist id="unused-volunteer-relays">
                    {#each unusedVolunteerRelays as relay}
                        <option value={relay}></option>
                    {/each}
                </datalist>
            </fieldset>
        {:else if $modeStore === "database-remote"}
            <label>Connect to remote database</label>
            <input type="url">
        {:else if $modeStore === "database-local"}
            <label>Access local database</label>
            <button on:click={requestLocalRadataAccess}>access</button>
        {/if}

    </form>

    <Scope />
</header>

<style>
    header{
        grid-area: header;

        & > *,
        & fieldset{
            display: inline-block;
        }

    }
</style>