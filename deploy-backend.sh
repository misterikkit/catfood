#!/bin/sh

set -x

. $HOME/catfood.env
TARGET="$BACKEND_TARGET"
VERSION="$(git describe --tags --always --dirty)"

cd $(dirname $0)

rsync -az --progress --exclude node_modules backend/ "${TARGET}:catfood-${VERSION}"

ssh $TARGET << EOF
set -x
source .nvm/nvm.sh
cd catfood-${VERSION}
npm install
cd ..
pm2 stop catfood-backend
ln -sfT catfood-${VERSION} catfood
pm2 start catfood-backend
EOF