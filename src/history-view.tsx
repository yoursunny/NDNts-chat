import { Component, createRef, h } from "preact";

import type { ChatMessage } from "./chat";
import { MessageView } from "./message-view";
import { SenderView } from "./sender-view";

interface Props {
  messages: ChatMessage[];
  myID: string;
}

export class HistoryView extends Component<Props> {
  private readonly $dl = createRef<HTMLDListElement>();

  override componentDidUpdate() {
    this.$dl.current!.scrollTop = this.$dl.current!.scrollHeight;
  }

  override render() {
    const { messages, myID } = this.props;
    return (
      <dl ref={this.$dl} class="history-view">
        {messages.map((m, i) => [
          m.sender === messages[i - 1]?.sender ? undefined : (
            <SenderView key={`a_${m.sender}_${m.seqNum}`} sender={m.sender} isMe={m.sender === myID}/>
          ),
          <MessageView key={`t_${m.sender}_${m.seqNum}`} message={m}/>,
        ])}
      </dl>
    );
  }
}
