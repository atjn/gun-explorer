<script>

    /**
     *  The status to display.
     * 
     * @type {"diconnected"|"connecting"|"connected"}
     */
    export let status;

    $: sanitizedStatus = status?.length > 0 ? status : "disconnected";

</script>

<p class={sanitizedStatus}>{sanitizedStatus}</p>

<style>
    p{
        display: inline;
        padding: .2em .4em;
        border-radius: .3em;

        &.disconnected{
            background-color: grey;
        }

        &.connecting{
            background-color: yellow;
        }

        &.connected{
            background-color: green;
        }
    }
</style>