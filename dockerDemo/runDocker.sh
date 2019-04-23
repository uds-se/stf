#!/bin/bash

DOCKER_IMAGE="stfdemo:lst"
ADB_PATH_HOST="/opt/Android/Sdk/platform-tools/adb"
ADB_PATH_CONTAINER="/usr/local/bin/adb"

docker build -t ${DOCKER_IMAGE} .

# Interactive run
# Mount the host docker socket
# https://jpetazzo.github.io/2015/09/03/do-not-use-docker-in-docker-for-ci/
#docker run -it --entrypoint "/bin/bash" ${DOCKER_IMAGE}
docker run --net=host \
    --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v ${ADB_PATH_HOST}:${ADB_PATH_CONTAINER} \
    ${DOCKER_IMAGE}
