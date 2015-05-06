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
  , redis:{
        host:'localhost'
      , port:6379
      , prefix:'sites:'
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
  , email:'cijkb.j@gmail.com'
  , url:'http://galao.local'
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

