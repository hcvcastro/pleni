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
                  , 'server/planners/*.js'
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
/* -------- master watching ------------------------------------------------- */
          , master:{
                files:[
                    'server/master.js'
                  , 'master/config/**/*.json'
                  , 'master/controllers/**/*.js'
                  , 'master/utils/**/*.js'
                ]
              , tasks:['develop:master']
            }
/* -------- sites watching -------------------------------------------------- */
          , sites:{
                files:[
                    'server/sites.js'
                  , 'server/sites/*.js'
                ]
              , tasks:['develop:sites']
            }
/* -------- frontend watching ----------------------------------------------- */
          , js:{
                files:['client/js/**/*.js']
              , options:{livereload:reloadPort}
            }
          , less:{
                files:['client/less/**/*.less']
              , options:{livereload:reloadPort}
            }
          , svg:{
                files:['client/svg/**/*.svg']
              , options:{livereload:reloadPort}
            }
          , views:{
                files:['client/views/**/*.jade']
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
            sites:'dist/sites'
        }
      , concurrent:{
            sites:[
                'jade:sites'
              , 'less:sites'
              , 'uglify:sites'
              , 'copy:sites'
              , 'svgmin:sites'
            ]
        }
      , jade:{
            sites:{
                options:{
                    pretty:false
                }
              , files:{
                    'dist/sites/index.html'
                  : 'client/views/sites/prod.jade'
                  , 'dist/sites/map.html'
                  : 'client/views/sites/pages/map.jade'
                  , 'dist/sites/sites.html'
                  : 'client/views/sites/pages/sites.jade'
                  , 'dist/sites/about.html'
                  : 'client/views/sites/pages/about.jade'
                  , 'dist/sites/report.html'
                  : 'client/views/sites/pages/report.jade'
                }
            }
        }
      , less:{
            sites:{
                options:{
                    cleancss:true
                  , paths:['bower_components']
                }
              , files:{
                    'dist/sites/style.css'
                  : 'client/less/sites.less'
                }
            }
        }
      , uglify:{
            sites:{
                files:[{
                    'dist/sites/js/jquery.min.js':[
                        'bower_components/jquery/dist/jquery.min.js'
                      , 'bower_components/pushy-dyn/js/pushy.js'
                    ]
                },{
                    'dist/sites/js/socket.io.min.js':[
                        'bower_components/socket.io-client/socket.io.js'
                    ]
                },{
                    'dist/sites/js/angular.min.js':[
                        'bower_components/angular/angular.min.js'
                    ]
                },{
                    'dist/sites/js/angular-route.min.js':[
                        'bower_components/angular-route/angular-route.min.js'
                    ]
                },{
                    'dist/sites/js/d3.min.js':[
                        'bower_components/d3/d3.min.js'
                      , 'bower_components/d3-tip/index.js'
                    ]
                },{
                    'dist/sites/js/sites.min.js':[
                        'client/js/sites.js'
                      , 'client/js/controllers/sites/sites.js'
                      , 'client/js/controllers/sites/map.js'
                      , 'client/js/controllers/sites/menu.js'
                      , 'client/js/controllers/sites/report.js'
                      , 'client/js/visual/site.js'
                      , 'client/js/factories/visual.js'
                    ]
                }]
            }
        }
      , copy:{
            sites:{
                files:[{
                    src:'client/favicon.ico'
                  , dest:'dist/sites/favicon.ico'
                },{
                    expand:true
                  , flatten:true
                  , cwd:'bower_components/font-awesome/'
                  , src:'fonts/fontawesome-webfont.*'
                  , dest:'dist/sites/fonts/'
                }]
            }
        }
      , svgmin:{
            sites:{
                files:[{
                    src:'client/svg/canvas.svg'
                  , dest:'dist/sites/svg/canvas.svg'
                },{
                    src:'client/svg/hiperborea.svg'
                  , dest:'dist/sites/svg/hiperborea.svg'
                },{
                    src:'client/svg/pleni.sites.svg'
                  , dest:'dist/sites/svg/pleni.sites.svg'
                }]
            }
        }
      , cssmin:{
            sites:{
                files:{
                    'dist/sites/style.css':[
                        'dist/sites/style.css'
                    ]
                }
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
        'develop:sites'
      , 'watch'
    ]);

    grunt.registerTask('build:sites',[
        'clean:sites'
      , 'concurrent:sites'
      , 'cssmin:sites'
    ]);
};

