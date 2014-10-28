# pleni

Fullstack application for deploy a server for general activities.

## How install

$> git clone https://github.com/ccaballero/pleni.git
$> cd pleni
$> npm install
$> bower install
$> grunt serve:planner
$> grunt serve:master

## How test
If you want to run the unit test, you need install mocha.

$> grunt test:dumb
$> PORT=3001 node planners/planner.js
$> grunt test:planner
$> grunt test:master

The app consists of two separate servers:

- Planner server.
- Master server.

## How use the planner
For use the planner server, you should start the server:

PORT=3001 node planners/planeer.js

to make sure the server is started, you can make the rest request:

> curl -X GET http://localhost:3001

the answer will be:

< {"planner":"ready for action"}

additionally, the planner can handle other requests:

### Planner status
Tell us the state of the planner.

> curl -X GET http://localhost:3001/_status
< {"status":"stopped"}

### Planner api
Gives a definition of the tasks available in the planner.

> curl -X GET http://localhost:3001/_api
< [{"name":"exclusive","scheme":{}},{"name":"site_creator","scheme":{"host":{"type":"string"},"dbuser":{"type":"string"},"dbpass":{"type":"string"},"dbname":{"type":"string"},"site_url":{"type":"string"}}},{"name":"site_fetcher","scheme":{"host":{"type":"string"},"dbuser":{"type":"string"},"dbpass":{"type":"string"},"dbname":{"type":"string"}}}]

