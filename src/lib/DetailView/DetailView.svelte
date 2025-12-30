<script>
    import { onMount, onDestroy } from "svelte";
    import { BroadcastStore } from "../global.js";
    import TypeDisplayer from "./TypeDisplayer/TypeDisplayer.svelte";
    import Loading from "../icons/Loading.svelte";
    import GhostOutline from "svelte-material-icons/GhostOutline.svelte";


    const selectedNodeSoulStore = new BroadcastStore({
        name: "selectedNodeSoul",
        isController: false,
    });

    const selectedNodeDataStore = new BroadcastStore({
        name: "selectedNodeData",
        isController: false,
    });

    onMount(async () => {

        const { setup } = await import("../global.js");
        setup.setupDataWorker();

        selectedNodeSoulStore.open();
        selectedNodeDataStore.open();
    });

    onDestroy(() => {
        selectedNodeSoulStore.close();
        selectedNodeDataStore.close();
    });

</script>

<div id="detail-view">
    {#if $selectedNodeSoulStore !== $selectedNodeDataStore?.soul}
        <p>Loading new node <Loading/></p>
    {/if}
    <h2>
        {#if $selectedNodeDataStore?.name}
            {$selectedNodeDataStore.name}
        {:else}
            <Loading/>
        {/if}
    </h2>
    <div class="soul">
        <GhostOutline/>
        <p>{$selectedNodeDataStore?.soul}</p>
    </div>
    <TypeDisplayer {selectedNodeDataStore} />
</div>

<style>
    #detail-view{
        grid-area: detailview;
        padding: 1em;

        & .soul{
            border: .1em solid black;
            border-radius: .4em;
        
            & > *{
                display: inline-block;
            }
        }
    }
</style>