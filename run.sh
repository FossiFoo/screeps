#!/usr/bin/env bash

./node_modules/gulp-cli/bin/gulp.js run &
sleep 3
./sync.js --local
