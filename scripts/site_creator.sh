#!/bin/bash

# PUT for site_creator
curl -H 'Content-type: application/json' \
     -X PUT http://localhost:3001/site_creator \
     -d '{"host":"http://localhost:5984","dbuser":"jacobian","dbpass":"asdf","dbname":"pleni_site_galao","site_type":"site","site_url":"http://galao.local"}'


