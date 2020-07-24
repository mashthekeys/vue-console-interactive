<template>
  <div :class="{console: true, scrolling}"
       @scroll="onScrollEnd"
       @touchstart="onScrollStart"
       @wheel="onScrollStart"
  >
    <output
      :style="{paddingBottom: `${1.0 * userInputLines}em`}"
      @keypress="focus"
    >
      <pre
        v-for="$item in consoleOutput"
        :class="$item.class"
      >{{ typeof $item.label !== 'undefined' ? $item.label : $item }}</pre>
    </output>
    <div class="user">
      <span class="prompt">{{ prompt }}</span>
      <textarea
        ref="textarea"
        v-model="userInput"
        placeholder="█"
        :style="{height: `${1.0 * userInputLines}em`}"
        @keydown.enter="onEnter"
      ></textarea>
      <button
        type="button"
        name="execute"
        :style="{color: userInput.length ? void 0 : 'gray'}"
        @click="onEval"
      >{{evalLabel}}</button>
    </div>
  </div>
</template>

<script>
  export default {
    name: "BrowserREPL",

    props: {
      evalFunction: {
        type: Function,
        default: async function evalFunction(command) {
          return command;
        }
      },
      evalLabel: {
        type: String,
        default: '↲'
      },
      print: {
        type: Function,
        default: async function print(output) {
          this.consoleOutput.push(output);
          this.scrolling = false;
        }
      },
      printCommands: {
        type: Boolean,
        default: true,
      },
      prompt: {
        type: String,
        default: "echo\xa0"
      },
      read: {
        type: Function,
        default: async function read() {
          const raw = this.userInput;

          const command = raw.replace(/\\\n/g, "\n");

          this.userInput = '';

          return {raw, command};
        }
      },
    },

    data() {
      return {
        consoleOutput: [],
        scrolling: false,
        scrollSnapThreshold: 4,
        userInput: ''
      }
    },

    methods: {
      async 'eval'(command) {
        return this.print(await this.evalFunction(command));
      },

      focus() {
        const textAreaElement = this.$refs.textarea;
        textAreaElement && textAreaElement.focus();
      },

      onEnter($event) {
        const target = $event.target;

        const atEnd = target.selectionStart >= target.value.length;

        const command = this.userInput;

        const slashAtEnd = /\\$/.test(command);

        // console.log('onEnter', {command, atEnd, slashAtEnd});

        if (atEnd && !slashAtEnd) {
          this.onEval($event);
        }
      },

      async onEval($event) {
        $event.preventDefault();
        $event.stopImmediatePropagation();

        const input = await this.read();

        this.focus();

        if (input.command.length) {
          if (this.printCommands) {
            await this.print({
              label: `${this.prompt}${input.raw}`,
              class: 'command'
            });
          }

          return this.eval(input.command);
        }
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

      onScrollEnd($event) {
        if (!this.scrolling) return;

        const $el = this.$el;

        const scrollDistance = $el.scrollHeight - $el.clientHeight - $el.scrollTop;

        const nearStart = scrollDistance <= this.scrollSnapThreshold;

        if (nearStart) {
          this.scrolling = false;
        }
      },
    },

    computed: {
      userInputLines() {
        return (this.userInput.match(/\n/g) || []).length + 1;
      }
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

  div.console {
    position: relative;

    margin: 0;
    width: 100%;
    height: 100vh;
    padding: 0;

    overflow-y: scroll;

    text-align: left;

    background: hsl(280, 0%, 10%);

    color: hsl(210, 98%, 90%);

    font-size: 36px;
    font-family: monospace;
    line-height: 1.0;
  }

  div.console::before {
    content: '';
    display: block;
    width: 100%;
    height: calc(100% - 2em);
  }

  output {
    display: block;

    position: fixed;
    bottom: 0.1em;

    width: 100%;

    margin: 0;
    padding: 0;

    touch-action: pan-y;

/*
    background: linear-gradient(-70deg, gold 0%, orange 10%, darkmagenta 70%, black 100%)
      left top/100vw 200vh;
*/
  }

  div.scrolling > output {
    position: relative;
  }

  pre {
    width: 100%;

    margin: 0 0 0.05em 0;
    border-bottom: solid lightcyan 0.333px;
    padding: 0.05em 0 0 0;
  }

  pre.command {
    color: gray;
  }

  div.user {
    position: fixed;

    display: flex;

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