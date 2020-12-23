#!/bin/sh

cd $(dirname $0)
source ../.nvm/nvm.sh
echo "using $(which node)"
node index.js