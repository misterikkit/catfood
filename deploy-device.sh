#!/bin/sh

set -x

TARGET="pi@10.0.0.3"
VERSION="$(git describe --always --dirty)"

cd $(dirname $0)

rsync -az --progress --exclude node_modules device/ "${TARGET}:catfood-${VERSION}"
# ssh $TARGET bash -c "rm catfood && ln -s catfood-${VERSION} catfood"

ssh $TARGET << EOF
set -x
rm -f catfood
ln -s catfood-${VERSION} catfood
cd catfood
npm install
dos2unix run.sh
EOF