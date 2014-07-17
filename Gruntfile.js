'use strict';

module.exports=function(grunt){
    grunt.loadNpmTasks('grunt-latex');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        latex: {
            options: {
                haltOnError: true
            },
            pdf_target: {
                options: {
                    outputDirectory: 'docs',
                },
                src: ['docs/perfil.tex']
            }
        },
        watch: {
            src: {
                files: ['docs/*.tex'],
                tasks: ['latex']
            }
        }
    });
};

