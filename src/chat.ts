import { Endpoint, Producer } from "@ndn/endpoint";
import { SequenceNum } from "@ndn/naming-convention2";
import { Component, Data, Interest } from "@ndn/packet";
import { SvSync, SyncNode, SyncUpdate } from "@ndn/sync";
import { fromUtf8, toUtf8 } from "@ndn/tlv";
import mitt, { Emitter } from "mitt";

import { env } from "./env";

export interface ChatMessage {
  sender: string;
  seqNum: number;
  timestamp: number;
  text: string;
}

type EventMap = {
  messages: ChatMessage[];
};

export class ChatApp {
  constructor() {
    Object.assign(this, mitt());

    this.myID = Math.trunc(Math.random() * 1e9).toString().padStart(8, "0");

    this.sync = new SvSync({ syncPrefix: env.SYNC_PREFIX });
    this.sync.on("update", this.handleUpdate);
    this.myNode = this.sync.add(this.myID);

    this.producer = new Endpoint().produce(env.USER_PREFIX.append(this.myID), this.handleInterest);
    this.consumer = new Endpoint({
      retx: 2,
      signal: this.consumerAbort.signal,
    });
  }

  public readonly myID: string;
  private readonly sync: SvSync;
  private readonly myNode: SyncNode<SvSync.ID>;

  private readonly producer: Producer;
  private readonly sentMessages = new Map<number, ChatMessage>();

  private readonly consumerAbort = new AbortController();
  private readonly consumer: Endpoint;

  public close(): void {
    this.sync.close();
    this.producer.close();
    this.consumerAbort.abort();
  }

  public send(text: string): void {
    const seqNum = ++this.myNode.seqNum;
    const msg: ChatMessage = {
      sender: this.myID,
      seqNum,
      timestamp: Date.now(),
      text,
    };
    this.sentMessages.set(seqNum, msg);
    this.emit("messages", [msg]);
  }

  private readonly handleInterest = async (interest: Interest) => {
    if (interest.name.length !== env.USER_PREFIX.length + 2 || !interest.name.get(-1)!.is(SequenceNum)) {
      return;
    }
    const seqNum = interest.name.get(-1)!.as(SequenceNum);
    const msg = this.sentMessages.get(seqNum);
    if (!msg) {
      return;
    }
    return new Data(interest.name, toUtf8(JSON.stringify({
      timestamp: msg.timestamp,
      text: msg.text,
    })));
  };

  private readonly handleUpdate = async (update: SyncUpdate<SvSync.ID>) => {
    const sender = update.id.text;
    const prefix = env.USER_PREFIX.append(new Component(undefined, update.id.value));
    const messages: ChatMessage[] = (await Promise.allSettled(
      Array.from(update.seqNums()).map(async (seqNum): Promise<ChatMessage> => {
        const name = prefix.append(SequenceNum, seqNum);
        const data = await this.consumer.consume(name);
        const {
          timestamp,
          text,
        } = JSON.parse(fromUtf8(data.content));
        if (!Number.isSafeInteger(timestamp) || typeof text !== "string") {
          throw new Error("invalid JSON");
        }
        return {
          sender,
          seqNum,
          timestamp,
          text,
        };
      }))
    ).filter((r): r is PromiseFulfilledResult<ChatMessage> => r.status === "fulfilled")
      .map((r) => r.value);
    if (messages.length > 0) {
      this.emit("messages", messages);
    }
  };
}
export interface ChatApp extends Emitter<EventMap> {}
