import { Component, createRef, h } from "preact";

interface Props {
  maxLength?: number;
  onSend: (text: string) => void;
}

export class ComposeForm extends Component<Props> {
  private readonly $text = createRef<HTMLTextAreaElement>();

  override render() {
    return (
      <form class="pure-form compose-form" onSubmit={this.handleSubmit}>
        <textarea ref={this.$text} class="pure-input-3-4" required maxLength={this.props.maxLength} onKeyUp={this.handleKeyUp}/>
        {" "}
        <button class="pure-button pure-button-primary" title="(CTRL+ENTER)">SEND</button>
      </form>
    );
  }

  private readonly handleSubmit = (evt: Event) => {
    evt.preventDefault();
    const text = this.$text.current!.value.trim();
    if (text === "") {
      return;
    }
    this.props.onSend(text);
    this.$text.current!.value = "";
  };

  private readonly handleKeyUp = (evt: KeyboardEvent) => {
    if (evt.key === "Enter" && evt.ctrlKey) {
      this.$text.current!.form!.requestSubmit();
    }
  };
}
