<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <GraphData></GraphData>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import GraphData from './components/graphData.vue';

export default Vue.extend({
  name: 'App',
  components: {
    GraphData,
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
