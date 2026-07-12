Status: Getting rid of the weird syntax and system variables

## Usage

```typst
#import "lib.typ": num

#let user-number = 1 // default value

// ui

Input: #num[user-number]\
Its value: #user-number
```

the `// ui` is where the app is going to update all the variables used in `num`, `txt`, `chk`.

## Starting The Server

1. clone the dist directory
2. `node server.js`
3. copy the `Caddyfile` to wherever you need it and adjust the root path
4. `caddy run`

## Building

```shell
npm install
npm run build
```

## Features

- number inputs
- text inputs
- dynamic page size
- multi-page
- checkboxes
- focus tracking
- dyn guess on data type

## Missing Features

- proper font support
- swap button

Eventually:

- browser-only version
- radio buttons - can't come up with a DX I like
