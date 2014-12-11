'use strict';

var should=require('should')
  , path=require('path')
  , loadconfig=require('../../../master/utils/loadconfig')

describe('loading the config files',function(){
    it('loading dbservers.js',function(done){
        var config=loadconfig(path.join(
            __dirname,'..','..','..','master','config','dbservers.json'));

        config.should.be.Array;
        for(var a in config){
            config[a].should.have.property('id').and.have.be.a.String;
            config[a].should.have.property('db').and.have.be.a.Object;
            config[a].db.should.have.property('host').and.have.be.a.String;
            config[a].db.should.have.property('port').and.have.be.a.Integer;
            config[a].db.should.have.property('user').and.have.be.a.String;
            config[a].db.should.have.property('pass').and.have.be.a.String;
            config[a].db.should.have.property('prefix').and.have.be.a.String;
        }
        done();
    });

    it('loading repositories.js',function(done){
        var config=loadconfig(path.join(
            __dirname,'..','..','..','master','config','repositories.json'));

        config.should.be.Array;
        for(var a in config){
            config[a].should.have.property('id').and.have.be.a.String;
            config[a].should.have.property('_dbserver').and.have.be.a.String;
            config[a].should.have.property('db').and.have.be.a.Object;
            config[a].db.should.have.property('name').and.have.be.a.String;
        }
        done();
    });

    it('loading planners.js',function(done){
        var config=loadconfig(path.join(
            __dirname,'..','..','..','master','config','planners.json'));

        config.should.be.Array;
        for(var a in config){
            config[a].should.have.property('id').and.have.be.a.String;
            config[a].should.have.property('planner').and.have.be.a.Object;
            config[a].planner.should.have.property('host').and.have.be.a.String;
            config[a].planner.should.have.property('port')
                .and.have.be.a.Integer;
        }
        done();
    });

    it('loading notifiers.js',function(done){
        var config=loadconfig(path.join(
            __dirname,'..','..','..','master','config','notifiers.json'));

        config.should.be.Array;
        for(var a in config){
            config[a].should.have.property('id').and.have.be.a.String;
            config[a].should.have.property('notifier').and.have.be.a.Object;
            config[a].notifier.should.have.property('host')
                .and.have.be.a.String;
            config[a].notifier.should.have.property('port')
                .and.have.be.a.Integer;
        }
        done();
    });
});

