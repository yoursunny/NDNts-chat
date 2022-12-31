import { HierarchicalVerifier } from "@ndn/trust-schema";
import { Component, Fragment, h } from "preact";

import { type ChatMessage, ChatApp } from "./chat";
import { ComposeForm } from "./compose-form";
import type { ConnectResult } from "./connect";
import { env } from "./env";
import { HistoryView } from "./history-view";

interface Props {
  cr: ConnectResult;
}

interface State {
  history: ChatMessage[];
}

export class App extends Component<Props, State> {
  state = {
    history: [],
  };

  private chat!: ChatApp;

  override componentDidMount() {
    const { cr } = this.props;
    const verifier = new HierarchicalVerifier({
      trustAnchors: [cr.caCert],
    });
    this.chat = new ChatApp({
      myID: cr.myID,
      signer: cr.signer,
      verifier,
    });
    this.chat.on("messages", this.appendHistory);
  }

  override componentWillUnmount() {
    this.chat.close();
  }

  override render() {
    return (
      <>
        <HistoryView messages={this.state.history} myID={this.props.cr.myID}/>
        <ComposeForm maxLength={2048} onSend={this.handleSend}/>
      </>
    );
  }

  private readonly handleSend = (text: string) => {
    this.chat.send(text);
  };

  private readonly appendHistory = (m: Iterable<ChatMessage>) => {
    this.setState(({ history }) => {
      history.push(...m);
      history.sort((a, b) => a.timestamp - b.timestamp);
      const del = history.length - env.HISTORY_COUNT;
      if (del > 0) {
        history.splice(0, del);
      }
      return { history };
    });
  };
}
