'use strict';

var nodemailer=require('nodemailer')
  , smtptransport=require('nodemailer-smtp-transport')
  , Q=require('q')

/*
 * Function for sending emails
 * args input
 *      smtp
 *      mail
 *          from
 *          to -> array
 *          subject
 *          text
 *          html
 *          attachments (*)
 *  args output
 *      mail
 *          result
 */
module.exports=function(args){
    var deferred=Q.defer()
      , transporter=nodemailer.createTransport(smtptransport(args.smtp))
      , packet={
            from:args.mail.from
          , to:args.mail.to
          , subject:args.mail.subject
          , text:args.mail.text
          , html:args.mail.html
        }

    if(args.mail.attachments){
        packet.attachments=args.mail.attachments;
    }

    transporter.sendMail(packet,function(error,info){
        if(!error){
            args.mail.result=info.response;
            deferred.resolve(args);
        }else{
            console.log(error);
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

