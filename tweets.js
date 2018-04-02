require('dotenv-safe').config();
var tweetBucket = process.env.S3_TWEET_BUCKET;
var Twitter = require('twitter');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
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
client.stream('statuses/filter', {track: 'twitter'}, process_tweets);

function process_tweets(stream) {
  stream.on('data', tweet);
  stream.on('error', error);
}

function tweet(message) {
//  console.log(message);
  if(message.hasOwnProperty('extended_entities')) {
//    console.log(message.extended_entities);

    if(message.extended_entities.hasOwnProperty('media')) {
      var media = message.extended_entities.media;
      for(index = 0; index < media.length; ++index) {
        console.log(media[index].media_url);

        var params = {Bucket: tweetBucket, Key: myKey, Body: JSON.stringify(message)};
        s3.putObject(params, s3Callback);
      }
    }
  }

// console.log(message.source);

}

function s3Callback(err, data) {
  if(err) {
    console.log(err)
  } else {
    console.log("Uploaded");
  }
}

function error(problem) {
  console.log(error);
}


