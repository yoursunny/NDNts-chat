#!/bin/bash
set -eo pipefail
export MSYS_NO_PATHCONV=1
if ! command -v yanfd >/dev/null; then
  go install github.com/named-data/YaNFD/cmd/yanfd@latest
fi
if ! command -v dasel >/dev/null; then
  go install github.com/tomwright/dasel/cmd/dasel@latest
fi
if ! [[ -f runtime/yanfd.toml.sample ]]; then
  mkdir -p runtime
  curl -fsLS -o runtime/yanfd.toml.sample https://raw.githubusercontent.com/named-data/YaNFD/master/yanfd.toml.sample
fi

YANFD_PID=
CA_PID=
cleanup() {
  if [[ -n $YANFD_PID ]]; then
    kill -s SIGINT $YANFD_PID
  fi
  if [[ -n $CA_PID ]]; then
    kill -s SIGTERM $CA_PID
  fi
}
trap cleanup EXIT

yanfd_start() {
  cp runtime/yanfd.toml.sample runtime/yanfd.toml
  dasel put bool -f runtime/yanfd.toml '.faces.ethernet.enabled' false
  dasel put bool -f runtime/yanfd.toml '.faces.unix.enabled' false
  dasel put bool -f runtime/yanfd.toml '.faces.tcp.enabled' true
  dasel put bool -f runtime/yanfd.toml '.faces.websocket.enabled' true
  dasel put string -f runtime/yanfd.toml '.faces.websocket.bind' '127.0.0.1'
  dasel put bool -f runtime/yanfd.toml '.mgmt.allow_localhop' true

  yanfd -config runtime/yanfd.toml &
  YANFD_PID=$!

  sleep 2
  ./set-multicast-strategy.ts
}

ca_start() {
  local KEYCHAIN_CLI=./node_modules/.bin/ndnts-keychain
  export NDNTS_KEYCHAIN=./runtime/keychain
  export NDNTS_UPLINK=tcp://localhost:6363
  if ! [[ -f ./runtime/profile.data ]]; then
    source sample.env
    [[ -f .env ]] && source .env
    rm -rf "${NDNTS_KEYCHAIN}"
    CACERT=$($KEYCHAIN_CLI gen-key "${CA_PREFIX}")
    echo $CACERT
    $KEYCHAIN_CLI ndncert03-make-profile --out ./runtime/profile.data --prefix "${CA_PREFIX}" --cert "$CACERT"
  fi

  cp ./runtime/profile.data ./public/profile.data
  $KEYCHAIN_CLI ndncert03-ca --profile ./runtime/profile.data --store ./runtime/repo \
    --challenge nop &
  CA_PID=$!
}

yanfd_start
sleep 2
ca_start
sleep 2
echo 'NDNts-chat server components are running, press ENTER to stop'
read
