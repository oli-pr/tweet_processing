equire('dotenv-safe').config();
var streamName = process.env.TWEET_STREAM_NAME;
var Twitter = require('twitter');
var AWS = require('aws-sdk');
var kinesis = new AWS.Kinesis({region : 'us-east-1'});
var myKey = 'tweet';

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_SECRET,
  access_token_key: process.env.TWITTER_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/
client.stream('statuses/filter', {track: 'twitter'}, sendToKinesis);

function sendToKinesis(stream) {
  console.log("In sendToKinesis");
  var recordParams = {};
  var partitionKey = 'partition';

  stream.on('data', function(data) {
    recordParams = {
      Data: JSON.stringify(data),
      PartitionKey: partitionKey,
      StreamName: streamName
    };
    kinesis.putRecord(recordParams, function(err, data) {
      if(err) {
        console.log(err);
      }
      else {
        console.log("Streamed");
      }
    });
  });
}


