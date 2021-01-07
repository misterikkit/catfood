#!/bin/bash

source /home/pi/catfood.env
# Device seems to need some uptime before gpio works.
# TODO: restarting the pm2 process will hit this 1-minute sleep each time,
# which is painful during dev. Change this to a conditional sleep. (However, when
# it was a conditional sleep, GPIO didn't work after reboot.)
sleep 1m
uptime -p
cd $(dirname $0)
source ../.nvm/nvm.sh
n=$(which node)
echo "using $n"
sudo CLOUD_TARGET="$CLOUD_TARGET" "$n" catfood
