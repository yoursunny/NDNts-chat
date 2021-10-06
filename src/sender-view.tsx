import { Component, Fragment, h } from "preact";

interface Props {
  sender: string;
  isMe?: boolean;
}

export class SenderView extends Component<Props> {
  override render() {
    const { sender, isMe = false } = this.props;
    return (
      <dt class="sender-view">
        {sender}
        {isMe ? <>
          {" "}
          <em>(me)</em>
        </> : undefined}
      </dt>
    );
  }
}
