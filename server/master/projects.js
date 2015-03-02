'use strict';

var validate=require('../../planners/utils/validators')
  , _success=require('../../planners/utils/json-response').success
  , _error=require('../../planners/utils/json-response').error
  , schema=require('../utils/schema')
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].id==needle){
                return [i,haystack[i]];
            }
        }
        return;
    };

module.exports=function(app){
    app.get('/projects/view',function(request,response){
        response.render('pages/projects');
    });

    app.get('/projects',function(request,response){
        response.json(app.get('projects').map(
            function(project){
                return {
                    id:project.id
                  , _repositories:project._repositories
                };
            }));
    });

    app.put('/projects',function(request,response){
        if(schema.js.validate(request.body,schema.projects).length==0){
            app.set('projects',request.body.map(function(project){
                return {
                    id:validate.toString(project.id)
                  , _repositories:project._repositories.map(
                        function(repository){
                        return validate.toString(repository)
                    })
                };
            }));

            response.status(201).json(_success.ok);
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/projects',function(request,response){
        if(schema.js.validate(request.body,schema.project).length==0){
            var project=get_element(request.body.id,app.get('projects'))

            if(!project){
                var new_project={
                    id:validate.toString(request.body.id)
                  , _repositories:request.body._repositories.map(
                        function(repository){
                        return validate.toString(repository)
                    })
                };

                app.get('projects').push(new_project);
                response.status(201).json(new_project);
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/projects',function(request,response){
        app.set('projects',[]);
        response.status(200).json(_success.ok);
    });

    app.get('/projects/:project',function(request,response){
        var id=validate.toString(request.params.project)
          , projects=app.get('projects')
          , project=get_element(id,projects)

        if(project){
            response.status(200).json({
                id:project[1].id
              , _repositories:project[1]._repositories
            });
            return;
        }

        response.status(404).json(_error.notfound);
    });

    app.put('/projects/:project',function(request,response){
        var id=validate.toString(request.params.project)
          , projects=app.get('projects')
          , project=get_element(id,projects)

        if(schema.js.validate(request.body,schema.project).length==0){
            var new_project={
                id:id
              , _repositories:request.body._repositories.map(
                    function(repository){
                    return validate.toString(repository)
                })
            };

            if(project){
                projects[project[0]]=new_project;
                response.status(200).json(new_project);
            }else{
                projects.push(new_project);
                response.status(201).json(new_project);
            }

            app.set('projects',projects);
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/projects/:project',function(request,response){
        var id=validate.toString(request.params.project)
          , projects=app.get('projects')
          , project=get_element(id,projects)

        if(project){
            projects.splice(project[0],1);
            app.set('projects',projects);
            response.status(200).json(_success.ok);
        }else{
            response.status(404).json(_error.notfound);
        }
    });
};

