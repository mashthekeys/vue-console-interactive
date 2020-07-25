<template>
  <div class="ConsoleOutput"
       tabindex="-1"
       @scroll="onScrollEnd"
       @touchstart="onScrollStart"
       @wheel="onScrollStart"
  >
    <div :class="{outer: true, scrolling}">
      <div class="inner">
        <output
          v-for="($item, index) in consoleOutput"
          :key="index"
          :class="$item.type"
        >{{ $item.message }}</output>
      </div>
    </div>
  </div>
</template>

<script>
  import consolePrinter from "../consolePrinter";

  export default {
    name: "ConsoleOutput",
    
    mixins: [
      {methods: consolePrinter}
    ],

    props: {
      mountGlobal: {
        type: Boolean
      },
    },

    mounted() {
      if (this.mountGlobal) {
        this.$nextConsole = window.console;
        window.console = this;
      }
    },

    destroyed() {
      if (this.mountGlobal && this.$nextConsole) {
        window.console = this.$nextConsole;

        this.$nextConsole = undefined;
      }
    },

    data() {
      return {
        consoleOutput: [],
        scrolling: false,
        scrollSnapThreshold: 4
      }
    },

    methods: {
      clear() {
        this.$set(this, 'consoleOutput', []);
      },

      onScrollStart($event) {
        if (this.scrolling) return;

        const scrollReady = (
            $event.type === 'touchstart'
            || ($event.type === 'wheel' && $event.deltaY < 0)
        );

        if (scrollReady) {
          this.scrolling = true;

          // Calling preventDefault allows the next event to start a fresh scroll
          $event.preventDefault();
        }
      },

      onScrollEnd(/*$event*/) {
        if (!this.scrolling) return;

        const $el = this.$el;

        const scrollDistance = $el.scrollHeight - $el.clientHeight - $el.scrollTop;

        const nearStart = scrollDistance <= this.scrollSnapThreshold;

        if (nearStart) {
          this.scrolling = false;
        }
      },

      print(message, messageProps) {
        this.consoleOutput.push(Object.assign({}, messageProps, {message}, ));
        this.scrolling = false;
      },
    },

    watch: {
      scrolling(value) {
        if (value) this.$nextTick(() => {
          const $el = this.$el;

          $el.scrollTop = ($el.scrollHeight - $el.clientHeight - this.scrollSnapThreshold * 2);
        });
      }
    }
  }
</script>

<style scoped>
  * {
    box-sizing: border-box;
  }

  div.ConsoleOutput {
    position: relative;

    margin: 0;
    width: 100%;
    height: 100vh;
    padding: 0;

    overflow-y: scroll;

    text-align: left;

    background: black;

    color: hsl(0, 0%, 90%);

    font-size: 36px;
    font-family: monospace;
    line-height: 1.05;

    /* Transform makes this the containing block */
    transform: scale(1);
  }

  div.outer {
    position: fixed;
    bottom: 0.1em;

    width: 100%;
    min-height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    touch-action: pan-y;

    background: black;
  }

  div.outer.scrolling {
    position: relative;
  }

  div.inner {
    position: relative;

    width: 100%;
    min-height: 100%;

    margin: 0;
    padding: 0;
  }


  @supports (mix-blend-mode: multiply) {
    div.inner::after {
      content: '';
      display: block;

      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;

      background: linear-gradient(10deg,
        hsl(51, 100%, 50%) 0%,
        hsl(39, 100%, 50%) 10%,
        hsl(300, 100%, 65%) 70%,
        hsl(220, 100%, 65%) 100%
      )
      left bottom/100% 300vh;

      mix-blend-mode: multiply;

      opacity: 0.8;

      pointer-events: none;
    }
  }
  @supports (z-index: max(0, 1)) {
    div.inner::after {
      background-size: 100% max(100%, 300vh);
    }
  }

  output {
    display: block;
    position: relative;

    width: 100%;

    margin: 0 0 0.05em 0;
    border-bottom: solid hsla(0, 0%, 50%, 0.4) 1px;
    padding: 0.05em 0 0.1em 0;

    white-space: pre-wrap;
  }

  output.command {
    border-bottom: 0;
    padding-bottom: 0;

    opacity: 0.55;
  }

  output.faded { opacity: 0.55; }

  output.count,
  output.info,
  output.timer { color: white; }
  output.debug { color: gray; }
  output.error { color: orangered; }
  /*output.log { }*/
  /*output.dir { }*/
  /*output.dirxml { }*/
  output.warn { color: gold; }

</style>