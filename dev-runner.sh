#!/bin/bash
export PATH=$PATH:/home/nyakoe/.nvm/versions/node/v22.20.0/bin
export NODE_ENV=development
/home/nyakoe/Desktop/aroma/node_modules/.bin/electron /home/nyakoe/Desktop/aroma --no-sandbox "$@"
