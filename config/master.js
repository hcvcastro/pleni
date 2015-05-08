'use strict';

module.exports={
    env:process.env.ENV||'production'
  , cookie:{
        secret:'master'
      , maxAge:3*60*60*1000
      , name:'pleni.master.sid'
    }
  , redis:{
        host:'localhost'
      , port:6379
      , prefix:'master:'
      , options:{
            no_ready_check:true
          , auth_pass:'~~{{~~æßðđł[¶]æßðŋħ]]]}}}}~~'
        }
    }
  , mailgun:{
        service:'Mailgun'
      , auth:{
            user:'postmaster@sandbox26789c87cb524590bf3f4fd3acfd7fff.mailgun.org'
          , pass:'e822a5c96a0f59b0f5fe16a6d72f2fae'
        }
    }
  , email:'Pleni Team <info@hiperborea.com.bo>'
  , master:{
        host:process.env.OPENSHIFT_NODEJS_IP||'127.0.0.1'
      , port:process.env.OPENSHIFT_NODEJS_PORT||process.env.PORT||3000
      , admin:true
      , email:'admin@localhost'
      , password:'asdf'
    }
  , mongo:{
        url:'mongodb://localhost/pleni'
    }
  , recaptcha:{
        public:'6LcKSQYTAAAAAOuUrljCf8ReCzohwRr9kdHrbouu'
      , private:'6LcKSQYTAAAAAKmZZetWs5LQLIQey0mLNT5J09EQ'
    }
};

