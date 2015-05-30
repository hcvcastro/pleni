'use strict';

var request=require('request');

module.exports=function(grunt){
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')

      , watch:{
/* -------- master watching ------------------------------------------------- */
            master:{
                files:[
                    'server/master.js'
                  , 'server/master/**/*.js'
                ]
              , tasks:['develop:master']
            }
/* -------- planners watching ----------------------------------------------- */
          , dumb:{
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
/* -------- sites watching -------------------------------------------------- */
          , sites:{
                files:[
                    'server/sites.js'
                  , 'server/sites/*.js'
                ]
              , tasks:['develop:sites']
            }
/* -------- frontend watching ----------------------------------------------- */
          , masterjs:{
                files:['client/js/**/*.js']
              , options:{
                    livereload:35729
                }
            }
          , monitorjs:{
                files:['client/js/**/*.js']
              , options:{
                    livereload:35730
                }
            }
          , masterless:{
                files:['client/less/**/*.less']
              , options:{
                    livereload:35729
                }
            }
          , monitorless:{
                files:['client/less/**/*.less']
              , options:{
                    livereload:35730
                }
            }
          , mastersvg:{
                files:['client/svg/**/*.svg']
              , options:{
                    livereload:35729
                }
            }
          , monitorsvg:{
                files:['client/svg/**/*.svg']
              , options:{
                    livereload:35730
                }
            }
          , masterviews:{
              files:['client/views/master/**/*.jade']
              , options:{
                    livereload:35729
                }
            }
          , monitorviews:{
              files:['client/views/monitor/**/*.jade']
              , options:{
                    livereload:35730
                }
            }
/* -------- documentation watching ------------------------------------------ */
          , tex:{
                files:['docs/perfil.tex']
              , tasks:['latex']
            }
        }

      , develop:{
            master:{
                file:'server/master.js'
              , env:{
                    PORT:grunt.option('port')||3000
                  , ENV:'development'
                }
            }
          , dumb:{
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
              , timeout:50000
              , env:{
                    ENV:'test'
                }
            }
          , core:['tests/core/**/*.js']
          , master:['tests/master/**/*.js']
          , dumb:['tests/planners/dumb/server.js']
          , planners:['tests/planners/planner/*.js']
          , notifier:['tests/notifiers/**/*.js']
          , monitor:['tests/monitor/server.js']
          , sites:['tests/sites/*.js']
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
            master:{
                options:{
                    pretty:false
                }
              , files:{
                    'dist/master/client/index.html'
                  : 'client/views/master/prod.jade'
                  , 'dist/master/client/404.html'
                  : 'client/views/master/404.jade'
                  , 'dist/master/client/home.html'
                  : 'client/views/master/pages/home.jade'
                  , 'dist/master/client/static/api.html'
                  : 'client/views/master/static/api.jade'
                  , 'dist/master/client/static/contact.html'
                  : 'client/views/master/static/contact.jade'
                  , 'dist/master/client/static/privacy.html'
                  : 'client/views/master/static/privacy.jade'
                  , 'dist/master/client/static/security.html'
                  : 'client/views/master/static/security.jade'
                  , 'dist/master/client/static/started.html'
                  : 'client/views/master/static/started.jade'
                  , 'dist/master/client/static/support.html'
                  : 'client/views/master/static/support.jade'
                  , 'dist/master/client/static/terms.html'
                  : 'client/views/master/static/terms.jade'
                  , 'dist/master/client/resources.html'
                  : 'client/views/master/pages/resources.jade'
                  , 'dist/master/client/projects.html'
                  : 'client/views/master/pages/projects.jade'
                  , 'dist/master/client/workspace.html'
                  : 'client/views/master/pages/workspace.jade'
                }
            }
          , planner:{
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
            master:{
                options:{
                    cleancss:true
                  , paths:['bower_components']
                }
              , files:{
                    'dist/master/client/style.css'
                  : 'client/less/master.less'
                  , 'dist/master/client/tasks.css'
                  : 'client/less/tasks.less'
                }
            }
          , planner:{
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
            master:{
                files:[{
                    'dist/master/client/js/angular-no-captcha.min.js':[
                        'bower_components/angular-no-captcha/src/'
                            +'angular-no-captcha.js'
                    ]
                },{
                    'dist/master/client/js/socket.io.min.js':[
                        'bower_components/socket.io-client/socket.io.js'
                    ]
                },{
                    'dist/master/client/js/socket.io.min.js':[
                        'bower_components/socket.io-client/socket.io.js'
                    ]
                },{
                    'dist/master/client/js/d3.min.js':[
                        'bower_components/d3/d3.min.js'
                      , 'bower_components/d3-tip/index.js'
                    ]
                },{
                    'dist/master/client/js/master.min.js':[
                        'client/js/utils.js'
                      , 'client/js/editor.js'
                      , 'client/js/master.js'
                      , 'client/js/filters.js'
                      , 'client/js/factories/resources/dbservers.js'
                      , 'client/js/factories/resources/repositories.js'
                      , 'client/js/factories/resources/planners.js'
                      , 'client/js/factories/resources/notifiers.js'
                      , 'client/js/factories/resources/projects.js'
                      , 'client/js/factories/resources/workspace.js'
                      , 'client/js/factories/resources.js'
                      , 'client/js/visual/site.js'
                      , 'client/js/factories/auth.js'
                      , 'client/js/factories/editor.js'
                      , 'client/js/factories/socket.js'
                      , 'client/js/factories/visual.js'
                      , 'client/js/controllers/master/static.js'
                      , 'client/js/controllers/master/home.js'
                      , 'client/js/controllers/master/signin.js'
                      , 'client/js/controllers/master/signup.js'
                      , 'client/js/controllers/master/forgot.js'
                      , 'client/js/controllers/master/reset.js'
                      , 'client/js/controllers/master/header.js'
                      , 'client/js/controllers/master/notifier.js'
                      , 'client/js/controllers/master/resources.js'
                      , 'client/js/controllers/master/projects.js'
                      , 'client/js/controllers/master/workspace.js'
                      , 'client/js/controllers/master/settings.js'
                    ]
                }]
            }
          , planner:{
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
            master:{
                files:[{
                    src:'client/favicon.ico'
                  , dest:'dist/master/client/favicon.ico'
                },{
                    src:'client/svg/arrow_clean.svg'
                  , dest:'dist/master/client/svg/arrow.svg'
                },{
                    src:'client/svg/text_clean.svg'
                  , dest:'dist/master/client/svg/text.svg'
                },{
                    expand:true
                  , flatten:true
                  , cwd:'bower_components/font-awesome/'
                  , src:'fonts/fontawesome-webfont.*'
                  , dest:'dist/master/client/fonts/'
                },{
                    src:'bower_components/jquery/dist/jquery.min.js'
                  , dest:'dist/master/client/js/jquery.min.js'
                },{
                    src:'bower_components/angular/angular.min.js'
                  , dest:'dist/master/client/js/angular.min.js'
                },{
                    src:'bower_components/angular-route/angular-route.min.js'
                  , dest:'dist/master/client/js/angular-route.min.js'
                },{
                    src:'bower_components/angular-resource/'
                        +'angular-resource.min.js'
                  , dest:'dist/master/client/js/angular-resource.min.js'
                },{
                    src:'bower_components/angular-animate/'
                        +'angular-animate.min.js'
                  , dest:'dist/master/client/js/angular-animate.min.js'
                },{
                    src:'bower_components/angular-socket-io/socket.min.js'
                  , dest:'dist/master/client/js/angular-socket-io.min.js'
                },{
                    src:'bower_components/angular-cookies/'
                        +'angular-cookies.min.js'
                  , dest:'dist/master/client/js/angular-cookies.min.js'
                },{
                    src:'bower_components/ngstorage/ngStorage.min.js'
                  , dest:'dist/master/client/js/angular-storage.min.js'
                },{
                    src:'bower_components/json-editor/dist/jsoneditor.min.js'
                  , dest:'dist/master/client/js/jsoneditor.min.js'
                },{
                    expand:true
                  , cwd:'client/views/master'
                  , src:['**']
                  , dest:'dist/master/views/'
                },{
                    expand:true
                  , src:['core/**']
                  , dest:'dist/master/'
                },{
                    src:'server/master.js'
                  , dest:'dist/master/server/master.js'
                },{
                    expand:true
                  , cwd:'server/'
                  , src:['master/**']
                  , dest:'dist/master/server/'
                },{
                    src:'config/master.js'
                  , dest:'dist/master/config/master.js'
                },{
                    src:'package/master.json'
                  , dest:'dist/master/package.json'
                }]
            }
          , planner:{
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
                },{
                    src:'package/sites.json'
                  , dest:'dist/sites/package.json'
                }]
            }
        }
      , svgmin:{
            master:{
                files:[{
                    src:'client/svg/canvas.svg'
                  , dest:'dist/master/client/svg/canvas.svg'
                },{
                    src:'client/svg/hiperborea.svg'
                  , dest:'dist/master/client/svg/hiperborea.svg'
                },{
                    src:'client/svg/node1.svg'
                  , dest:'dist/master/client/svg/node1.svg'
                },{
                    src:'client/svg/node2.svg'
                  , dest:'dist/master/client/svg/node2.svg'
                },{
                    src:'client/svg/node3.svg'
                  , dest:'dist/master/client/svg/node3.svg'
                },{
                    src:'client/svg/node4.svg'
                  , dest:'dist/master/client/svg/node4.svg'
                },{
                    src:'client/svg/tile.svg'
                  , dest:'dist/master/client/svg/tile.svg'
                }]
            }
          , sites:{
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
            master:{
                files:{
                    'dist/master/client/style.css':[
                        'dist/master/client/style.css'
                    ]
                }
            }
          , sites:{
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
    grunt.registerTask('test:master',['mochacli:core','mochacli:master']);
    grunt.registerTask('test:planner',['mochacli:dumb','mochacli:planners']);
    grunt.registerTask('test:notifier',['mochacli:core','mochacli:notifier']);
    grunt.registerTask('test:monitor',['mochacli:core','mochacli:monitor']);
    grunt.registerTask('test:sites',['mochacli:core','mochacli:sites']);
    grunt.registerTask('test',[
        'mochacli:core'
      , 'mochacli:master'
      , 'mochacli:dumb'
      , 'mochacli:planners'
      , 'mochacli:notifier'
      , 'mochacli:monitor'
      , 'mochacli:sites'
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
        'build:master'
      , 'build:planner'
      , 'build:notifier'
      , 'build:monitor'
      , 'build:sites'
    ]);

    grunt.registerTask('serve:dumb',[
        'develop:dumb'
      , 'watch'
    ]);
    grunt.registerTask('serve:planner',[
        'develop:planner'
      , 'watch'
    ]);
    grunt.registerTask('serve:planner:io',[
        'develop:planner_io'
      , 'watch'
    ]);
    grunt.registerTask('serve:planner:ion',[
        'develop:planner_ion'
      , 'watch'
    ]);
    grunt.registerTask('serve:notifier',[
        'develop:notifier'
      , 'watch'
    ]);
    grunt.registerTask('serve:monitor',[
        'develop:monitor'
      , 'watch'
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

