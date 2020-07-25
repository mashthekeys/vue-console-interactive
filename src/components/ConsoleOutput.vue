<template>
  <div class="ConsoleOutput"
       @scroll="onScrollEnd"
       @touchstart="onScrollStart"
       @wheel="onScrollStart"
  >
    <div :class="{outer: true, scrolling}" tabindex="-1">
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

  output.white { z-index: 1; color: whitesmoke; }

  div.user {
    position: fixed;

    display: flex;

    z-index: 2;
    width: 100%;
    bottom: 0;

    background: hsl(0, 0%, 4%);
  }

  span.prompt {
    display: block;

    flex-grow: 0;

    color: hsl(55, 100%, 85%);
  }

  textarea {
    flex-grow: 1;
    resize: none;

    vertical-align: text-top;

    font-size: inherit;
    font-family: monospace;

    border: none;
    background: hsl(0, 0%, 4%);
    color: hsl(55, 100%, 75%);
    caret-color: hsl(0, 0%, 50%);

    overflow-y: hidden;
  }

  textarea:focus {
    outline: none;
  }

  textarea::placeholder {
    color: hsl(0, 0%, 20%);
    opacity: 1;
  }

  textarea:focus::placeholder {
    color: hsl(55, 100%, 50%);
  }

  textarea:focus:placeholder-shown {
    animation: BrowserREPL_blink step-end infinite 2s;
  }

  @keyframes BrowserREPL_blink {
    from {
      opacity: 1;
    }
    50% {
      opacity: 0.1;
    }
  }

  textarea::selection {
    background: hsl(0, 0%, 90%);
    color: hsl(280, 0%, 10%);
  }

  button[name=execute] {
    flex-grow: 0;

    font: inherit;

    min-width: 1.5em;

    background: hsl(0, 0%, 4%);
    color: hsl(55, 100%, 50%);

    border: dotted 0.05em;
    border-radius: 0.15em;
  }

  button[name=execute]:active,
  button[name=execute]:focus {
    border-style: solid;
    outline: none;
  }

</style>