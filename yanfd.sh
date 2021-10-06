#!/bin/bash
set -eo pipefail
if ! command -v yanfd >/dev/null; then
  go install github.com/named-data/YaNFD/cmd/yanfd@latest
fi
if ! command -v dasel >/dev/null; then
  go install github.com/tomwright/dasel/cmd/dasel@latest
fi
if ! [[ -f runtime/yanfd.toml.sample ]]; then
  mkdir -p runtime
  curl -sfLS -o runtime/yanfd.toml.sample https://raw.githubusercontent.com/named-data/YaNFD/master/yanfd.toml.sample
fi

cp runtime/yanfd.toml.sample runtime/yanfd.toml
dasel put bool -f runtime/yanfd.toml '.faces.websocket.enabled' true
dasel put string -f runtime/yanfd.toml '.faces.websocket.bind' '127.0.0.1'
dasel put bool -f runtime/yanfd.toml '.mgmt.allow_localhop' true

yanfd -config runtime/yanfd.toml -disable-ethernet -disable-unix &
YANFD_PID=$!
trap "kill -s SIGINT $YANFD_PID" EXIT

sleep 2
node set-multicast-strategy.mjs
echo 'YaNFD is ready, press ENTER to stop'
read
