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
          , core:[
                'tests/core/validators.js'
              , 'tests/core/functions/**/*.js'
              , 'tests/core/tasks/**/*.js'
            ]
          , dumb:['tests/planners/dumb/server.js']
          , planners:['tests/planners/planner/*.js']
          , notifier:['tests/notifiers/**/*.js']
          , master:['tests/master/**/*.js']
          , sites:['tests/sites/*.js']
          , monitor:['tests/monitor/server.js']
        }

      , clean:{
            master:'dist/master'
          , planner:'dist/planner'
          , notifier:'dist/notifier'
          , monitor:'dist/monitor'
          , sites:'dist/sites'
        }
      , concurrent:{
            master:[
                'jade:master'
              , 'less:master'
              , 'uglify:master'
              , 'copy:master'
              , 'svgmin:master'
            ]
          , planner:[
                'jade:planner'
              , 'less:planner'
              , 'uglify:planner'
              , 'copy:planner'
            ]
          , notifier:[
                'jade:notifier'
              , 'less:notifier'
              , 'uglify:notifier'
              , 'copy:notifier'
            ]
          , monitor:[
                'copy:monitor'
            ]
          , sites:[
                'jade:sites'
              , 'less:sites'
              , 'uglify:sites'
              , 'copy:sites'
              , 'svgmin:sites'
            ]
        }
      , jade:{
            planner:{
                options:{
                    pretty:false
                }
              , files:{
                    'dist/planner/client/index.html'
                  : 'client/views/planner/prod.jade'
                }
            }
          , notifier:{
                options:{
                    pretty:false
                }
              , files:{
                    'dist/notifier/client/index.html'
                  : 'client/views/notifier/prod.jade'
                }
            }
          , sites:{
                options:{
                    pretty:false
                }
              , files:{
                    'dist/sites/client/index.html'
                  : 'client/views/sites/prod.jade'
                  , 'dist/sites/client/search.html'
                  : 'client/views/sites/pages/search.jade'
                  , 'dist/sites/client/sitemap.html'
                  : 'client/views/sites/pages/sitemap.jade'
                  , 'dist/sites/client/about.html'
                  : 'client/views/sites/pages/about.jade'
                  , 'dist/sites/client/report.html'
                  : 'client/views/sites/pages/report.jade'
                }
            }
        }
      , less:{
            planner:{
                options:{
                    cleancss:true
                  , paths:['bower_components']
                }
              , files:{
                    'dist/planner/client/style.css'
                  : 'client/less/planner.less'
                }
            }
          , notifier:{
                options:{
                    cleancss:true
                  , paths:['bower_components']
                }
              , files:{
                    'dist/notifier/client/style.css'
                  : 'client/less/planner.less'
                }
            }
          , sites:{
                options:{
                    cleancss:true
                  , paths:['bower_components']
                }
              , files:{
                    'dist/sites/client/style.css'
                  : 'client/less/sites.less'
                }
            }
        }
      , uglify:{
            planner:{
                files:[{
                    'dist/planner/client/js/jquery.min.js':[
                        'bower_components/jquery/dist/jquery.min.js'
                    ]
                },{
                    'dist/planner/client/js/socket.io.min.js':[
                        'bower_components/socket.io-client/socket.io.js'
                    ]
                },{
                    'dist/planner/client/js/planner.min.js':[
                        'client/js/planner.js'
                    ]
                }]
            }
          , notifier:{
                files:[{
                    'dist/notifier/client/js/jquery.min.js':[
                        'bower_components/jquery/dist/jquery.min.js'
                    ]
                },{
                    'dist/notifier/client/js/socket.io.min.js':[
                        'bower_components/socket.io-client/socket.io.js'
                    ]
                },{
                    'dist/notifier/client/js/notifier.min.js':[
                        'client/js/planner.js'
                    ]
                }]
            }
          , sites:{
                files:[{
                    'dist/sites/client/js/jquery.min.js':[
                        'bower_components/jquery/dist/jquery.min.js'
                      , 'bower_components/pushy-dyn/js/pushy.js'
                    ]
                },{
                    'dist/sites/client/js/socket.io.min.js':[
                        'bower_components/socket.io-client/socket.io.js'
                    ]
                },{
                    'dist/sites/client/js/angular.min.js':[
                        'bower_components/angular/angular.min.js'
                    ]
                },{
                    'dist/sites/client/js/angular.ui.router.min.js':[
                        'bower_components/angular-ui-router/release/'
                            +'angular-ui-router.min.js'
                    ]
                },{
                    'dist/sites/client/js/d3.min.js':[
                        'bower_components/d3/d3.min.js'
                      , 'bower_components/d3-tip/index.js'
                    ]
                },{
                    'dist/sites/client/js/sites.min.js':[
                        'client/js/sites.js'
                      , 'client/js/controllers/sites.js'
                      , 'client/js/visual/site.js'
                      , 'client/js/factories/visual.js'
                    ]
                }]
            }
        }
      , copy:{
            planner:{
                files:[{
                    src:'client/favicon.ico'
                  , dest:'dist/planner/client/favicon.ico'
                },{
                    expand:true
                  , src:['core/**']
                  , dest:'dist/planner/'
                },{
                    expand:true
                  , src:['run/.*']
                  , dest:'dist/planner/'
                },{
                    src:'server/planner.js'
                  , dest:'dist/planner/server/planner.js'
                },{
                    src:'server/planner.io.js'
                  , dest:'dist/planner/server/planner.io.js'
                },{
                    src:'server/planner.ion.js'
                  , dest:'dist/planner/server/planner.ion.js'
                },{
                    expand:true
                  , cwd:'server/'
                  , src:['planners/*']
                  , dest:'dist/planner/server/'
                },{
                    src:'config/planner.js'
                  , dest:'dist/planner/config/planner.js'
                },{
                    src:'package/planner.json'
                  , dest:'dist/planner/package.json'
                }]
            }
          , notifier:{
                files:[{
                    src:'client/favicon.ico'
                  , dest:'dist/notifier/client/favicon.ico'
                },{
                    expand:true
                  , src:['core/*.js']
                  , dest:'dist/notifier/'
                },{
                    src:'server/notifier.io.js'
                  , dest:'dist/notifier/server/notifier.io.js'
                },{
                    src:'config/notifier.js'
                  , dest:'dist/notifier/config/notifier.js'
                },{
                    src:'package/notifier.json'
                  , dest:'dist/notifier/package.json'
                }]
            }
          , monitor:{
                files:[{
                    expand:true
                  , src:['core/*.js']
                  , dest:'dist/monitor/'
                },{
                    src:'server/monitor.js'
                  , dest:'dist/monitor/server/monitor.js'
                },{
                    src:'config/monitor.js'
                  , dest:'dist/monitor/config/monitor.js'
                },{
                    src:'package/monitor.json'
                  , dest:'dist/monitor/package.json'
                }]
            }
          , sites:{
                files:[{
                    src:'client/favicon.ico'
                  , dest:'dist/sites/client/favicon.ico'
                },{
                    expand:true
                  , flatten:true
                  , cwd:'bower_components/font-awesome/'
                  , src:'fonts/fontawesome-webfont.*'
                  , dest:'dist/sites/client/fonts/'
                },{
                    expand:true
                  , src:['core/**']
                  , dest:'dist/sites/'
                },{
                    src:'server/sites.js'
                  , dest:'dist/sites/server/sites.js'
                },{
                    expand:true
                  , cwd:'server/'
                  , src:['sites/*']
                  , dest:'dist/sites/server/'
                },{
                    src:'config/sites.js'
                  , dest:'dist/sites/config/sites.js'
                }]
            }
        }
      , svgmin:{
            sites:{
                files:[{
                    src:'client/svg/canvas.svg'
                  , dest:'dist/sites/client/svg/canvas.svg'
                },{
                    src:'client/svg/hiperborea.svg'
                  , dest:'dist/sites/client/svg/hiperborea.svg'
                },{
                    src:'client/svg/pleni.sites.svg'
                  , dest:'dist/sites/client/svg/pleni.sites.svg'
                }]
            }
        }
      , cssmin:{
            sites:{
                files:{
                    'dist/sites/client/style.css':[
                        'dist/sites/client/style.css'
                    ]
                }
            }
        }

      , latex:{
            options:{haltOnError:true}
          , pdf_target:{
                options:{outputDirectory:'docs'}
              , src:['docs/perfil.tex']
            }
        }
    });

    grunt.registerTask('test:core',['mochacli:core']);
    grunt.registerTask('test:master',['mochacli:master']);
    grunt.registerTask('test:planner',['mochacli:dumb','mochacli:planners']);
    grunt.registerTask('test:notifier',['mochacli:notifier']);
    grunt.registerTask('test:monitor',['mochacli:monitor']);
    grunt.registerTask('test:sites',['mochacli:sites']);
    grunt.registerTask('test',[
        'test:core'
      , 'test:master'
      , 'test:planner'
      , 'test:notifier'
      , 'test:monitor'
      , 'test:sites'
    ]);

    grunt.registerTask('build:master',[
        'clean:master'
      , 'concurrent:master'
      , 'cssmin:master'
    ]);
    grunt.registerTask('build:planner',[
        'clean:planner'
      , 'concurrent:planner'
    ]);
    grunt.registerTask('build:notifier',[
        'clean:notifier'
      , 'concurrent:notifier'
    ]);
    grunt.registerTask('build:monitor',[
        'clean:monitor'
      , 'concurrent:monitor'
    ]);
    grunt.registerTask('build:sites',[
        'clean:sites'
      , 'concurrent:sites'
      , 'cssmin:sites'
    ]);
    grunt.registerTask('build',[
        'build:planner'
      , 'build:notifier'
      , 'build:monitor'
      , 'build:sites'
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
};

