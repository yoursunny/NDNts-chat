import DOMPurify from "dompurify";
import marked from "marked";
import { Component, h } from "preact";

import type { ChatMessage } from "./chat";

const purify = DOMPurify();
purify.addHook("afterSanitizeAttributes", (element) => {
  if ("target" in element) {
    element.setAttribute("target", "_blank");
    element.setAttribute("rel", "noopener");
  }
});

const dtFmt = new Intl.DateTimeFormat([], {
  dateStyle: "medium",
  timeStyle: "medium",
});

interface Props {
  message: ChatMessage;
}

export class MessageView extends Component<Props> {
  override render() {
    const { seqNum, timestamp, text } = this.props.message;
    const dt = dtFmt.format(new Date(timestamp));
    const html = purify.sanitize(marked(text, {
      breaks: true,
      gfm: true,
      headerIds: false,
      silent: true,
    }), {
      USE_PROFILES: { html: true },
    });
    // eslint-disable-next-line react/no-danger
    return <dd class="message-view" title={`${dt}\nseqNum=${seqNum}`} dangerouslySetInnerHTML={{ __html: html }}/>;
  }
}
