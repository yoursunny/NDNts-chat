import { Name } from "@ndn/packet";

export const env = {
  ROUTER: process.env.ROUTER!,
  SYNC_PREFIX: new Name(process.env.SYNC_PREFIX),
  USER_PREFIX: new Name(process.env.USER_PREFIX),
  CA_PREFIX: new Name(process.env.CA_PREFIX),
  HISTORY_COUNT: Number.parseInt(process.env.HISTORY_COUNT!, 10),
};
