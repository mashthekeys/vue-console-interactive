<template>
  <ConsoleOutput mount-global />
</template>

<script>
  import ConsoleOutput from "./ConsoleOutput";

  export default {
    name: "DemoGlobal",
    components: {ConsoleOutput},
    mounted() {
      const demoFunctions = [
        () => {},
        () => console.log('This is a demo of <ConsoleOutput>.'),
        () => console.log('Messages from the browser console appear here and vice versa.'),
        () => console.info('console.info() message'),
        () => console.warn('console.warn() message'),
        () => console.error('console.error() message'),
        () => console.dir({'demo': 'console.dir()'}),
        () => console.count('console.count() demo'),
        () => {
          console.time('console.time() demo');
          console.timeLog('console.time() demo');
        },
        () => console.count('console.count() demo'),
        () => console.timeLog('console.time() demo'),
        () => console.count('console.count() demo'),
        () => console.timeEnd('console.time() demo'),
      ];

      const demo = setInterval(() => {
        (demoFunctions.shift())();

        if (!demoFunctions.length) clearInterval(demo);
      }, 1500);
    }
  }
</script>

<style scoped>

</style>