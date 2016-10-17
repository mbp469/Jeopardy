(function() {
  "use strict";
  $(document).ready(function() {

    var allGames = [];

/* ===================Constructors and Prototypes======================== */

    function Game(context){
      console.log('Game constructor');
      //store this instance in local storage
      //initialize tallies
      this.tallies = {
        right: 0,
        wrong: 0,
        total: 0
      };
    }

    function Question(dataObject){
      //grab stuff from the json file to make an object
      this.context = {
        "answer": dataObject.answer,
        "question": dataObject.question,
        "value": dataObject.value,
        "category": dataObject.category.title
      };
    }

/* ===================Event Listeners======================== */

/* when next-question button is clicked, do an API call
  to return a random question as a json */
$('#next-question').on('click', function(event){
  var settings = {
    "async": true,
    "method": "GET",
    "crossDomain": true,
    "dataType": "json",
    "url": "http://jservice.io/api/random"
  };

  $.ajax(settings).done(function(response){
    var question = new Question(response[0]);
    console.log(question.context.answer);
    //append question
    appendTemplate('append-question','question-div',question.context);
    //wait for response
    $('#submit').on('click', function(event){
      event.preventDefault();
      var submittedAnswer = $('#submitted-answer').val();
      if (question.context.answer.toLowerCase() === submittedAnswer.toLowerCase()){
        //if answer is correct
        console.log('right');
      } else {
        console.log('wrong');
      }
    });
    //test response
    //append feedback
    //update tallies
  });
});

/* ===================Handlebars Template======================== */

function appendTemplate(script, target, context) {
  context = context || {};
  var source = $('#' + script).html();
  var template = Handlebars.compile(source);
  var html = template(context);
  $('#' + target).empty();
  $(html).appendTo('#' + target);
}






















  });//end of $(document).ready function
})();//end of anonymous function
