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