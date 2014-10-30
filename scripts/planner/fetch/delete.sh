#!/bin/bash

HOST='http://localhost:3001'
TID=${1}

REQUEST=$HOST/$TID

curl -H 'Content-type: application/json' \
     -X DELETE $REQUEST

