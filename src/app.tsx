import { Component, Fragment, h } from "preact";

import { ChatApp, ChatMessage } from "./chat";
import { ComposeForm } from "./compose-form";
import { env } from "./env";
import { HistoryView } from "./history-view";

interface State {
  myID: string;
  history: ChatMessage[];
}

export class App extends Component<{}, State> {
  state = {
    myID: "",
    history: [],
  };

  private chat!: ChatApp;

  override componentDidMount() {
    this.chat = new ChatApp();
    this.chat.on("messages", this.appendHistory);
    this.setState({ myID: this.chat.myID });
  }

  override componentWillUnmount() {
    this.chat.close();
  }

  override render() {
    return (
      <>
        <HistoryView messages={this.state.history} myID={this.state.myID}/>
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
