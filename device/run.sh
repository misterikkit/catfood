#!/bin/bash

source /home/pi/catfood.env
cd $(dirname $0)
source ../.nvm/nvm.sh
n=$(which node)
echo "using $n"
# TODO: Does this still need sudo for GPIO?
sudo CLOUD_TARGET="$CLOUD_TARGET" "$n" catfood
