# NDNts-chat

This is a web-based text chat application built with [NDNts](https://yoursunny.com/p/NDNts/).

![NDNts logo](https://cdn.jsdelivr.net/gh/yoursunny/NDNts@8bd2f28d7893a7ea3a7342a169af5a21bb4c7636/docs/logo.svg)

Technical highlights:

* Designed for local area network, does not require connection to global NDN network.
* State Vector Sync for information distribution.
* Packets are validated with hierarchical trust model.

Usage instructions:

1. Dependencies: Node 16.x, Go 1.16 or newer.
2. `npm install` or `pnpm install` to install dependencies.
3. `./server.sh` to start server components: YaNFD forwarder, NDNCERT certificate authority.
4. `npm run serve` to start web server.
5. Visit `http://localhost:3333` in two or more browsers.

Current limitations:

* Webpage is only accessible from localhost.
* One forwarder serves all users.
* Certificate authority has no validation.
* Prefix registration has no validation.
