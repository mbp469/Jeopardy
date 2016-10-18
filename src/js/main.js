(function() {
    "use strict";
    $(document).ready(function() {

        var allGames = [];


/* ===================Constructors and Prototypes======================== */

function Game() {

    this.active = true;
    this.timeStarted = new Date();
    this.tallies = {
        right: 0,
        wrong: 0,
        total: 0
    };
    allGames.push(this);
    this.init();
    storage.set();

}
Game.prototype.init = function(selectedGame) {
  $('#question-div').empty();
  $('#result-div').empty();
  $('#score-board-section').empty();
  $('#choose-game').empty();
  console.log('init');
  this.eventHandlers();
  var context = {games: allGames};
  appendTemplate('select-game','choose-game',context);
  console.log(allGames);
};

Game.prototype.tallyScores = function(result, points, answer) {
  var feedbackContext = {
    "answer":answer,
    "points":points
  };
  $('#score-board-section').empty();

  if(result === 'right'){
    this.tallies.right++;
    this.tallies.total += points;

    appendTemplate('answer-right','result-div',feedbackContext);
  } else {
    this.tallies.wrong++;
    this.tallies.total -= points;
    appendTemplate('answer-wrong','result-div',feedbackContext);
  }
  var context = this.tallies;
  appendTemplate('score-board', 'score-board-section',context);
};

Game.prototype.eventHandlers = function() {
  //call generateQuestion
  var _this = this;
  //dump old handlers.
  $('#submit').off('click');
  $('#next-question').off('click');

  $('#next-question').on('click', function(event){
    _this.generateQuestion();
  });


  //exit the game
  $('#exit').on('click', function() {
      console.log('in exit');
      _this.active = false;
      storage.set();
      var newGame = new Game();
      $('#submitted-answer').val('');
  });

  //clear all the games
  $('#clear').on('click', function() {
    $('#submitted-answer').val('');
    allGames = [];
    var newGame = new Game();
  });

  //load a saved games
  $('#choose-game').on('change', function(event) {
    console.log('choose different game');
      var selectedGameIndex = $('#choose-game option:selected').data('id');
      var games = storage.get();
      var selectedGame = new Game();
      selectedGame.active = true;
      selectedGame.timeStarted = games[selectedGameIndex].timeStarted;
      selectedGame.tallies = games[selectedGameIndex].tallies;
      console.log('selectedGame');
      console.log(selectedGame);
  });
};



Game.prototype.generateQuestion = function() {
  var _this = this;
  /* when next-question button is clicked, do an API call
    to return a random question as a json */
    // checkLocalStorage();
      var settings = {
          "async": true,
          "method": "GET",
          "crossDomain": true,
          "dataType": "json",
          "url": "http://jservice.io/api/random"
      };
      $.ajax(settings).done(function(response) {
          var question = new Question(response[0]);
          var points = question.context.value;
          var answer = question.context.answer;
          //regex courtesy of marliana :)
          answer = answer.replace(/<.*?\>|\(|\)|[\][...]|"|'|\\/gi, "");
          console.log(answer);
          $('#question-div').empty();
          $('#result-div').empty();
          $('#submitted-answer').val('');
          //append question
          appendTemplate('append-question', 'question-div', question.context);
          //wait for response

          $('#submit').on('click', function(event) {
              event.preventDefault();

              var submittedAnswer = $('#submitted-answer').val();
              if (answer.toLowerCase() === submittedAnswer.toLowerCase()) {
                  _this.tallyScores('right', points, answer);
                  //appendTemplate
              } else {
                  _this.tallyScores('wrong', points, answer);
                  //appendTemplate
              }
              storage.set();
              $('#submit').off('click');

          });
          //test response
          //append feedback
          //update tallies
      });
};

function Question(dataObject) {
    //grab stuff from the json file to make an object
    this.context = {
        "answer": dataObject.answer,
        "question": dataObject.question,
        "value": dataObject.value,
        "category": dataObject.category.title
    };
}
/* ===================Local Storage======================== */

var storage = {
  set: function() {
      localStorage.setItem('games', JSON.stringify(allGames));
  },
  get: function() {
    var games = localStorage.games === undefined ?
        false :
        localStorage.games;
    return JSON.parse(games);
  },
  clear: function() {
    localStorage.removeItem('games');
  }
};


function checkLocalStorage() {
  /* Local Storage Check */
  if (storage.get()) {
      var games = storage.get();
      for (var index = 0; index < games.length; index++) {
        if(games[index].active === true){
          var newGame = new Game();
          newGame.active = games[index].active;
          newGame.timeStarted = games[index].timeStarted;
          newGame.tallies = games[index].tallies;
          allGames[index] = newGame;
          }
          storage.set();
      }
  }
}


function appendTemplate(script, target, context){
  context = context || {};
  var source = $('#' + script).html();
  var template = Handlebars.compile(source);
  var html = template(context);
  // $('#' + target).empty();
  $(html).appendTo('#' + target);
}
var game = new Game();

    }); //end of $(document).ready function

})(); //end of anonymous function
