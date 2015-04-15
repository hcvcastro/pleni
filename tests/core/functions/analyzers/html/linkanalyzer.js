'use strict';

var should=require('should')
  , fs=require('fs')
  , join=require('path').join
  , _url=require('url')
  , base='../../../../../core/functions/'
  , analyzer=require(base+'analyzers/html/linkanalyzer')
  , res=[
    function(args,done){
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
  , function(args,done){
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
  , function(args,done){
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
  , function(args,done){
        args.should.have.property('refs').and.be.empty;
        args.should.have.property('rels').and.not.be.empty;
        args.rels.should.have.length(5);
        args.rels.map(function(item){
            return item.tag;
        }).should.be.eql(
            ['img','img','img','img','img']);
        args.rels.every(function(item){
            return _url.resolve(item.url,'.')==='http://localhost/data/';
        }).should.be.true;
        done();
    }
  , function(args,done){
        args.should.have.property('refs').and.be.empty;
        args.should.have.property('rels').and.not.be.empty;
        args.rels.should.have.length(5);
        args.rels.map(function(item){
            return item.tag;
        }).should.be.eql(
            ['object','object','object','object','object']);
        args.rels.every(function(item){
            return _url.resolve(item.url,'.')==='http://localhost/sata/';
        }).should.be.true;
        done();
    }
  , function(args,done){
        args.should.have.property('refs').and.not.be.empty;
        args.refs.should.have.length(2);
        args.refs.map(function(item){
            return item.tag;
        }).should.be.eql(['frame','iframe']);
        args.refs.every(function(item){
            return _url.resolve(item.url,'.')==='http://galao.local/';
        }).should.be.true;
        args.should.have.property('rels').and.not.be.empty;
        args.rels.should.have.length(8);
        args.rels.map(function(item){
            return item.tag;
        }).should.be.eql(
            ['frame','frame','frame','frame','iframe','iframe','iframe'
                ,'iframe']);
        args.rels.every(function(item){
            return _url.resolve(item.url,'.')==='http://localhost/';
        }).should.be.true;
        done();
    }
  , function(args,done){
        args.should.have.property('refs').and.be.empty;
        args.should.have.property('rels').and.not.be.empty;
        args.rels.should.have.length(3);
        args.rels.map(function(item){
            return item.tag;
        }).should.be.eql(
            ['a','a','a']);
        args.rels.every(function(item){
            return _url.resolve(item.url,'.')==='http://localhost/';
        }).should.be.true;
        done();
    }
  , function(args,done){
        args.should.have.property('refs').and.not.be.empty;
        args.refs.should.have.length(3);
        args.refs.map(function(item){
            return item.tag;
        }).should.be.eql(
            ['a','a','a']);
        args.refs.every(function(item){
            return _url.resolve(item.url,'.')==='http://galao.local/sub/';
        }).should.be.true;
        args.should.have.property('rels').and.be.empty;
        done();
    }
  , function(args,done){
        args.should.have.property('refs').and.be.empty;
        args.should.have.property('rels').and.not.be.empty;
        args.rels.should.have.length(3);
        args.rels.map(function(item){
            return item.tag;
        }).should.be.eql(
            ['a','a','a']);
        args.rels.every(function(item){
            return _url.resolve(item.url,'.')==='http://localhost/data/';
        }).should.be.true;
        done();
    }
  , function(args,done){
        args.should.have.property('refs').and.not.be.empty;
        args.refs.should.have.length(3);
        args.refs.map(function(item){
            return item.tag;
        }).should.be.eql(
            ['a','a','a']);
        args.refs.every(function(item){
            return _url.resolve(item.url,'.')==='http://galao.local/';
        }).should.be.true;
        args.should.have.property('rels').and.be.empty;
        done();
    }];

describe('test link analyzer',function(){
    [
        ['test01.html',res[0]]
      , ['test02.html',res[1]]
      , ['test03.html',res[2]]
      , ['test04.html',res[3]]
      , ['test05.html',res[4]]
      , ['test06.html',res[5]]
      , ['test07.html',res[6]]
      , ['test08.html',res[7]]
      , ['test09.html',res[8]]
      , ['test10.html',res[9]]
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

