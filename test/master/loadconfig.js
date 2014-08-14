'use strict';

var should=require('should')
  , path=require('path')
  , loadconfig=require('../../master/loadconfig')

describe('loading the config files',function(){
    it('loading repositories.js',function(done){
        var config=loadconfig(path.join(
            __dirname,'..','..','master','config','repositories.json'));

        config.should.be.json;
        for(var a in config){
            config[a].should.have.property('host').and.have.be.a.String;
            config[a].should.have.property('dbuser').and.have.be.a.String;
            config[a].should.have.property('dbpass').and.have.be.a.String;
            config[a].should.have.property('prefix').and.have.be.a.String;
        }
        done();
    });

    it('loading planners.js',function(done){
        var config=loadconfig(path.join(
            __dirname,'..','..','master','config','planners.json'));

        config.should.be.json;
        for(var b in config){
            config[b].should.have.property('host').and.have.be.a.String;
        }
        done();
    });
});

