#!/bin/bash

HOST='http://jacobian:asdf@localhost:5984'
DBNAME=${1}

curl -X PUT $HOST/$DBNAME/_design/analytics -d @mapreduce.json

