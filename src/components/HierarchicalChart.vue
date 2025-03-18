<template>
  <div class='container'>
    <div id='graph'></div>
    <div v-if='dataLoaded'>
      <div class='node-details'>
        <div class='card-header'>
        <h5>Node Details</h5>
        <span
          class='deselect-icon'
          @click='deselectNode'
          @keydown.enter='deselectNode'
          tabindex='0'
          role='button'
          aria-label='Deselect Node'
          >x</span
        >
      </div>
      <div class='card-body'>
        <h3>{{ selectedNode.name }}</h3>
        <p>{{ selectedNode.description }}</p>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import Vue from 'vue';

export default {
  name: 'HierarchicalChart',
  data() {
    return {
      selectedNode: null,
      dataLoaded: false,
      graphRendered: false,
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    /**
     * Fetches data from the URL specified in the environment variable `VUE_APP_GRAPH_DATA_URL`.
     * If an error occurs during the fetch operation, it logs the error to the console.
     *
     */
    async fetchData() {
      try {
        const response = await fetch('https://graph-data-bckup-01.azurewebsites.net/api/data');
        const data = await response.json();
        this.renderGraph(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    /**
     * Renders a hierarchical graph using D3.js.
     *
     * @param {Object[]} data - The hierarchical data to be visualized.
     *
     * This function creates an SVG element and uses D3's tree layout to
     * generate a hierarchical structure. It appends paths for links between
     * nodes and groups for each node, including circles and text labels.
     * Nodes are colored based on whether they have a parent or not.
     * The graph is rendered only once, controlled by the `graphRendered` flag.
     */
    renderGraph(data) {
      if (this.graphRendered) {
        return;
      }

      const width = 950;
      const height = 700;
      const nodeRadius = 50;
      const padding = -20;

      const svg = d3.select('#graph').append('svg').attr('width', width).attr('height', height)
        .attr('viewBox', [padding, 0, width, height]);

      const treeLayout = d3
        .tree()
        .size([height, width - 150])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2));

      const root = d3.hierarchy(data[0]);
      treeLayout(root);

      svg
        .selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr(
          'd',
          d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x),
        );

      const nodes = svg
        .selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', (d) => `translate(${d.y + 50},${d.x})`)
        .each(function (d) {
          this.nodeData = d;
        })
        .on('click', this.handleNodeClick);

      nodes
        .append('circle')
        .attr('r', nodeRadius);

      nodes
        .append('text').text((d) => d.data.name);

      this.graphRendered = true;
    },

    /**
     * Handles the click event on a node in the hierarchical chart.
     *
     * @param {Event} event - The click event triggered by the user on the node.
     *
     * This method performs the following actions:
     * - Retrieves the clicked node's data.
     * - Toggles the selection state of the clicked node.
     * - If the node is already selected, it deselects it and sets `dataLoaded` to false.
     * - Updates the CSS class of the selected node for visual indication.
     */
    handleNodeClick(event) {
      const g = event.currentTarget;
      const nodeData = g.nodeData.data;

      if (this.selectedNode && this.selectedNode.name === nodeData.name) {
        this.selectedNode = null;
        this.dataLoaded = false;
        d3.select(g).classed('selected-node', false);
      } else {
        d3.selectAll('.selected-node').classed('selected-node', false);
        this.selectedNode = nodeData;
        this.dataLoaded = true;
        d3.select(g).classed('selected-node', true);

        if (this.selectedNode.children) {
          const updatedChildren = this.selectedNode.children.map((child) => ({
            ...child,
          }));
          Vue.set(this.selectedNode, 'children', updatedChildren);
        }
      }
    },

    /**
     * Deselects the currently selected node in the hierarchical chart.
     *
     * This method performs the following actions:
     * 1. Checks if there is a selected node.
     * 2. If a node is selected, retrieves its name.
     * 3. Iterates through all nodes in the chart and removes the 'selected-node' class
     *    from the node that matches the selected node's name.
     * 4. Resets the selected node to null.
     * 5. Sets the dataLoaded flag to false.
     * 6. Waits for the next DOM update cycle to complete.
     *
     * @returns {Promise<void>} A promise that resolves when the next DOM update cycle is complete.
     */
    async deselectNode() {
      if (this.selectedNode) {
        const selectedNodeName = this.selectedNode.name;

        d3.selectAll('.node').each((d, i, nodes) => {
          const currentNode = nodes[i];
          const currentNodeData = currentNode.nodeData;

          if (
            currentNodeData
            && currentNodeData.data
            && currentNodeData.data.name === selectedNodeName
          ) {
            d3.select(currentNode).classed('selected-node', false);
          }
        });

        this.selectedNode = null;
        this.dataLoaded = false;
        await this.$nextTick();
      }
    },
  },
};
</script>

<style>
.node circle {
  fill: #50C9CE;
  filter: drop-shadow(3px 3px 5px rgba(0, 0, 0, 0.2));
  transition: r 0.3s ease-in-out;
}

.node circle:hover, .selected-node circle {
  r: 55;
  cursor: pointer;
}

.node text {
  fill: #fff;
  font-size: 1.5em;
  font-weight: bold;
  text-anchor: middle;
  dominant-baseline: middle;
  cursor: pointer;
}

.link {
  fill: none;
  stroke: #2E382E;
  stroke-opacity: 0.6;
  stroke-width: 1.5px;
}

.node-details {
  position: absolute;
  top: 150px;
  left: 50px;
  background-color: white;
  border: 1px solid #eee;
  z-index: 100;
  box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.selected-node circle {
  stroke: #50C9CE;
  stroke-width: 20px;
  stroke-opacity: 0.4;

}

.deselect-icon {
  cursor: pointer;
  font-size: 20px;
  line-height: 0em;
  padding: 10px;
  color: #939393;
  font-weight: bold;
}

.node-details .card-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
}

.node-details .card-header h5 {
  margin: 0;
  padding-left: 10px;
}

.node-details .card-body {
  padding: 10px;
}

.node-details .card-body h3 {
  margin: 0;
  text-align: left;
}
</style>
