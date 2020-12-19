#!/bin/bash
source /home/pi/glitch.env

sleep 1m # maybe it needs to wait?
cd $(dirname $0)
sudo SECRET=$SECRET node catfood | tee -a /home/pi/catfood.log
