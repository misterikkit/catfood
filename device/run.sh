#!/bin/bash

source /home/pi/catfood.env
sleep 1m # maybe it needs to wait?
cd $(dirname $0)
sudo CLOUD_TARGET="$CLOUD_TARGET" node catfood | tee -a /home/pi/catfood.log
