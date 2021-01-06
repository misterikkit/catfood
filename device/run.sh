#!/bin/bash

source /home/pi/catfood.env
# Device seems to need some uptime before gpio works.
while true; do
    upSeconds=$(cat /proc/uptime | cut -d'.' -f1)
    if [[ "$upSeconds" -gt 120 ]]; then
        break
    fi
    sleep 1
done
uptime -p
cd $(dirname $0)
source ../.nvm/nvm.sh
n=$(which node)
echo "using $n"
sudo CLOUD_TARGET="$CLOUD_TARGET" "$n" catfood
