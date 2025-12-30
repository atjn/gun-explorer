<script>
    import embeddedTypes from "./embeddedTypes.js";

    import TypeButton from "./TypeButton.svelte";
    import { JSONEditor } from "svelte-jsoneditor";

    import Tombstone from "../../icons/Tombstone.svelte";
    import Download from "../../icons/Download.svelte";

	/**
	 * Data for the currently selected node.
	 *
	 * @type {writable<object>}
	 */
    export let selectedNodeDataStore;

    let parsedValues;
    let selectedDataType;
    let selectedParsedValue;

    selectedNodeDataStore.subscribe(value => {
        parsedValues = value?.parsedValues;
        selectedDataType = value?.defaultDataType;
    })

    // Runs every time a new data type is selected
    $: updateSelectedParsedValue(parsedValues, selectedDataType);
    function updateSelectedParsedValue(parsedValues, selectedDataType){
        selectedParsedValue = parsedValues?.find(value => value.type === selectedDataType)?.value;
    }

</script>

<div id="value-display">
    {#if parsedValues?.length > 0}
        <div class="menu">
            <h3>Value</h3>
            <p> as {embeddedTypes.get(selectedDataType)?.displayName}</p>
            <div class="type-buttons">
                {#each (parsedValues || []) as parsedValue}
                    <TypeButton dataType={parsedValue.type} bind:selectedDataType />
                {/each}
            </div>
        </div>
        <div class="view">
            {#if selectedDataType === "string"}
                <textarea value={selectedParsedValue}></textarea>
            {:else if selectedDataType === "json"}
                <JSONEditor
                    readOnly = true
                    content = {{
                        json: selectedParsedValue,
                    }}
                />
            {:else if selectedDataType === "color"}
                <div class="color-display" style:--scolor={selectedParsedValue}>
                    <p>{selectedParsedValue}</p>
                </div>
            {:else if selectedDataType === "link"}
                <a target="_blank" href={selectedParsedValue?.url}>{selectedParsedValue?.decoded}</a>
            {:else if selectedDataType === "image"}
                <img src={selectedParsedValue}>
                <a download href={selectedParsedValue}><Download/></a>
            {:else if selectedDataType === "video"}
                <video src={selectedParsedValue}></video>
                <a download href={selectedParsedValue}><Download/></a>
            {:else if selectedDataType === "audio"}
                <audio src={selectedParsedValue}></audio>
                <a download href={selectedParsedValue}><Download/></a>
            {:else if selectedDataType === "document"}
                <iframe src={selectedParsedValue}></iframe>
                <a download href={selectedParsedValue}><Download/></a>
            {:else if selectedDataType === "base64"}
                <textarea value={selectedParsedValue}></textarea>
            {:else if selectedDataType === "uri"}
                <textarea value={selectedParsedValue}></textarea>
            {:else if selectedDataType === "number"}
                <input type="number" value={selectedParsedValue}>
            {:else if selectedDataType === "tombstone"}
                <Tombstone/>
            {/if}
        </div>
    {:else}
        <p>No value</p>
    {/if}
</div>

<style>
    #value-display{
        display: block;
        border: .2em grey solid;
        border-radius: .4em;

        & .menu{
            grid-area: menu;
            border-bottom: .2em grey solid;
            overflow: hidden;

            & > *{
                display: inline-block;
            }

            & h3{
                margin: 0 0 0 .6em;
            }

            & .type-buttons{
                float: right;
            }
        }

        & .view{
            position: relative;

            & > *{
                max-width: 100%;
                min-height: 5em;
                width: 100%;
                border: none;
            }

            & > .color-display{
                background-color: var(--scolor);

                & > p{
                    font-family: Courier, monospace;
                    font-size: 2em;
                    margin: 0;
                    padding: 1.5em;
                    text-align: center;
                    color: white;
                    mix-blend-mode: difference;
                }
            }

            & > textarea{
                min-width: 100%;
            }

            & > img{
                max-height: 20em;
                object-fit: contain;
                padding: .5em;
            }

            & > a{
                display: inline-block;
                width: 3em;
                height: 3em;
                position: absolute;
                right: 0;
                bottom: 0;
            }
        }
    }
</style>
