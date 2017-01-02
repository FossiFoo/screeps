#!/usr/bin/env bash

./node_modules/babel-cli/bin/babel.js --watch --out-dir dist src &
sleep 3
./sync.js --local
