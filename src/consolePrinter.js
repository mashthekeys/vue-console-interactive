
const formatters = {
  // %c for CSS style not currently supported
  c: _IgnoreStyles,

  d: _Integer,
  i: _Integer,

  f: _Number,

  o: _Object,
  O: _Object,

  s: String,
};

function _IgnoreStyles() {
  return '';
}

function _Integer(value, precision) {
  const string = BigInt(value).toString();
  return (precision
          ? string.padStart(precision, '0')
          : string
  );
}

function _Number(value, precision) {
  return (precision
          ? Number(value).toFixed(precision)
          : Number(value).toString()
  )
}

function _Object(value, precision) {
  try {
    return JSON.stringify(value, null, 2);
  } catch (conversionError) {
    return `{!! Error converting ${typeof value} to JSON}`
  }
}

export default {
  $chainConsole(method, args) {
    const $nextConsole = this.$nextConsole;
    if ($nextConsole) {
      $nextConsole[method].apply($nextConsole, args);
    }
  },

  assert(test, errorMessage/*, ...rest*/) {
    if (!test) {
      this.printSubstitution([].slice.call(arguments, 1), {type: 'assert error'});
    }

    this.$chainConsole('assert', arguments);
  },

  count(label) {
    if (typeof label === "undefined") label = "default";

    const $consoleProps = this.$consoleProps ||
        (this.$consoleProps = {});

    const counter = $consoleProps.counter ||
        ($consoleProps.counter = {});

    counter[label] = 1 + (counter[label] | 0);

    this.print(`${label}: ${counter[label]}`, {
      type: 'count'
    });

    this.$chainConsole('count', arguments);
  },

  countReset(label) {
    if (typeof label === "undefined") label = "default";

    const $consoleProps = this.$consoleProps ||
        (this.$consoleProps = {});

    const counter = $consoleProps.counter ||
        ($consoleProps.counter = {});

    counter[label] = 0;

    this.print(`${label}: ${0}`, {
      type: 'count reset'
    });

    this.$chainConsole('countReset', arguments);
  },

  debug(/*...rest*/) {
    this.printSubstitution(arguments, {type: "debug"});

    this.$chainConsole('debug', arguments);
  },

  dir(object) {
    this.printSubstitution(["%o", object], {type: "dir"})

    this.$chainConsole('dir', arguments);
  },

  dirxml(object) {
    if (object instanceof Document) object = object.documentElement;

    if (object instanceof Element) {
      this.print(object.outerHTML, {type: "dirxml element"});
    } else {
      this.printSubstitution(["%o", object], {type: "dirxml json"});
    }

    this.$chainConsole('dirxml', arguments);
  },

  error(/*...rest*/) {
    if (arguments.length === 1
        && arguments[0] != null
        && arguments[0] instanceof Error
    ) {
      this.printTrace(arguments[0], {type: "error trace"});
    } else {
      this.printSubstitution(arguments, {type: "error"});
    }

    this.$chainConsole('error', arguments);
  },

  info(/*...rest*/) {
    this.printSubstitution(arguments, {type: "info"});

    this.$chainConsole('info', arguments);
  },

  log(/*...rest*/) {
    this.printSubstitution(arguments, {type: "log"});

    this.$chainConsole('log', arguments);
  },

  printSubstitution(items, printProps) {
    items = Array.from(items);

    const source = items.shift();

    const localFormatters = (this.$consoleProps && this.$consoleProps.formatters) || formatters;

    const message = source.replace(/%(\.?)([0-9]*)([A-Za-z%])/g, (match, dot, precision, format) => {
      if (match === '%%') return '%';

      const formatter = localFormatters[format];

      if (typeof formatter !== 'function') {
        return match;
      } else {
        const value = items.shift();

        return formatter(value, precision, format);
      }
    });

    items.unshift(message);

    this.print(items.join(" "), printProps);
  },

  printTrace(error, printProps) {
    const allowTrace = !!(this.$consoleProps || {}).allowTrace;

    if (allowTrace && 'stack' in error) {
      this.print(error.stack, printProps);

    } else {
      const aboutError = ((typeof error === 'object' && error !== null)
              ? {}.toString.call(error)
              : typeof error
      );
      this.print(aboutError, printProps);
    }
  },

  time(label) {
    if (typeof label === "undefined") label = "default";

    const $consoleProps = this.$consoleProps ||
        (this.$consoleProps = {});

    const timers = $consoleProps.timers ||
        ($consoleProps.timers = {});

    timers[label] = Date.now();

    this.$chainConsole('time', arguments);
  },

  timeEnd(label) {
    if (typeof label === "undefined") label = "default";

    const $consoleProps = this.$consoleProps ||
        (this.$consoleProps = {});

    const timers = $consoleProps.timers ||
        ($consoleProps.timers = {});

    if (label in timers) {
      const timeElapsed = Date.now() - timers[label];

      delete timers[label];

      this.print(`${label}: ${timeElapsed} (End)`, {
        type: 'timer reset'
      });
    } else {
      this.warn(`No timer named ${label}`);
    }

    this.$chainConsole('timeEnd', arguments);
  },

  timeLog(label) {
    if (typeof label === "undefined") label = "default";

    const $consoleProps = this.$consoleProps ||
        (this.$consoleProps = {});

    const timers = $consoleProps.timers ||
        ($consoleProps.timers = {});

    if (label in timers) {
      const timeElapsed = Date.now() - timers[label];

      this.print(`${label}: ${timeElapsed}ms`, {
        type: 'timer'
      });
    } else {
      this.warn(`No timer named ${label}`);
    }

    this.$chainConsole('timeLog', arguments);
  },

  trace() {
    this.printTrace(new EvalError('Stack trace requested'), {type: 'trace'});

    this.$chainConsole('trace', arguments);
  },

  warn(/*...rest*/) {
    this.printSubstitution(arguments, {type: "warn"});

    this.$chainConsole('warn', arguments);
  }
};