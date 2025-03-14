<template>
  <div class='container'>
    <div id='graph'></div>
    <div v-if='dataLoaded'>
      <div class='node-details'>
        <h3>{{ selectedNode.name }}</h3>
        <span
          class='deselect-icon'
          @click='deselectNode'
          @keydown.enter='deselectNode'
          tabindex='0'
          role='button'
          aria-label='Deselect Node'
          >x</span
        >
        <p>{{ selectedNode.description }}</p>
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
        const response = await fetch('http://localhost:3000/api/data');
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

      const width = 900;
      const height = 700;
      const nodeRadius = 45;

      const svg = d3.select('#graph').append('svg').attr('width', width).attr('height', height);

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
        .attr('r', nodeRadius)
        .attr('fill', (d) => (d.data.parent ? 'lightblue' : 'orange'));

      nodes
        .append('text')
        .attr('dy', '0.41em')
        .attr('x', (d) => (d.children ? 6 : -5))
        .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
        .text((d) => d.data.name);

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
  stroke: #999;
  stroke-width: 1px;
}

.link {
  fill: none;
  stroke: #999;
  stroke-opacity: 0.6;
  stroke-width: 1.5px;
}

.node-details {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  z-index: 100;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.selected-node circle {
  stroke: blue;
  stroke-width: 3px;
}

.deselect-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  cursor: pointer;
  font-size: 14px;
}
</style>
