#!/bin/sh

set -x

. $HOME/catfood.env
TARGET="$DEVICE_TARGET"
VERSION="$(git describe --always --dirty)"

cd $(dirname $0)

rsync -az --progress --exclude node_modules device/ "${TARGET}:catfood-${VERSION}"

ssh $TARGET << EOF
set -x
source .nvm/nvm.sh
pm2 stop catfood-device
rm -f catfood
ln -s catfood-${VERSION} catfood
cd catfood
npm install
dos2unix run.sh
pm2 start catfood-device
EOF