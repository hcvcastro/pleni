'use strict';

module.exports={
    env:process.env.ENV||'test'
  , db:{
        host:'http://localhost'
      , port:5984
      , user:'pleni'
      , pass:'~~@[@ł€¶→}][þß~łĸ«»””n[þø||@#~½@~~~'
      , prefix:'test_'
    }
  , cookie:{
        secret:'master'
      , maxAge:3*60*60*1000
      , name:'pleni.master.sid'
    }
  , redis:{
        host:'localhost'
      , port:6379
      , prefix:'test:'
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
  , url:'http://localhost'
  , email:'cijkb.j@gmail.com'
  , master:{
        host:process.env.OPENSHIFT_NODEJS_IP||'127.0.0.1'
      , port:process.env.OPENSHIFT_NODEJS_PORT||process.env.PORT||3000
      , admin:true
      , email:'admin@localhost'
      , password:'asdf'
    }
  , user:{
        email:'cijkb.j@gmail.com'
      , password:'asdf'
    }
  , couchdb:{
        name:'db_test'
    }
  , mongo:{
        url:'mongodb://localhost/test'
    }
  , recaptcha:{
        public:'6LcKSQYTAAAAAOuUrljCf8ReCzohwRr9kdHrbouu'
      , private:'6LcKSQYTAAAAAKmZZetWs5LQLIQey0mLNT5J09EQ'
    }

  , notifiers:[{
        script:'server/notifier.io'
      , host:'http://localhost'
      , port:3002
    },{
        script:'server/master'
      , host:'http://localhost'
      , port:3000
    }]
  , planners:[{
        script:'server/planner'
      , host:'http://localhost'
      , port:3001
    },{
        script:'server/planner.io'
      , host:'http://localhost'
      , port:3001
    },{
        script:'server/planner.ion'
      , host:'http://localhost'
      , port:3001
    }]
};

