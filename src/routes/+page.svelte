<script>
    import Header from "../lib/Header/Header.svelte";
    import PlotView from "$lib/PlotView/PlotView.svelte";
    import DetailView from "$lib/DetailView/DetailView.svelte";
</script>

<div id="outer">
    <Header />
    <PlotView />
    <DetailView />
</div>

<style>
    :global(*){
        box-sizing: border-box;
    }
    #outer{
        position: fixed;
        inset: 0;
        margin: 0;
        padding: 0;
        border: none;
        display: grid;
        grid-template-areas: "header" "plotview" "detailview";
        grid-template-rows: 15em 50% 50%;
    }
    @media(min-aspect-ratio: 1){
        #outer{
            grid-template-areas:
                "header header"
                "plotview detailview";
            grid-template-rows: 15em 100%;
            grid-template-columns: 50% 50%;
        }
    }
</style>
