#!/bin/bash

source /home/pi/catfood.env
# Device seems to need some uptime before gpio works.
while true; do
    upSeconds=$(cat /proc/uptime | cut -d'.' -f1)
    if [[ "$upSeconds" > 60 ]]; then
        break
    fi
    sleep 1
done
uptime -p | tee -a /home/pi/catfood.log
cd $(dirname $0)
sudo CLOUD_TARGET="$CLOUD_TARGET" node catfood | tee -a /home/pi/catfood.log
