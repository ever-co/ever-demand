#!/bin/sh
set -ex

# This Entrypoint used when we run Docker container outside of Docker Compose (e.g. in k8s)

# Temporary run Mongo inside same container
mongod --bind_ip 0.0.0.0 --fork --syslog

exec "$@"