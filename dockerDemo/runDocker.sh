#!/bin/bash

DOCKER_IMAGE="stfdemo"
ADB_PATH_HOST="/opt/Android/Sdk/platform-tools/adb"
ADB_PATH_CONTAINER="/usr/local/bin/adb"

docker build -t ${DOCKER_IMAGE} .

# Interactive run
#docker run -it --entrypoint "/bin/bash" ${DOCKER_IMAGE}
docker run --net=host \
    --privileged \
    -v ${ADB_PATH_HOST}:${ADB_PATH_CONTAINER} \
    ${DOCKER_IMAGE}
