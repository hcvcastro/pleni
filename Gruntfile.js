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
              , livereload:reloadPort
            }
/* -------- planners watching ----------------------------------------------- */
          , basic:{
                files:['planners/basic.js']
              , tasks:['develop:basic']
            }
          , clock:{
                files:['planners/clock.js']
              , tasks:['develop:clock']
            }
          , site_creator:{
                files:['planners/site_creator.js']
              , tasks:['develop:site_creator']
            }
/* -------- director watching ----------------------------------------------- */
          , js:{
                files:['public/js/*.js']
              , options:{livereload:reloadPort}
            }
          , styl:{
                files:['server/stylus/*.styl']
              , options:{livereload:reloadPort}
            }
          , jade:{
                files:['server/views/{,*/}*.jade']
              , options:{livereload:reloadPort}
            }
/* -------- test-driven watching -------------------------------------------- */
          , test_planners:{
                files:['test/planners/{,*/}*.js']
              , tasks:['mochacli:planners']
            }
/* -------- documentation watching ------------------------------------------ */
          , tex:{
                files:['docs/*.tex']
              , tasks:['latex']
            }
        }

      , develop:{
            basic:   { file:'planners/basic.js'    }
          , clock:   { file:'planners/clock.js'    }
          , site_creator: { file:'planners/site_creator.js'  }
        }

      , mochacli:{
            options:{
                reporter:'spec'
              , bail:true
            }
          //, planners: ['test/planners/{,*/}*.js']
          , planners: ['test/planners/functions/sites_fetcher.js']
        }

      , latex:{
            options:{haltOnError:true}
          , pdf_target:{
                options:{outputDirectory:'docs'}
              , src:['docs/perfil.tex']
            }
        }
    });

//    grunt.config.requires('watch.control.files');
//    filescontrol=grunt.config('watch.control.files');
//    filescontrol=grunt.file.expand(filescontrol);

//    grunt.registerTask('delayed-livereload-control',
//        'Live reload after the node server has restarted.',function(){
//        var done=this.async();
//        setTimeout(function(){
//            request.get('http://localhost:'+reloadPort+'/changed?files='
//            +filescontrol.join(','),function(err,res){
//                var reloaded=!err&&res.statusCode===200;
//                if(reloaded){
//                    grunt.log.ok('Delayed live reload successful.');
//                }else{
//                    grunt.log.error('Unable to make a delayed live reload.');
//                }
//                done(reloaded);
//            });
//        },500);
//    });

//    grunt.registerTask('serve:control',['develop:control','watch:control']);

    ['basic','clock','site_creator']
    .forEach(function(element){
        grunt.registerTask(
            'test:'+element,
            ['mochacli:'+element]
        );
        grunt.registerTask(
            'serve:'+element,
            ['develop:'+element,'watch:'+element]);
    });
};

