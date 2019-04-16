#!/bin/sh
# Give the database time to start
rethinkdb & (sleep 10 && /stf/start.sh)
