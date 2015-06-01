'use strict';

var should=require('should')
  , base='../../../../../core/functions'
  , auth=require(base+'/monitor/db/auth')
  , app=require('../../../../../server/monitor')
  , config=require('../../../../../config/tests')
  , User=require('../../../../../server/master/models/user')
  , server=config.monitor

describe('testing monitor authentification',function(){
    var cookie=''
      , user='test@localhost'
      , apikey=''

    before(function(done){
        request(app)
            .get('/home')
            .end(function(err,res){
                var $=cheerio.load(res.text)
                  , csrf=$('input[name=_csrf]').val()

                request(app)
                    .post('/signin')
                    .set('cookie',res.headers['set-cookie'])
                    .send({
                        _csrf:csrf
                      , email:config.monitor.email
                      , password:config.monitor.password
                    })
                    .expect(200)
                    .end(function(err,res){
                        cookie=res.headers['set-cookie'];

                        request(app)
                            .post('/resources/clients')
                            .set('cookie',cookie[1])
                            .send({
                                id:'test'
                            })
                            .end(function(err,res){
                                apikey=res.key;
                                done();
                            });
                    });
            });
    });

    it('monitor authentification success',function(done){
        auth({
            db:{
                host:server.url+':'+server.port
              , user:user
              , pass:apikey
            }
        })
        .done(function(args){
            args.should.have.property('auth');
            args.auth.should.have.property('cookie')
                .with.match(/^AuthSession=.*$/);
            done();
        });
    });

    it('monitor authentification error',function(done){
        auth({
            db:{
                host:server.url+':'+server.port
              , user:user
              , pass:apikey+'0'
            }
        })
        .fail(function(error){
            error.should.have.property('error')
                 .with.equal('unauthorized');
            done();
        });
    });
});

