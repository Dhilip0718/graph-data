<template>
  <div id="app">
    <HierarchicalChart></HierarchicalChart>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import HierarchicalChart from './components/HierarchicalChart.vue';

export default Vue.extend({
  name: 'App',
  components: {
    HierarchicalChart,
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
