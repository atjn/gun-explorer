<script>
    import { onMount, onDestroy } from "svelte";
    import { BroadcastStore } from "../global.js";
    import Loading from "../icons/Loading.svelte";

    let svgElement;
    let scalerElement;
    let nodesElement;
    let width = 1000;
    let height = 1000;
    const nodeRadius = 5;
    const nodeMarginRadius = 1.5;  //If you change this, you need to manually change it in CSS as well.

    let linksData = [];

    // Displays a loading bar while we wait for the first data to arrive
    let loaded = false;

    const mapDataStore = new BroadcastStore({
        name: "mapData",
        isController: false,
        defaultValue: {nodes: [], links: []},
    });
    const selectedNodeSoulStore = new BroadcastStore({
        name: "selectedNodeSoul",
        isController: false,
    });

    onMount(async () => {

        const { setup } = await import("../global.js");
        setup.setupDataWorker();
        
        mapDataStore.open();
        mapDataStore.subscribe(renderNodes);

        selectedNodeSoulStore.open();

    });

    onDestroy(() => {
        mapDataStore.close();
        selectedNodeSoulStore.close();
    });

    let svg;
    let scaler;
    let simulation;
    let nodes;

    async function renderNodes({nodes: nodesData, links}){
        if(!nodesData?.length || !links?.length) return;

        linksData = links;
        window.linksData = linksData;

        const { forceSimulation, forceLink, forceManyBody, forceX, forceY, select, drag, zoom } = await import("d3");

        // Specify the dimensions of the chart.
       /* const boundingRect = plotView.getBoundingClientRect();
        width = boundingRect.width;
        height = boundingRect.height;*/

        svg ??= select(svgElement);
        scaler ??= select(scalerElement);

        // Create a simulation with several forces.
        simulation ??= forceSimulation(nodesData)
            .force("link", forceLink(linksData).id(data => data.soul))
            .force("charge", forceManyBody())
            .force("x", forceX())
            .force("y", forceY());

        nodes = select(nodesElement)
            .selectAll("g")
            .data(nodesData)
            .join("g");

        nodes.on("click", event => {
            selectedNodeSoulStore.set(event.target.__data__.soul);
        });

        nodes.append("circle")
            .attr("r", nodeRadius);

        nodes.append("text")
            .text(data => data.name.substring(0, 10));

        // Set the position attributes of links and nodes each time the simulation ticks.
        simulation.on("tick", () => {
            // This lets svelte know that it should update the values in the UI.
            linksData = linksData;

            nodes
                .attr("transform", data => `translate(${data.x}, ${data.y})`);
        });

        // Zoom the scaler group when a zoom event is fired
        svg.call(zoom()
            .on("zoom", event => {
                scaler.attr("transform", event.transform);
            })
        );

        // Add a drag behavior.
        nodes.call(drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );

        // Reheat the simulation when drag starts, and fix the subject position.
        function dragstarted(event){
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        // Update the subject (dragged node) position during drag.
        function dragged(event){
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        // Restore the target alpha so the simulation cools after dragging ends.
        // Unfix the subject position now that it’s no longer being dragged.
        function dragended(event){
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        loaded = true;

    }

    /**
     * 
     * @param source {object} - 
     * @param source.x {number} - 
     * @param source.y {number} - T
     * @param target {object} - d
     * @param target.x {number} - 
     * @param target.y {number} - 
     * @param reduction {number} - 
     * 
     * @returns {object<number>}
     */
    function shortenLine({x: sx, y: sy}, {x: tx, y: ty}, reduction) {
        if(isNaN(reduction)) throw new TypeError("Reduction must be a number");
        if(isNaN(sx) || isNaN(sy) || isNaN(tx) || isNaN(ty)) return { x: 0, y: 0 };

        // Calculate the coordinate differences
        const Δx = tx - sx;
        const Δy = ty - sy;
        
        // Calculate the length of the line
        const length = Math.sqrt(Δx ** 2 + Δy ** 2);
        
        // Find the unit vector of the line's direction
        const ux = Δx / length;
        const uy = Δy / length;
        
        // Calculate the new end coordinates
        const new_tx = tx - reduction * ux;
        const new_ty = ty - reduction * uy;
        
        return { x: new_tx, y: new_ty };
    }
</script>

<div id="plot-view" class:loaded>
    <svg bind:this={svgElement} xmlns="http://www.w3.org/2000/svg" viewBox={[-width / 2, -height / 2, width, height]}>
        <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="0" refY="5" markerUnits="strokeWidth" markerWidth="3" markerHeight="3" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z"/>
            </marker>
        </defs>
        <g bind:this={scalerElement}>
            <g class="link">
                {#each linksData as link}
                    {@const shortenedLinkTarget = shortenLine(link.source, link.target, nodeRadius + nodeMarginRadius + 4)}
                    <line
                        class={link.type}
                        x1={link.source.x}
                        y1={link.source.y}
                        x2={shortenedLinkTarget.x}
                        y2={shortenedLinkTarget.y}
                    ></line>
                {/each}
            </g>
            <g bind:this={nodesElement} class="node">
                <!--d3 renders these elements-->
            </g>
        </g>
    </svg>
    {#if !loaded}
        <div class="loader"><Loading/></div>
    {/if}
</div>

<style>
    #plot-view{
        width: 100%;
        height: 100%;
        grid-area: plotview;
        align-self: center;

        & svg{
            display: none;
            width: 100%;
            height: 100%;

            & #arrow{
                fill: #999;
                opacity: 0.6;
            }

            & .link line{
                stroke: #999;
                stroke-width: 1.5;
                stroke-opacity: 0.6;
                marker-end: url(#arrow);

                &.soul{
                    stroke: red;
                    stroke-dasharray: 4;
                }
            }

            & .node circle{
                fill: blue;
                stroke: #FFF;
                stroke-width: 1.5; /*If you change this, you need to manually change it in JS as well*/
            }
            & .node g{
                width: 12;
                height: 12;
                overflow: hidden;

                &:hover circle{
                    stroke: red;
                }
            }
            & .node text{
                text-anchor: middle;
                font-size: .1em;
                user-select: none;
            }
        }
        &.loaded svg{
            display: initial;
        }

        & .loader{
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
</style>