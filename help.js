export default function help () {
  controller.hears(["help"],['direct_message','direct_mention','mention'],function(bot,message) {
      bot.reply(message,"I'm a simple bot created by Tucker for the purposes of testing bot integrations in the klinefamily+ channel. Right now all I can really do is remember your name if you tell it to me (until my server restarts that is :no_mouth:!)");
  });

  controller.hears([".*"],['direct_message','direct_mention','mention'],function(bot,message) {
      bot.reply(message,"try @klinebot help for help");
  });
}
