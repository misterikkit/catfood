#!/bin/sh

set -x

TARGET="misterikkit@35.202.123.26"
VERSION="$(git describe --always --dirty)"

cd $(dirname $0)

rsync -az --progress --exclude node_modules backend/ "${TARGET}:catfood-${VERSION}"
# ssh $TARGET bash -c "rm catfood && ln -s catfood-${VERSION} catfood"

ssh $TARGET << EOF
set -x
rm -f catfood
ln -s catfood-${VERSION} catfood
source .nvm/nvm.sh
cd catfood
npm install
pm2 restart catfood-backend
EOF