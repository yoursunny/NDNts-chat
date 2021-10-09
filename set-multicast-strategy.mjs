import { ControlCommand } from "@ndn/nfdmgmt";
import { TcpTransport } from "@ndn/node-transport";
import { Name } from "@ndn/packet";
import dotenv from "dotenv-defaults";

dotenv.config({ defaults: "sample.env" });

async function main() {
  const uplink = await TcpTransport.createFace({}, "127.0.0.1", 6363);

  /** @type {import("@ndn/nfdmgmt").ControlResponse} */
  let response;
  try {
    response = await ControlCommand.call("strategy-choice/set", {
      name: new Name(process.env.SYNC_PREFIX),
      strategy: new Name("/localhost/nfd/strategy/multicast"),
    });
  } finally {
    uplink.close();
  }

  process.stderr.write(`set multicast strategy: ${response.statusCode} ${response.statusText}\n`);
  if (response.statusCode === 200) {
    process.exitCode = 0;
  } else {
    process.exitCode = 1;
  }
}

main();
