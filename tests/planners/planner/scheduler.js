'use strict';

var request=require('supertest')
  , should=require('should')
  , planners=[{
        name:'planner'
      , script:'../../../server/planner'
    },{
        name:'planner.io'
      , script:'../../../server/planner.io'
    },{
        name:'planner.ion'
      , script:'../../../server/planner.ion'
    }]

planners.forEach(function(element){
    describe('tasks functions for planner scheduler '+element.name,function(){
        var app
          , tid

        before(function(done){
            var server=require(element.script);
            app=server.app;

            request(app)
                .post('/')
                .send({
                    task:'exclusive'
                  , count: 1
                  , interval: 1000
                })
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    console.log(err);
                    console.log(res.body);
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    tid=res.body.tid
                    done();
                });
        });

        it('POST /:tid/_run',function(done){
            request(app)
                .post('/'+tid+'/_run')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.property('status');
                    res.body.status.should.be.eql('running');
                    done();
                });
        });

        it('GET /_status',function(done){
            request(app)
                .get('/_status')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.property('status');
                    res.body.status.should.be.eql('running');
                    done();
                });
        });

        it('POST /:tid/_stop',function(done){
            request(app)
                .post('/'+tid+'/_stop')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.property('status');
                    res.body.status.should.be.eql('stopped');
                    done();
                });
        });

        it('GET /_status',function(done){
            request(app)
                .get('/_status')
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.property('status');
                    res.body.status.should.be.eql('stopped');
                    done();
                });
        });

        after(function(done){
            request(app)
                .delete('/'+tid)
                .expect('Content-Type',/json/)
                .expect(200)
                .end(function(err,res){
                    res.statusCode.should.be.eql(200);
                    res.should.be.json;
                    res.body.should.have.property('ok').and.eql(true);
                    done();
                });
        });
    });
});

