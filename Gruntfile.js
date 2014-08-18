'use strict';

var request=require('request');

module.exports=function(grunt){
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var reloadPort=35729
      , filescontrol

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')

      , watch:{
            options:{
                nospawn:true
            }
/* -------- planners watching ----------------------------------------------- */
          , dumb:{
                files:[
                    'planners/dumb.js'
                  , 'planners/abstracts/scheduler.js'
                  , 'planners/abstracts/server.js'
                ]
              , tasks:['develop:dumb']
            }
          , planner:{
                files:[
                    'planners/planner.js'
                  , 'planners/abstracts/scheduler.js'
                  , 'planners/abstracts/server.js'
                  , 'planners/functions/planner.js'
                ]
              , tasks:['develop:planner']
            }
/* -------- master watching ------------------------------------------------- */
          , master:{
                files:[
                    'master/app.js'
                  , 'master/controllers/*.js'
                ]
              , tasks:['develop:master','delayed-livereload']
              , options:{livereload:reloadPort}
            }
          , js:{
                files:['public/js/*.js']
              , options:{livereload:reloadPort}
            }
          , styl:{
                files:['master/stylus/*.styl']
              , options:{livereload:reloadPort}
            }
          , jade:{
                files:['master/views/{,*/}*.jade']
              , options:{livereload:reloadPort}
            }
/* -------- testing watching ------------------------------------------------ */
          , test_functions:{
                files:['test/planners/functions/*.js']
              , tasks:['mochacli:functions']
            }
          , test_master:{
                files:['test/master/planners.js']
              , tasks:['mochacli:master']
            }
/* -------- documentation watching ------------------------------------------ */
          , tex:{
                files:['docs/*.tex']
              , tasks:['latex']
            }
        }

      , develop:{
            dumb:    { file:'planners/dumb.js'    }
          , planner: {
                file:'planners/planner.js'
              , env:{
                    PORT:grunt.option('port')
                }
            }
          , master:  { file:'master/app.js'       }
        }

      , mochacli:{
            options:{
                reporter:'spec'
              , bail:true
            }
          , functions:[
                'test/planners/functions/{,*/}*.js'
            ]
          , dumb: [
                'test/planners/dumb.js'
            ]
          , planner: [
                'test/planners/planner_server.js'
              , 'test/planners/planner_scheduler.js'
            ]
          , master: [
                'test/master/utils/{,*/}*.js'
//              , 'test/master/home.js'
//              , 'test/master/repositories.js'
              , 'test/master/planners.js'
            ]
        }

      , latex:{
            options:{haltOnError:true}
          , pdf_target:{
                options:{outputDirectory:'docs'}
              , src:['docs/perfil.tex']
            }
        }
    });

    ['dumb','planner']
    .forEach(function(element){
        grunt.registerTask(
            'test:'+element,
            ['mochacli:'+element]
        );
        grunt.registerTask(
            'serve:'+element,[
            'develop:'+element
          , 'watch:'+element
          , 'watch:test_planners'
        ]);
    });

    grunt.config.requires('watch.master.files');
    filescontrol=grunt.config('watch.master.files');
    filescontrol=grunt.file.expand(filescontrol);

    grunt.registerTask('delayed-livereload',
        'Live reload after the node server has restarted.',function(){
        var done=this.async();
        setTimeout(function(){
            request.get('http://localhost:'+reloadPort+'/changed?files='
            +filescontrol.join(','),function(err,res){
                var reloaded=!err&&res.statusCode===200;
                if(reloaded){
                    grunt.log.ok('Delayed live reload successful.');
                }else{
                    grunt.log.error('Unable to make a delayed live reload.');
                }
                done(reloaded);
            });
        },500);
    });

    grunt.registerTask('serve:master',[
        'develop:master'
      , 'watch:master'
      , 'watch:js'
      , 'watch:styl'
      , 'watch:jade'
    ]);
    grunt.registerTask('test:master',['mochacli:master']);
};

