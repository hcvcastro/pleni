# pleni

node application for deploy a server for general activities.

## how install

$> git clone https://github.com/ccaballero/pleni.git
$> cd pleni
$> npm install
$> bower install
$> grunt serve:planner
$> grunt serve:master

## how test
If you want to run the unit test, you need install mocha.

$> grunt test:dumb
$> PORT=3001 node planners/planner.js
$> grunt test:planner
$> grunt test:master

