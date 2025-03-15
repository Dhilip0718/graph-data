<template>
  <div id="app">
    <PageHeader></PageHeader>
    <HierarchicalChart></HierarchicalChart>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import HierarchicalChart from './components/HierarchicalChart.vue';
import PageHeader from './components/Header.vue';

export default Vue.extend({
  name: 'App',
  components: {
    HierarchicalChart,
    PageHeader,
  },
});
</script>

<style lang="scss">
body {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8f8f8;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
