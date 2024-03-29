'use strict';

var validate=require('../../core/validators')
  , join=require('path').join
  , _success=require('../../core/json-response').success
  , _error=require('../../core/json-response').error
  , schema=require('../../core/schema')
  , get_element=function(needle,haystack){
        for(var i in haystack){
            if(haystack[i].id==needle){
                return [i,haystack[i]];
            }
        }
        return;
    };

module.exports=function(app,config){
    var authed=app.get('auth');

    app.get('/projects/view',authed,function(request,response){
        if(config.env=='production'){
            response.status(200)
                .sendFile(join(__dirname,'..','..','client',
                    'projects.html'));
        }else{
            response.render('pages/projects');
        }
    });

    app.get('/projects',authed,function(request,response){
        response.json(request.user.projects.map(
            function(project){
                return {
                    id:project.id
                  , _repositories:project._repositories
                };
            }));
    });

    app.put('/projects',authed,function(request,response){
        if(schema.js.validate(request.body,schema.projects).length==0){
            request.user.projects=request.body.map(function(project){
                return {
                    id:validate.toString(project.id)
                  , _repositories:project._repositories.map(
                        function(repository){
                        return validate.toString(repository)
                    })
                };
            });

            request.user.save();
            response.status(201).json(_success.ok);
        }else{
            response.status(400).json(_error.json);
        }
    });

    app.post('/projects',authed,function(request,response){
        if(schema.js.validate(request.body,schema.project).length==0){
            var project=get_element(request.body.id,request.user.projects)

            if(!project){
                var new_project={
                    id:validate.toString(request.body.id)
                  , _repositories:request.body._repositories.map(
                        function(repository){
                        return validate.toString(repository)
                    })
                };

                request.user.projects.push(new_project);
                request.user.save();

                response.status(201).json(new_project);
            }else{
                response.status(403).json(_error.notoverride);
            }
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/projects',authed,function(request,response){
        request.user.projects=[];
        request.user.save();
        response.status(200).json(_success.ok);
    });

    app.get('/projects/:project',authed,function(request,response){
        var id=validate.toString(request.params.project)
          , project=get_element(id,request.user.projects)

        if(project){
            response.status(200).json({
                id:project[1].id
              , _repositories:project[1]._repositories
            });
        }else{
            response.status(404).json(_error.notfound);
        }
    });

    app.put('/projects/:project',authed,function(request,response){
        var id=validate.toString(request.params.project)
          , projects=request.user.projects
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

            request.user.projects=projects;
            request.user.save();
        }else{
            response.status(403).json(_error.validation);
        }
    });

    app.delete('/projects/:project',authed,function(request,response){
        var id=validate.toString(request.params.project)
          , projects=request.user.projects
          , project=get_element(id,projects)

        if(project){
            projects.splice(project[0],1);
            request.user.save();

            response.status(200).json(_success.ok);
        }else{
            response.status(404).json(_error.notfound);
        }
    });
};

