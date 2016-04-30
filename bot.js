const Botkit = require('botkit')
const os = require('os')
const controller = Botkit.slackbot()
const bot = controller.spawn({
  token: ''
})

bot.startRTM(function(err,bot,payload){
  if (err) {
    throw new Error('Could not connect to Slack')
  }
})

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'whale2',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    })


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

controller.hears(['lets play a game'], ['direct_message','direct_mention','mention'], function(bot,message) {
    zorkStart = function(response, convo) {
      convo.ask('Welcome to ZORK! Are you ready to play?', function(response, convo) {
        console.log("Response@@@@@", response)
        switch (response.text) {
          case 'yes':
            bot.api.reactions.add({
                timestamp: response.ts,
                channel: response.channel,
                name: 'whale2',
            }, function(err, res) {
                if (err) {
                    bot.botkit.log('Failed to add emoji reaction :(', err);
                }
            })
            convo.say("West of House This is an open field west of a white house, with a boarded front door. There is a small mailbox here. A rubber mat saying \'Welcome to Zork!\' lies by the door.")
            break
          case 'no':
            convo.say('okay, go away now.')
            break
        }
        convo.next();
      });
    }

    bot.startConversation(message, zorkStart);
});

controller.hears(["help"],['direct_message','direct_mention','mention'],function(bot,message) {
    bot.reply(message,"I'm a simple bot created by Tucker for the purposes of testing bot integrations in the klinefamily+ channel. Right now all I can really do is remember your name if you tell it to me (until my server restarts that is :no_mouth:!)");
});

controller.hears([".*"],['direct_message','direct_mention','mention'],function(bot,message) {
    bot.reply(message,"try @klinebot help for help");
});
