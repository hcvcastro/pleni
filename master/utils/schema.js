'use strict';

var validator=require('validator')
  , jayschema=require('jayschema')
  , js=new jayschema()
  , notEmpty=function(element){
    if(typeof element==='undefined'){
        return false;
    }
    if(element===null){
        return false;
    }
    if(element===''){
        return false;
    }
    return true;
};

js.addFormat('id',function(value){
    if(notEmpty(value)
        && /^[a-z][a-z0-9_]*\/?[a-z][a-z0-9_]*$/i.test(value)){
        return null;
    }
    return 'id is not a valid string';
});
js.addFormat('host',function(value){
    if(notEmpty(value)
        && (validator.isIP(value)||validator.isURL(value))){
        return null;
    }
    return 'host is not a valid';
});
js.addFormat('port',function(value){
    var _port=validator.toInt(value);
    if(notEmpty(value)
        && validator.isInt(value)
        && (0 < _port && _port < 65536)){
        return null;
    }
    return 'port is not a valid';
});
js.addFormat('slug',function(value){
    if(notEmpty(value)
        && /^[a-z][a-z0-9_]*$/i.test(value)){
        return null;
    }
    return 'there is not a valid slug';
});
js.addFormat('emptyslug',function(value){
    if(value==''
        || /^[a-z][a-z0-9_]*$/i.test(value)){
        return null;
    }
    return 'there is not a valid slug';
});
exports.js=js;

var dbserver={
    'type':'object'
  , 'properties':{
        'id':{
            'type':'string'
          , 'format':'id'
        }
      , 'db':{
            'type':'object'
          , 'properties':{
                'host':{
                    'type':'string'
                  , 'format':'host'
                }
              , 'port':{
                    'type':'integer'
                  , 'format':'port'
                }
              , 'user':{
                    'type':'string'
                  , 'format':'slug'
                }
              , 'pass':{
                    'type':'string'
                }
              , 'prefix':{
                    'type':'string'
                  , 'format':'emptyslug'
                }
            }
          , 'required':['host','port','user','pass','prefix']
        }
    }
  , 'required':['id','db']
};
exports.dbserver=dbserver;

var dbservers={
    'type':'array'
  , 'items':dbserver
  , 'minItems':1
  , 'uniqueItems':true
};
exports.dbservers=dbservers;

var repository={
    'type':'object'
  , 'properties':{
        'id':{
            'type':'string'
          , 'format':'id'
        }
      , '_dbserver':{
            'type':'string'
          , 'format':'id'
        }
      , 'db':{
            'type':'object'
          , 'properties':{
                'name':{
                    'type':'string'
                  , 'format':'slug'
                }
            }
          , 'required':['name']
        }
    }
  , 'required':['id','_dbserver','db']
};
exports.repository=repository;

var repositories={
    'type':'array'
  , 'items':repository
  , 'minItems':1
  , 'uniqueItems':true
};
exports.repositories=repositories;

var planner={
    'type':'object'
  , 'properties':{
        'id':{
            'type':'string'
          , 'format':'id'
        }
      , 'planner':{
            'type':'object'
          , 'properties':{
                'host':{
                    'type':'string'
                  , 'format':'host'
                }
              , 'port':{
                    'type':'integer'
                  , 'format':'port'
                }
            }
          , 'required':['host','port']
        }
    }
  , 'required':['id','planner']
};
exports.planner=planner;

var planners={
    'type':'array'
  , 'items':planner
  , 'minItems':1
  , 'uniqueItems':true
};
exports.planners=planners;

var task={
    'type':'object'
  , 'properties':{
        'task':{
            'type':'object'
          , 'properties':{
                'name':{
                    'type':'string'
                  , 'format':'id'
                }
              , 'count':{
                    'type':'integer'
                }
              , 'interval':{
                    'type':'integer'
                }
            }
          , 'required':['name','count','interval']
        }
    }
  , 'required':['task']
};
exports.task=task;

var planner_set={
    'type':'object'
  , 'properties':{
        'server':{
            'type':'string'
          , 'format':'id'
        }
      , 'tid':{
            'type':'integer'
        }
    }
  , 'required':['server','tid']
};
exports.planner_set=planner_set;

var planner_runner={
    'type':'object'
  , 'properties':{
        'targs':{
            'type':'object'
        }
    }
  , 'required':['targs']
};
exports.planner_runner=planner_runner;

var notifier={
    'type':'object'
  , 'properties':{
        'id':{
            'type':'string'
          , 'format':'id'
        }
      , 'notifier':{
            'type':'object'
          , 'properties':{
                'host':{
                    'type':'string'
                  , 'format':'host'
                }
              , 'port':{
                    'type':'integer'
                  , 'format':'port'
                }
            }
          , 'required':['host','port']
        }
    }
  , 'required':['id','notifier']
};
exports.notifier=notifier;

var notifiers={
    'type':'array'
  , 'items':notifier
  , 'minItems':1
  , 'uniqueItems':true
};
exports.notifiers=notifiers;

var notifier_planner2={
    'type':'object'
  , 'properties':{
        'planner':{
            'type':'string'
          , 'format':'id'
        }
    }
  , 'required':['planner']
};
exports.notifier_planner2=notifier_planner2;

var notifier_planner={
    'type':'object'
  , 'properties':{
        'planner':{
            'type':'object'
          , 'properties':{
                'host':{
                    'type':'string'
                  , 'format':'host'
                }
              , 'port':{
                    'type':'integer'
                  , 'format':'port'
                }
            }
          , 'required':['host','port']
        }
    }
  , 'required':['planner']
};
exports.notifier_planner=notifier_planner;

var notifier_planners={
    'type':'array'
  , 'items':notifier_planner
  , 'minItems':0
  , 'uniqueItems':true
};
exports.notifier_planners=notifier_planners;

var project={
    'type':'object'
  , 'properties':{
        'id':{
            'type':'string'
          , 'format':'id'
        }
      , '_repositories':{
            'type':'array'
          , 'items':{
                'type':'string'
            }
          , 'minItems':0
          , 'uniqueItems':true
        }
    }
  , 'required':['id','_repositories']
};
exports.project=project;

var projects={
    'type':'array'
  , 'items':project
  , 'minItems':1
  , 'uniqueItems':true
};
exports.projects=projects;

