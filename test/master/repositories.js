'use strict';

var request=require('supertest')
  , should=require('should')
  , app=require('../../master/app')
  , _success=require('../../master/json-response').success
  , _error=require('../../master/json-response').error

describe('repositories controller functions',function(){
    it('GET /repositories/view',function(done){
        request(app)
            .get('/repositories/view')
            .expect(200,done);
    });

    it('GET /repositories',function(done){
        request(app)
            .get('/repositories')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.should.be.json;
                for(var i in res.body){
                    res.body[i].should.have.property('host');
                    res.body[i].should.have.property('port');
                    res.body[i].should.have.property('prefix');
                }
                done();
            });
    });

    [
        {test:'',expected:_success.ok,status:202}
      , {test:{},expected:_success.ok,status:202}
      , {test:{"":""},expected:_error.validation,status:400}
      , {test:{"__":""},expected:_error.validation,status:400}
      , {test:{"host":{}},expected:_error.validation,status:400}
      , {test:{"host":{host:""}},expected:_error.validation,status:400}
      , {test:{"host":
          {host:"http://localhost"}},
          expected:_error.validation,status:400}
      , {test:{
          "host":{
              host:"http://localhost"
            , port:8080
            , dbuser:'boo'
            , dbpass:'boo.'
            , prefix:'p_'
          }
        },expected:_success.ok,status:202}
    ]
    .forEach(function(element){
        it('PUT /repositories',function(done){
            request(app)
                .put('/repositories')
                .send(element.test)
                .expect('Content-Type',/json/)
                .expect(element.status)
                .end(function(err,res){
                    res.statusCode.should.be.eql(element.status);
                    res.should.be.json;
                    res.body.should.have.property('ok');
                    res.body.should.eql(element.expected);
                    done();
                });
        });
    });

    [
        {test:'',expected:_error.validation,status:400}
      , {test:{},expected:_error.validation,status:400}
      , {test:{id:1},expected:_error.validation,status:400}
      , {test:{repository:''},expected:_error.validation,status:400}
      , {test:{repository:'1'},expected:_error.validation,status:400}
      , {test:{repository:'/'},expected:_error.validation,status:400}
      , {test:{repository:'...'},expected:_error.validation,status:400}
      , {test:{
              id:"localhost"
            , host:"http://localhost"
            , port:8080
            , dbuser:'boo'
            , dbpass:'boo.'
            , prefix:'p_'
        },expected:_success.ok,status:202}
    ]
    .forEach(function(element){
        it('POST /repositories',function(done){
            request(app)
                .post('/repositories')
                .send(element.test)
                .expect('Content-Type',/json/)
                .expect(element.status)
                .end(function(err,res){
                    res.statusCode.should.be.eql(element.status);
                    res.should.be.json;
                    res.body.should.have.property('ok');
                    res.body.should.eql(element.expected);
                    done();
                });
        });
    });

    it('DELETE /repositories',function(done){
        request(app)
            .delete('/repositories')
            .expect('Content-Type',/json/)
            .expect(200)
            .end(function(err,res){
                res.statusCode.should.be.eql(200);
                res.body.should.have.property('ok');
                res.body.should.eql(_success.ok);
                done();
            });
    });

    [
        {test:'',expected:_error.validation,status:400}
      , {test:{},expected:_error.validation,status:400}
      , {test:{id:1},expected:_error.validation,status:400}
      , {test:{repository:''},expected:_error.validation,status:400}
      , {test:{repository:'1'},expected:_error.validation,status:400}
      , {test:{repository:'/'},expected:_error.validation,status:400}
      , {test:{repository:'...'},expected:_error.validation,status:400}
      , {test:{
              host:"http://localhost"
            , port:8080
            , dbuser:'boo'
            , dbpass:'boo.'
        },expected:_error.network,status:404}
      , {test:{
              host:"http://localhost"
            , port:5984
            , dbuser:'boo'
            , dbpass:'boo.'
        },expected:_error.auth,status:403}
      , {test:{
              host:"http://localhost"
            , port:5984
            , dbuser:'jacobian'
            , dbpass:'asdf'
        },expected:_success.ok,status:200}
    ]
    .forEach(function(element){
        it('POST /repositories/_check',function(done){
            request(app)
                .post('/repositories/_check')
                .send(element.test)
                .expect('Content-Type',/json/)
                .expect(element.status)
                .end(function(err,res){
                    res.statusCode.should.be.eql(element.status);
                    res.body.should.have.property('ok');
                    res.body.should.eql(element.expected);
                    done();
                });
        });
    });
});

