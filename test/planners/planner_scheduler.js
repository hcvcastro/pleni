'use strict';

var request=require('supertest')
  , should=require('should')
  , server=require('../../planners/planner')
  , app=server.app

describe('default planner server',function(){
    describe('tasks functions',function(){
        var tid;

        it('PUT /site_creator',function(done){
            request(app)
                .put('/site_creator')
                .send({
                    host:'http://localhost:5894'
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

/*        it('GET /task',function(done){
            request(app)
                .get('/task')
                .expect('Content-Type',/json/)
                .expect(404)
                .end(function(err,res){
                    res.should.be.json;
                    res.body.should.be.eql({ok:false});
                    done();
                });
        });

        it('GET /:tid',function(done){
            request(app)
                .get('/'+tid)
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    res.body.should.have.property('ok').with.eql(true);
                    res.body.should.have.property('task');
                    done();
                });
        });

        it('DELETE /task',function(done){
            request(app)
                .delete('/task')
                .expect('Content-Type',/json/)
                .expect(404)
                .end(function(err,res){
                    res.should.be.json;
                    res.body.should.be.eql({ok:false});
                    done();
                });
        });

        it('PUT /newtask',function(done){
            request(app)
                .put('/newtask')
                .expect('Content-Type',/json/)
                .expect(403)
                .end(function(err,res){
                    res.should.be.json;
                    res.body.should.have.property('ok').with.eql(false);
                    res.body.should.have.not.property('tid');
                    done();
                });
        });

        it('DELETE /:tid',function(done){
            request(app)
                .delete('/'+tid)
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    res.body.should.be.eql({ok:true});
                    done();
                });
        });

        it('PUT /newtask',function(done){
            request(app)
                .put('/newtask')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    res.body.should.have.property('ok').with.eql(true);
                    res.body.should.have.property('tid');
                    done();
                });
        });*/
    });
});

