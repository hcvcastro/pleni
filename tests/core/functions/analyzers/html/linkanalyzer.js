'use strict';

var should=require('should')
  , fs=require('fs')
  , join=require('path').join
  , _url=require('url')
  , base='../../../../../core/functions/'
  , analyzer=require(base+'analyzers/html/linkanalyzer')
  , res01=function(args,done){
        args.should.have.property('refs').and.be.empty;
        args.should.have.property('rels').and.not.be.empty;
        args.rels.should.have.length(13);
        args.rels.map(function(item){
            return item.tag;
        }).should.be.eql(
            ['a','a','a','a','a','a','a','a','a','a','link','link','link']);
        args.rels.every(function(item){
            return _url.resolve(item.url,'.')==='http://localhost/data/';
        }).should.be.true;
        done();
    }
  , res02=function(args,done){
        args.should.have.property('refs').and.be.empty;
        args.should.have.property('rels').and.not.be.empty;
        args.rels.should.have.length(12);
        args.rels.map(function(item){
            return item.tag;
        }).should.be.eql(
            ['a','a','a','a','a','a','a','area','link','link','link','script']);
        args.rels.every(function(item){
            return _url.resolve(item.url,'.')==='http://localhost/sata/';
        }).should.be.true;
        done();
    }
  , res03=function(args,done){
        args.should.have.property('refs').and.not.be.empty;
        args.refs.should.have.length(1);
        args.refs.map(function(item){
            return item.tag;
        }).should.be.eql(['link']);
        args.refs.every(function(item){
            return _url.resolve(item.url,'.')==='http://galao.local/';
        }).should.be.true;
        args.should.have.property('rels').and.not.be.empty;
        args.rels.should.have.length(12);
        args.rels.map(function(item){
            return item.tag;
        }).should.be.eql(
            ['audio','audio','embed','embed','link','script','script','source'
                ,'source','source','video','video']);
        args.rels.every(function(item){
            return _url.resolve(item.url,'.')==='http://localhost/';
        }).should.be.true;
        done();
    }

describe('test link analyzer',function(){
    [
        ['test01.html',res01]
      , ['test02.html',res02]
      , ['test03.html',res03]
      , ['test04.html']
      , ['test05.html']
      , ['test06.html']
      , ['test07.html']
      , ['test08.html']
      , ['test09.html']
      , ['test10.html']
    ].forEach(function(item){
        var body='';

        before(function(done){
            fs.readFile(join(__dirname,'..','data',item[0]),'utf8'
                ,function(err,data){
                if(err){
                    throw err;
                }

                body=data;
                done();
            })
        });

        it('test spreading links',function(done){
            analyzer({
                site:'http://localhost'
              , url:'http://localhost/data/'+item[0]
              , body:body
            })
            .done(function(args){
                if(item[1]){
                    item[1](args,done);
                }else{
                    done();
                }
            });
        });
    });
});

