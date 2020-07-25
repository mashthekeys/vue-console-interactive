# basic-console

>Provides a Read-Eval-Print Loop console in the browser

## Demo usage

``` vue
<BrowserREPL />
```

Echoes user input into the command log.

## Extended usage

``` vue
<BrowserREPL
  :eval-function="command => alert(command)"
/>
```



## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```
