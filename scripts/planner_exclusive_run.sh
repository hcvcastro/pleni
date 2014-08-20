#!/bin/bash

HOST='http://localhost:3001'
TID='ddef29f6e5decef899f16e5c99f0605d975a300c'

REQUEST=$HOST/$TID/_run
BODY=$(cat << EOF
{}
EOF
)

curl -H 'Content-type: application/json' \
     -X POST $REQUEST \
     -d $BODY

