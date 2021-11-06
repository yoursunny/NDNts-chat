import { h, render } from "preact";

import { App } from "./app";
import { connect } from "./connect";

async function main() {
  const cr = await connect();
  render(<App cr={cr}/>, document.body);
}

document.addEventListener("DOMContentLoaded", main);
