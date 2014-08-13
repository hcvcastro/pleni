#!/bin/bash

# PUT for site_fetcher
curl -H 'Content-type: application/json' \
     -X PUT http://localhost:3001/site_fetcher \
     -d '{"host":"http://localhost:5984","dbuser":"jacobian","dbpass":"asdf","dbname":"pleni_site_galao"}'

