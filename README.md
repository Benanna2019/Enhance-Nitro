# Enhance-Nitro

This is the beginning of what I will be an enhance.dev nitro framework/starter. I know nothing about making a framework so let's see how we can do.

## Features

- [ ] SSR
- [ ] Client-side rendering
- [ ] Local First (Gonna start with LiveStore)
- [ ] Routing
- [ ] API Routes
- [ ] Middleware
- [ ] Authentication (thinking passkeys with Casey Wilson)

## Rendering Enhance Elements

Currently there are a few ways. In each route in `src/server/routes` we have html templates.
Eventually this would be loaded dynamically based off of a templates folder and a nitro directive for loading in templates. 

For now we can do a few things. The primary thing for SSRing the Elements is: 

1. Import
2. Run through SSR
3. Write it in the template we are rendering

Here is an example of a route that is SSRing an element:

First we import the elements into the file. For passing them in here make sure you default export the elements.

```ts
import enhance from '@enhance/ssr'
import HelloWorld from '../../elements/hello-world.mjs';
import MyHeader from '../../elements/my-header.mjs';
import TestElement from '../../elements/test-element.mjs';
```

In our event hander we run the imports as element references.
```ts
export default defineEventHandler((event) => {
   // Example of using enhance.dev for SSR
//   console.log("event", event.node.req)
  const html = enhance({
    elements: {
      'hello-world': HelloWorld,
      'my-header': MyHeader,
      'test-element': TestElement,
    }
  });
```

Then in the template we can do this: 

```js
`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Server Rendered Page</title>
        
        <script type="module" src="/browser/enhance-button.mjs"></script>
        <script>
        console.log("enhance-button.mjs")
        </script>
      </head>
      <body>
        ${html`
          <hello-world greeting="Server Rendered!"></hello-world>
          <my-header heading="Server Rendered Header"></my-header>
        `}
        <h1>Hello World</h1>
        <a href="/about">About</a>
        <my-counter count=5></my-counter>
        <my-increment click></my-increment>
        <my-decrement click></my-decrement>
      </body>
    </html>
  `
```

You'll notice the use of the `html` tagged template function which is the return of the enhance function. This is how we render the elements.

### Composing Elements

Composing Elements is much simpler than it initially appears to be. Above if you look where we are importing our `TestElement` we have to do that so that enhance knows about it. However, if you look in the html, we are not mounting the element. If you were running this you would see it on the rendered page.

In our `<my-header></my-header>` our TestElement is being used. Below is what the MyHeader element looks like. 

```js
export default function MyHeader({ html, state  }) {
  const { attrs={} } = state
  const { heading='default' } = attrs
  return html`
    <style>
      :host {
        color: red;
      }
    </style>
    <h1>${heading}</h1>
    <test-element></test-element>
    <script type="module" src="/browser/my-header.mjs"></script>
  `
}
```

So because we registered the `TestElement` we can use it in our template. 

### Client Side Code

The above `MyHeader` element has a script tag that references a element in the browser folder with the same name of my-header.mjs. This is an enhance convention of enhance. If we look in our browser `MyHeader` file we see the following: 


```js
import CustomElement from 'https://unpkg.com/@enhance/custom-element@1.2.4/index.mjs?module=true'
import MyHeaderElement from '../../elements/my-header.mjs'

class MyHeader extends CustomElement {
  constructor() {
    super()
    this.header = this.querySelector('h1')

    this.header.addEventListener('click', () => {
      this.headingChanged('changed from the browser')
    })

  }

  connectedCallback() {
     this.header.textContent = 'browser header'
  }

  render(args) {
    return MyHeaderElement(args)
  }

  click() {
    console.log('click')
  }

  static get observedAttributes() {
    return [ 'heading' ]
  }

  headingChanged(value) {
    this.header.textContent = value
  }
}
customElements.define('my-header', MyHeader)
```

We are using some enhance niceties on due to the import of their `CustomElement` class. But this is allowing us to progressively enhance our elements. So out of convention we put the browser code in the browser folder and the server code in the elements folder. You could just as well write a script tag in the element in the elements folder but its nice to have the separate.

There are some more things but this is the basic idea. 

## Some Notes
Currently we have to import each element into the route and then run it through enhance ssr. I think in the future we would just read from a directory and run everything through SSR so we can just author templates that are then handled with the html tagged template function.

After this we can do anything we would normally do. There is some config in the nitro.config.ts that sets up our directories: 

```ts
publicAssets: [{
    baseURL: 'browser',
    dir: './src/public/browser'
  }, {
    baseURL: 'elements',
    dir: './src/elements'
  }],
```

These could just as easily have same folder conventions as an enhance.dev project. This is just what I have for testing for no real reason.

### Tangential Dream Feature

Id like to use some WASM loading features and add entry points for any language as a server handler. I don't know how this would happen but I know vite has this ability with Go, Rust and other languages.

Somoene make it happen

