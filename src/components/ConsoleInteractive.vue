<template>
  <div class="ConsoleInteractive">
    <ConsoleOutput
      ref="display"
      :style="{bottom: `${1.05 * userInputLines}em`}"
      @keypress="focusAppend"
    ></ConsoleOutput>
    <div class="user">
      <span class="prompt">{{ prompt }}</span>
      <textarea
        ref="textarea"
        v-model="userInput"
        placeholder="█"
        :style="{height: `${1.05 * userInputLines}em`}"
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
  import consolePrinter from "../consolePrinter";
  import ConsoleOutput from "./ConsoleOutput";

  export default {
    name: "ConsoleInteractive",
    
    mixins: [
      {methods: consolePrinter}
    ],

    components: { ConsoleOutput },

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
      printCommands: {
        type: Boolean,
        default: true,
      },
      prompt: {
        type: String,
        default: "echo\xa0"
      },
    },

    data() {
      return {
        userInput: ''
      }
    },

    methods: {
      clear() {
        this.$refs.display.clear();
      },

      async 'eval'(command) {
        return this.print(await this.evalFunction(command));
      },

      focusAppend($event) {
        this.userInput += $event.key;

        this.focus();
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

        if (atEnd && !slashAtEnd) {
          this.onEval($event);
        }
      },

      async onEval($event) {
        $event.preventDefault();
        $event.stopImmediatePropagation();

        const input = this.read();

        this.focus();

        if (input.command.length) {
          if (this.printCommands) {
            this.print(
                `${this.prompt}${input.raw}`,
                { type: 'command' }
            );
          }

          return this.eval(input.command);
        }
      },

      print(message, messageProps) {
        this.$refs.display.print(message, messageProps);
      },

      read() {
        const raw = this.userInput;

        const command = raw.replace(/\\\n/g, "\n");

        this.userInput = '';

        return {raw, command};
      }
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

  div.ConsoleInteractive {
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
  }

  div.ConsoleInteractive > div.ConsoleOutput {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: auto;
  }

  div.user {
    position: absolute;

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