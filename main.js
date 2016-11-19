var Bot = require('slackbots');
var token = process.env.SLACK_TOKEN;

if (!token) {
  throw new Error('No slack token found. Set slack token with in env with export SLACK_TOKEN=TOKEN');
}

var bot = new Bot({
  token: token,
  name: 'Table Bot'
});

var tableMatcher = [
  /┻━┻ ︵ ╯\(.*╯\)/,
  /\(╯.*\)╯︵ ┻━┻/,
  /\(*.\) ~ ︵ ┻━┻/
];

var config = {
  message: '┬─┬ ノ( ^_^ノ)    Please respect tables!' ,
  icon_emoji: ':hello_robot:'
};

function hasTableBeenThrown(text) {
  return tableMatcher.reduce(function(memo, matcher) {
    return memo ? memo : matcher.test(text);
  }, false);
}

bot.on('start', function() {
  bot.getChannels()
    .then(function(data) {
      bot.channelsById = data.channels.reduce(function(memo, channel) {
        memo[channel.id] = channel.name;
        return memo;
      }, {});
    })
    .fail(function(err) {
      console.log('error: ', err);
    });

    // loading timeout lets table bot ignore already thrown tables
    bot.isLoading = true;

    setTimeout(function() {
      console.log('Table bot is ready to help you respect tables.');
      bot.isLoading = false;
    }, 2000);
});

bot.on('message', function(msg) {

  if (msg && msg.text && !bot.isLoading) {
    if (hasTableBeenThrown(msg.text)) {
      var channelName = bot.channelsById[msg.channel];
      var params = {
        icon_emoji: config.icon_emoji
      };

      bot.postMessageToChannel(channelName, config.message, params)
        .fail(function(err) {
          console.log('error:', err);
        });
    }
  }
});

