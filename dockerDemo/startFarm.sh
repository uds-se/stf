#!/bin/sh

# Check for Docker
docker --version;
# Give the database time to start
rethinkdb & (sleep 10 && /stf/dockerDemo/start.sh)
