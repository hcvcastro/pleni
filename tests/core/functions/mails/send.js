'use strict';

var should=require('should')
  , base='../../../../core/functions'
  , mail=require(base+'/mails/send')
  , config=require('../../../../config/tests')

describe('testing email sending',function(){
    it('hello world mail',function(done){
        var packet={
            smtp:config.mailgun
          , mail:{
                from:config.email
              , to:'cijkb.j@gmail.com'
              , subject:'test'
              , text:'this is a testo'
              , html:'<h1>this is a html testo</h1>'
            }
        };

        mail(packet)
        .done(function(args){
            args.should.have.property('mail');
            args.mail.should.have.property('result')
                .and.be.eql('250 Great success');
            done();
        });
    });
});

