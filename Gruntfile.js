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
/* -------- planners watching ----------------------------------------------- */
            dumb:{
                files:['planners/dumb.js']
              , tasks:['develop:dumb']
            }
          , planner:{
                files:[
                    'planners/planner.js'
                  , 'planners/planner.io.js'
                  , 'planners/planner.ion.js'
                  , 'planners/abstracts/*.js'
                  , 'planners/functions/**/*.js'
                ]
              , tasks:['develop:planner']
            }
/* -------- notifier watching ----------------------------------------------- */
          , notifier:{
                files:[
                    'notifiers/notifier.io.js'
                ]
              , tasks:['develop:notifier']
            }
/* -------- master watching ------------------------------------------------- */
          , master:{
                files:[
                    'master/config/**/*.json'
                  , 'master/controllers/**/*.js'
                  , 'master/utils/**/*.js'
                  , 'master/app.js'
                ]
              , tasks:[
                    'develop:master'
                ]
              , options:{livereload:reloadPort}
            }
          , js:{
                files:['master/public/js/**/*.js']
              , options:{livereload:reloadPort}
            }
          , less:{
                files:['master/public/less/*.less']
              , options:{livereload:reloadPort}
            }
          , jade:{
                files:['master/views/**/*.jade']
              , options:{livereload:reloadPort}
            }
/* -------- testing watching ------------------------------------------------ */
          , test_dumb:{
                files:['test/planners/dumb/server.js']
              , tasks:['mochacli:dumb']
            }
          , test_functions:{
                files:['test/planners/functions/**/*.js']
              , tasks:['mochacli:functions']
            }
          , test_planner:{
                files:['test/planners/planner/**/*.js']
              , tasks:['mochacli:planner']
            }
          , test_notifier:{
                files:['test/notifiers/**/*.js']
              , tasks:['mochacli:notifier']
            }
          , test_master:{
                files:['test/master/**/*.js']
              , tasks:['mochacli:master']
            }
/* -------- documentation watching ------------------------------------------ */
          , tex:{
                files:['docs/perfil.tex']
              , tasks:['latex']
            }
        }

      , develop:{
            dumb:{
                file:'planners/dumb.js'
              , env:{
                    PORT:grunt.option('port')||3001
                }
            }
          , planner:{
                file:'planners/planner.io.js'
              , env:{
                    PORT:grunt.option('port')||3001
                }
            }
          , notifier:{
                file:'notifiers/notifier.io.js'
              , env:{
                    PORT:grunt.option('port')||3002
                }
            }
          , master:{
                file:'master/app.js'
            }
        }

      , mochacli:{
            options:{
                reporter:'spec'
              , bail:true
            }
          , functions:[
                'test/planners/functions/**/*.js'
              , 'test/planners/utils/**/*.js'
            ]
          , dumb:['test/planners/dumb/server.js']
          , planner:[
                'test/planners/planner/server.js'
              , 'test/planners/planner/scheduler.js'
            ]
          , notifier:[
                'test/notifiers/**/*.js'
            ]
          , master:['test/master/**/*.js']
        }

      , latex:{
            options:{haltOnError:true}
          , pdf_target:{
                options:{outputDirectory:'docs'}
              , src:['docs/perfil.tex']
            }
        }
    });

    grunt.registerTask('test:dumb',['mochacli:dumb']);
    grunt.registerTask('test:planner',[
        'mochacli:functions'
      , 'mochacli:planner'
    ]);
    grunt.registerTask('test:notifier',['mochacli:notifier']);
    grunt.registerTask('test:master',['mochacli:master']);

    grunt.config.requires('watch.master.files');
    filescontrol=grunt.config('watch.master.files');
    filescontrol=grunt.file.expand(filescontrol);

    grunt.registerTask('delayed-livereload',
        'Live reload after the node server has restarted.',function(){
        var done=this.async()
          , url='http://localhost:'+reloadPort+'/changed?files='
               +filescontrol.join(',')

        setTimeout(function(){
            request.get(url,function(err,res){
                var reloaded=!err&&res.statusCode===200

                if(reloaded){
                    grunt.log.ok('Delayed live reload successful.')
                }else{
                    grunt.log.error('Unable to make a delayed live reload.')
                }
                done(reloaded)
            })
        },500)
    });

    grunt.registerTask('serve:dumb',[
        'develop:dumb'
      , 'watch:dumb'
      , 'watch:test_dumb'
    ]);
    grunt.registerTask('serve:planner',[
        'develop:planner'
      , 'watch:planner'
      , 'watch:test_functions'
      , 'watch:test_planner'
    ]);
    grunt.registerTask('serve:notifier',[
        'develop:notifier'
      , 'watch:notifier'
    ]);
    grunt.registerTask('serve:master',[
        'develop:master'
      , 'watch'
    ]);
};

