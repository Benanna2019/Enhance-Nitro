export default function HelloWorld({ html, state }) {
  const { attrs } = state;
  const { greeting = "Hello World" } = attrs;
  return html`
    <style scope="global">
      h1 {
        color: red;
      }
    </style>

    <h1>${greeting}</h1>
    <button id="changeMessage">Click me!</button>
    <script type="module">
      document.getElementById("changeMessage").addEventListener("click", () => {
        document.querySelector("h1").textContent = "Updated from client!";
      });
    </script>
  `;
}
