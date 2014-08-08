'use strict';

var request=require('request');

module.exports=function(grunt){
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var reloadPort=35729,filescontrol;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        develop:{
            control:{
                file:'server/app.js'
            }
          , fetcher:{
                file:'planners/fetcher.js'
            }
          , creator:{
                file:'planners/creator.js'
            }
        },

        watch:{
            options:{
                nospawn:true
              , livereload:reloadPort
            },
            control:{
                files:['server/app.js', 'server/controllers/*.js']
              , tasks:['develop:control','delayed-livereload-control']
            },
            fetcher:{
                files:['planners/fetcher.js']
              , tasks:['develop:fetcher']
            },
            creator:{
                files:['planners/creator.js']
              , tasks:['develop:creator']
            },
            js:{
                files:['public/js/*.js']
              , options:{livereload:reloadPort}
            },
            styl:{
                files:['server/stylus/*.styl'],
                options:{
                    livereload:reloadPort
                }
            },
            jade:{
                files:['server/views/{,*/}*.jade'],
                options:{
                    livereload:reloadPort
                }
            },
            tex:{
                files:['docs/*.tex'],
                tasks:['latex']
            },
            testcontrol:{
                files:['test/*.js'],
                tasks:['mochacli']
            },
            testfetcher:{
                files:['test/fetcher.js'],
                tasks:['mochacli:fetcher']
            }
        },

        latex:{
            options:{
                haltOnError:true
            },
            pdf_target:{
                options:{
                    outputDirectory:'docs',
                },
                src:['docs/perfil.tex']
            }
        },

        mochacli: {
            options: {
                reporter: 'spec',
                bail: true
            },
            all: ['test/*.js'],
            fetcher: ['test/fetcher.js']
        }
    });

    grunt.config.requires('watch.control.files');
    filescontrol=grunt.config('watch.control.files');
    filescontrol=grunt.file.expand(filescontrol);

    grunt.registerTask('delayed-livereload-control',
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

    grunt.registerTask('serve:control',['develop:control','watch:control']);
    grunt.registerTask('serve:fetcher',['develop:fetcher','watch:fetcher']);
    grunt.registerTask('serve:creator',['develop:creator','watch:creator']);
    grunt.registerTask('test',['mochacli']);
};

