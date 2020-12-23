#!/bin/sh

set -x

. $HOME/catfood.env
TARGET="$BACKEND_TARGET"
VERSION="$(git describe --always --dirty)"

cd $(dirname $0)

rsync -az --progress --exclude node_modules backend/ "${TARGET}:catfood-${VERSION}"

ssh $TARGET << EOF
set -x
source .nvm/nvm.sh
pm2 stop catfood-backend
rm -f catfood
ln -s catfood-${VERSION} catfood
cd catfood
npm install
pm2 start catfood-backend
EOF