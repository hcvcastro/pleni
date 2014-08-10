'use strict';

var request=require('supertest')
  , should=require('should')
  , server=require('../../planners/basic')
  , app=server.app
  , messages=server.messages

describe('Basic Express Server',function(){
    describe('REST functions',function(){
        it('GET /',function(done){
            request(app)
                .get('/')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    messages.ready.should.be.eql(res.body);
                    done();
                });
        });

        it('GET /status',function(done){
            request(app)
                .get('/status')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    messages.ready.should.be.eql(res.body);
                    done();
                });
        });

        it('POST /run',function(done){
            request(app)
                .post('/run')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    messages.run.should.be.eql(res.body);
                    done();
                });
        });

        it('POST /stop',function(done){
            request(app)
                .post('/stop')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    app.messages.stop.should.be.eql(res.body);
                    done();
                });
        });

        it('PUT /',function(done){
            request(app)
                .put('/')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    app.messages.add.should.be.eql(res.body);
                    done();
                });
        });

        it('DELETE /',function(done){
            request(app)
                .delete('/')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.should.be.json;
                    app.messages.delete.should.be.eql(res.body);
                    done();
                });
        });
    });
});

