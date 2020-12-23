#!/bin/sh

set -x

. $HOME/catfood.env
TARGET="$DEVICE_TARGET"
VERSION="$(git describe --always --dirty)"

cd $(dirname $0)

rsync -az --progress --exclude node_modules device/ "${TARGET}:catfood-${VERSION}"

ssh $TARGET << EOF
set -x
rm -f catfood
ln -s catfood-${VERSION} catfood
source .nvm/nvm.sh
cd catfood
npm install
dos2unix run.sh
pm2 restart catfood-device
EOF