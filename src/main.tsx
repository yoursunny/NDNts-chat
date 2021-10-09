import { enableNfdPrefixReg } from "@ndn/nfdmgmt";
import { WsTransport } from "@ndn/ws-transport";
import { h, render } from "preact";

import { App } from "./app";
import { env } from "./env";

async function main() {
  const uplink = await WsTransport.createFace({}, env.ROUTER);
  enableNfdPrefixReg(uplink);

  render(<App/>, document.body);
}

document.addEventListener("DOMContentLoaded", main);
