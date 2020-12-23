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
cd catfood-${VERSION}
npm install
dos2unix run.sh
cd ..
pm2 stop catfood-device
ln -sfT catfood-${VERSION} catfood
pm2 start catfood-device
EOF