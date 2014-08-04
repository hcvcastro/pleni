'use strict';

var request=require('request');

module.exports=function(grunt){
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var reloadPort=35729,files;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        develop:{
            server:{
                file:'server/app.js'
            }
        },

        watch:{
            options:{
                nospawn:true,
                livereload:reloadPort
            },
            server:{
                files:[
                    'server/app.js',
                    'server/controllers/*.js'
                ],
                tasks:['develop','delayed-livereload']
            },
            js:{
                files:['public/js/*.js'],
                options:{
                    livereload:reloadPort
                }
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
            test:{
                files:['test/*.js'],
                tasks:['mochacli']
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
            all: ['test/*.js']
        }
    });


    grunt.config.requires('watch.server.files');
    files=grunt.config('watch.server.files');
    files=grunt.file.expand(files);

    grunt.registerTask('delayed-livereload',
        'Live reload after the node server has restarted.',function(){
        var done=this.async();
        setTimeout(function(){
            request.get('http://localhost:'+reloadPort+'/changed?files='
            +files.join(','),function(err,res){
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

    grunt.registerTask('serve',['develop','watch']);
    grunt.registerTask('test',['mochacli']);
};

