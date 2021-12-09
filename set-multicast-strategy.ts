#!/usr/bin/env -S node --loader tsm
import { ControlCommand, ControlResponse } from "@ndn/nfdmgmt";
import { TcpTransport } from "@ndn/node-transport";
import { Name } from "@ndn/packet";
import dotenv from "dotenv-defaults";

dotenv.config({ defaults: "sample.env" });

const uplink = await TcpTransport.createFace({}, "127.0.0.1", 6363);

let response: ControlResponse;
try {
  response = await ControlCommand.call("strategy-choice/set", {
    name: new Name(process.env.SYNC_PREFIX),
    strategy: new Name("/localhost/nfd/strategy/multicast"),
  });
} finally {
  uplink.close();
}

process.stderr.write(`set multicast strategy: ${response.statusCode} ${response.statusText}\n`);
if (response.statusCode !== 200) {
  process.exit(1);
}
