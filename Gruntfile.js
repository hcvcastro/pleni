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
                files:['server/planners/dumb.js']
              , tasks:['develop:dumb']
            }
          , planner:{
                files:[
                    'server/planner.js'
                  , 'server/planner.io.js'
                  , 'server/planner.ion.js'
                  , 'server/planners/**/*.js'
                ]
              , tasks:['develop:planner']
            }
/* -------- notifier watching ----------------------------------------------- */
          , notifier:{
                files:['server/notifier.io.js']
              , tasks:['develop:notifier']
            }
/* -------- monitor watching ------------------------------------------------ */
          , monitor:{
                files:['server/monitor.js']
              , tasks:['develop:monitor']
            }
/* -------- frontend watching ----------------------------------------------- */
          , js:{
                files:['master/public/js/**/*.js']
              , options:{livereload:reloadPort}
            }
          , less:{
                files:['master/public/less/**/*.less']
              , options:{livereload:reloadPort}
            }
          , jade:{
                files:['master/views/**/*.jade']
              , options:{livereload:reloadPort}
            }
/* -------- master watching ------------------------------------------------- */
          , master:{
                files:[
                    'master/config/**/*.json'
                  , 'master/controllers/**/*.js'
                  , 'master/utils/**/*.js'
                  , 'master/app.js'
                  , 'planners/functions/**/*.js'
                ]
              , tasks:[
                    'develop:master'
                ]
              , options:{livereload:reloadPort}
            }
/* -------- quickstarts watching -------------------------------------------- */
          , qs_sites:{
                files:[
                    'quickstarts/sites/app.js'
                  , 'quickstarts/sites/public/js/**/*.js'
                  , 'quickstarts/sites/views/**/*.jade'
                ]
              , tasks:[
                    'develop:qs_sites'
                ]
              , options:{livereload:reloadPort}
            }
/* -------- documentation watching ------------------------------------------ */
          , tex:{
                files:['docs/perfil.tex']
              , tasks:['latex']
            }
        }

      , develop:{
            dumb:{
                file:'server/planners/dumb.js'
              , env:{
                    PORT:grunt.option('port')||3001
                  , ENV:'development'
                }
            }
          , planner:{
                file:'server/planner.js'
              , env:{
                    PORT:grunt.option('port')||3001
                  , ENV:'development'
                }
            }
          , planner_io:{
                file:'server/planner.io.js'
              , env:{
                    PORT:grunt.option('port')||3001
                  , ENV:'development'
                }
            }
          , planner_ion:{
                file:'server/planner.ion.js'
              , env:{
                    PORT:grunt.option('port')||3001
                  , ENV:'development'
                }
            }
          , notifier:{
                file:'server/notifier.io.js'
              , env:{
                    PORT:grunt.option('port')||3002
                  , ENV:'development'
                }
            }
          , monitor:{
                file:'server/monitor.js'
              , env:{
                    PORT:grunt.option('port')||3003
                  , ENV:'development'
                }
            }
          , master:{
                file:'server/master.js'
              , env:{
                    PORT:grunt.option('port')||3000
                  , ENV:'development'
                }
            }
          , sites:{
                file:'server/sites.js'
              , env:{
                    PORT:grunt.option('port')||3004
                  , ENV:'development'
                }
            }
        }

      , mochacli:{
            options:{
                reporter:'spec'
              , bail:true
              , timeout:5000
              , env:{
                    ENV:'test'
                }
            }
          , functions:[
                'tests/planners/functions/**/*.js'
              , 'tests/planners/utils/**/*.js'
            ]
          , dumb:['tests/planners/dumb/server.js']
          , planners:[
                'tests/planners/planner/server.js'
              , 'tests/planners/planner/scheduler.js'
            ]
          , notifier:['tests/notifiers/**/*.js']
          , master:['tests/master/**/*.js']
          , sites:['tests/quickstarts/sites/*.js']
          , monitor:['tests/monitor/server.js']
        }

      , clean:{
            qs_sites:'quickstarts/sites/dist'
        }
      , concurrent:{
            qs_sites:[
                'jade:qs_sites'
              , 'less:qs_sites'
              , 'uglify:qs_sites'
              , 'copy:qs_sites'
              , 'svgmin:qs_sites'
            ]
        }
      , jade:{
            qs_sites:{
                options:{
                    pretty:false
                }
              , files:{
                    'quickstarts/sites/dist/index.html'
                  : 'quickstarts/sites/views/prod.jade'
                  , 'quickstarts/sites/dist/map.html'
                  : 'quickstarts/sites/views/pages/map.jade'
                  , 'quickstarts/sites/dist/sites.html'
                  : 'quickstarts/sites/views/pages/sites.jade'
                  , 'quickstarts/sites/dist/about.html'
                  : 'quickstarts/sites/views/pages/about.jade'
                }
            }
        }
      , less:{
            qs_sites:{
                options:{
                    cleancss:true
                  , paths:['bower_components']
                }
              , files:{
                    'quickstarts/sites/dist/style.css'
                  : 'master/public/less/sites.less'
                }
            }
        }
      , uglify:{
            qs_sites:{
                files:[{
                    'quickstarts/sites/dist/js/qs.min.js':[
                        'quickstarts/sites/public/js/app.js'
                      , 'quickstarts/sites/public/js/controllers/sites.js'
                      , 'quickstarts/sites/public/js/controllers/map.js'
                      , 'quickstarts/sites/public/js/controllers/menu.js'
                      , 'master/public/js/visual/site.js'
                      , 'master/public/js/factories/visual.js'
                    ]
                },{
                    'quickstarts/sites/dist/js/jquery.min.js':[
                        'bower_components/jquery/dist/jquery.min.js'
                      , 'bower_components/pushy-dyn/js/pushy.js'
                    ]
                },{
                    'quickstarts/sites/dist/js/socket.io.min.js':[
                        'bower_components/socket.io-client/socket.io.js'
                    ]
                },{
                    'quickstarts/sites/dist/js/angular.min.js':[
                        'bower_components/angular/angular.min.js'
                    ]
                },{
                    'quickstarts/sites/dist/js/angular-route.min.js':[
                        'bower_components/angular-route/angular-route.min.js'
                    ]
                },{
                    'quickstarts/sites/dist/js/d3.min.js':[
                        'bower_components/d3/d3.min.js'
                      , 'bower_components/d3-tip/index.js'
                    ]
                }]
            }
        }
      , copy:{
            qs_sites:{
                files:[{
                    src:'master/public/img/favicon.ico'
                  , dest:'quickstarts/sites/dist/favicon.ico'
                },{
                    expand:true
                  , flatten:true
                  , cwd:'bower_components/font-awesome/'
                  , src:'fonts/fontawesome-webfont.*'
                  , dest:'quickstarts/sites/dist/fonts/'
                }]
            }
        }
      , cssmin:{
            qs_sites:{
                files:{
                    'quickstarts/sites/dist/style.css':[
                        'quickstarts/sites/dist/style.css'
                    ]
                }
            }
        }
      , svgmin:{
            qs_sites:{
                files:[{
                    src:'master/public/img/canvas.svg'
                  , dest:'quickstarts/sites/dist/img/canvas.svg'
                },{
                    src:'master/public/img/hiperborea.svg'
                  , dest:'quickstarts/sites/dist/img/hiperborea.svg'
                },{
                    src:'master/public/img/pleni.sites.svg'
                  , dest:'quickstarts/sites/dist/img/pleni.sites.svg'
                }]
            }
        }

      , jshint:{
            qs_sites:[
                'quickstarts/sites/common/planners.js'
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

    grunt.registerTask('test:master',['mochacli:master']);
    grunt.registerTask('test:planner',[
        'mochacli:dumb'
      , 'mochacli:planners'
      , 'mochacli:functions'
    ]);
    grunt.registerTask('test:notifier',['mochacli:notifier']);
    grunt.registerTask('test:monitor',['mochacli:monitor']);
    grunt.registerTask('test:sites',['mochacli:sites']);
    grunt.registerTask('test',[
        'test:planner'
      , 'test:notifier'
      , 'test:monitor'
      , 'test:sites'
      , 'test:master'
    ]);

    grunt.config.requires('watch.master.files');
    grunt.config.requires('watch.qs_sites.files');
    filescontrol=grunt.config('watch.master.files').concat(
        grunt.config('watch.qs_sites.files'));
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
    ]);
    grunt.registerTask('serve:planner',[
        'develop:planner'
      , 'watch:planner'
    ]);
    grunt.registerTask('serve:planner:io',[
        'develop:planner_io'
      , 'watch:planner'
    ]);
    grunt.registerTask('serve:planner:ion',[
        'develop:planner_ion'
      , 'watch:planner'
    ]);
    grunt.registerTask('serve:notifier',[
        'develop:notifier'
      , 'watch:notifier'
    ]);
    grunt.registerTask('serve:monitor',[
        'develop:monitor'
      , 'watch:monitor'
    ]);
    grunt.registerTask('serve:master',[
        'develop:master'
      , 'watch'
    ]);
    grunt.registerTask('serve:sites',[
        'develop:qs_sites'
      , 'watch'
    ]);

    grunt.registerTask('build:qs:sites',[
        'clean:qs_sites'
      , 'concurrent:qs_sites'
      , 'cssmin:qs_sites'
    ]);
};

