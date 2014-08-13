'use strict';

var request=require('supertest')
  , should=require('should')
  , server=require('../../planners/planner')
  , app=server.app

describe('default planner scheduler',function(){
    describe('tasks functions',function(){
        var tid;

        it('PUT /site_creator',function(done){
            request(app)
                .put('/site_creator')
                .send({
                    host:'http://localhost:5984'
                  , dbuser:'jacobian'
                  , dbpass:'asdf'
                  , dbname:'test2'
                  , site_type:'site'
                  , site_url:'http://galao.local'
                })
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    res.body.should.have.property('ok').with.eql(true);
                    res.body.should.have.property('tid');
                    tid=res.body.tid;
                    done();
                });
        });

        it('POST /_run',function(done){
            request(app)
                .post('/_run')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    res.body.should.be.eql({status:'running'});
                    done();
                });
        });
    });
});

