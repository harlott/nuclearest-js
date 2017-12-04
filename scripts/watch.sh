#!/usr/bin/env sh
./node_modules/.bin/eslint src && rm -fr lib/* && ./node_modules/.bin/babel --watch --presets es2015,stage-0 -d lib/ src/ 
