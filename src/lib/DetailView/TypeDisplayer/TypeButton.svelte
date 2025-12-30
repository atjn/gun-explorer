<script>
    import Text from "svelte-material-icons/Text.svelte";
    import Brackets from "../../icons/Brackets.svelte";
    import ColorBucket from "../../icons/ColorBucket.svelte";
    import Link from "../../icons/Link.svelte";
    import Image from "../../icons/Image.svelte";
    import Video from "../../icons/Video.svelte";
    import Audio from "../../icons/Audio.svelte";
    import ModelBox from "../../icons/ModelBox.svelte";
    import DocumentUrl from "../../icons/DocumentUrl.svelte";
    import Base64 from "../../icons/Base64.svelte";
    import Number from "../../icons/Number.svelte";
    import Tombstone from "../../icons/Tombstone.svelte";
    import Questionmark from "../../icons/Questionmark.svelte";

    /**
     * Which data type this button should be toggling.
     * 
     * @type {string}
    */
    export let dataType;

	/**
	 * Controls which data type is currently active.
     * This must be bound to let the component alter the state of the variable.
	 *
	 * @type {string}
	 */
	export let selectedDataType;

	/**
	 * Sets the currently selected data type to this button's data type.
	 */
	function setType(){
		selectedDataType = dataType;
	}
    
</script>

<button on:click={setType} class:selected={selectedDataType === dataType}>
    {#if dataType === "string"}
        <Text/>
    {:else if dataType === "json"}
        <Brackets/>
    {:else if dataType === "color"}
        <ColorBucket/>
    {:else if dataType === "link"}
        <Link/>
    {:else if dataType === "image"}
        <Image/>
    {:else if dataType === "video"}
        <Video/>
    {:else if dataType === "audio"}
        <Audio/>
    {:else if dataType === "model"}
        <ModelBox/>
    {:else if dataType === "document"}
        <DocumentUrl/>
    {:else if dataType === "base64"}
        <!-- TODO: Maybe this icon could be improved -->
        <Base64/>
    {:else if dataType === "uri"}
        <!-- TODO: Maybe this icon could be improved -->
        <Link/>
    {:else if dataType === "number"}
        <Number/>
    {:else if dataType === "tombstone"}
        <Tombstone/>
    {:else}
        <Questionmark/>
    {/if}
</button>

<style>
    button{
        background: red;

        &.selected{
            background: green;
        }
    }
</style>
