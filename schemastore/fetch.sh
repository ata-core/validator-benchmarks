#!/bin/sh
# The SchemaStore corpus at a pinned commit, shallow, into ./schemastore-corpus.
#   sh schemastore/fetch.sh
set -e
PIN=ce64da2a95a2bd40740c2d608206f8a36024d30b
DIR="$(dirname "$0")/../schemastore-corpus"
if [ -d "$DIR/.git" ]; then echo "corpus present: $(git -C "$DIR" rev-parse --short HEAD)"; exit 0; fi
mkdir -p "$DIR" && cd "$DIR"
git init -q && git remote add origin https://github.com/SchemaStore/schemastore
git fetch -q --depth 1 origin "$PIN" && git checkout -q FETCH_HEAD
echo "corpus at $(git rev-parse --short HEAD): $(ls src/schemas/json | wc -l | tr -d ' ') schemas, $(ls src/test | wc -l | tr -d ' ') sample directories"
