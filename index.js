process.env.DEBUG = 'actions-on-google:*'

const SonarrAPI = require('./lib/api');
const ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;
var fs = require('fs');
var parseJson = require('parse-json');

var dayMap =  {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday"
}

exports.sonarrInfo = (req, res) => {
  var assistant = new ActionsSdkAssistant({request: req, response: res});
  var opts = parseJson(fs.readFileSync('creds.json'));
  var sonarr = new SonarrAPI(opts);

  function mainIntent() {
    console.log('mainIntent');
    let inputPrompt = assistant.buildInputPrompt(true, '<speak>Hello from Sonarr!' +
          'You can say either, <break time="1"/> "upcoming", <break time="1"/> ' +
          'What would you like?</speak>',
          ['I didn\'t hear that', 'If you\'re still there, what would you like to know?']);
    assistant.ask(inputPrompt);
  }

  function rawInput() {
    let raw = assistant.getRawInput().toLowerCase();
    console.log('rawInput: ' + raw);

    if (raw === 'goodbye') {
      assistant.tell('Goodbye!');
    } else {
      switch(raw) {

        case 'upcoming':
          upcoming();
          break;

        default:
          var inputString = 'I\'m sorry, I don\'t know that information';
          var inputPrompt = assistant.buildInputPrompt(true, inputString,
              ['I didn\'t hear that', 'If you\'re still there, what would you like to know?']);
          assistant.ask(inputPrompt);
      }
    }
  }

  function upcoming() {
    var today = new Date();
    var laterDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);

    sonarr.get("calendar", { "start": today.toISOString(), "end": laterDay.toISOString() }).then(function (result) {
        var shows= [];
        console.log(result);
    	result.forEach(function (show) {
        var showData = {
            episode: String(show.episodeNumber),
            season: String(show.seasonNumber),
            title: show.series.title,
            day: dayMap[new Date(show.airDate).getDay()]
        };
        shows.push(showData);
      });
      console.log(shows);
      var inputString = '<speak> Upcoming TV Shows are: '
      shows.forEach(function (episode) {
        var lineString = episode.title + ' season ' + episode.season;
        lineString += ' episode ' + episode.episode + ' on ' + episode.day;
        inputString += lineString + '. ';
      });
      inputString += '</speak>';
      var inputPrompt = assistant.buildInputPrompt(true, inputString,
        ['I didn\'t hear that', 'If you\'re still there, what would you like to know?']);
      assistant.ask(inputPrompt);
    }, function (err) {
        throw new Error("There was a error processing the request: " + err);
    });
  }

  let actionMap = new Map();
  actionMap.set(assistant.StandardIntents.MAIN, mainIntent);
  actionMap.set(assistant.StandardIntents.TEXT, rawInput);
  assistant.handleRequest(actionMap);
};
