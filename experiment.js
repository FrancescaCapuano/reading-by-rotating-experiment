// Initialize JsPsych

var jsPsych = initJsPsych({});




// Consent Form

const check_consent = function(elem) {
  if (document.getElementById('consent_checkbox').checked) {
    return true;}
  else {
    alert("Vielen Dank für Ihr Interesse an unserer Studie. Um an der Studie teilzunehmen, brauchen wir Ihr Einverständnis. Lesen Sie bitte die Teilnahmeinformation und markieren Sie die Box.");
    return false;
  }
  return false;
};
  
const consent = {
  type:jsPsychExternalHtml,
  url: "consent_deutsch_prolific.html",
  cont_btn: "start",
  check_fn: check_consent,
  force_refresh: true
};



// Sociodemographic variables

var age = {
  type: jsPsychSurveyText,
  questions: [{prompt: "Wie alt sind Sie?", rows: 1, columns: 2, required: 'true'}],
  button_label: "Weiter"
};

var gender = {
  type: jsPsychSurveyMultiChoice,
  questions: [{prompt: "Mit welchem Geschlecht identifizieren Sie sich?", options: ["weiblich", "männlich", "divers"], required: 'true'}],
  button_label: "Weiter"
};

var language = {
  type: jsPsychSurveyText,
  questions: [{prompt: "Was ist Ihre Muttersprache?", rows: 1, columns: 20, required: 'true'}],
  button_label: "Weiter"
};



// Welcome and Instructions

var general_instructions = {
  type: jsPsychInstructions,
  pages: [
  '<p>Willkommen bei unserer Studie!</p><p><b>BITTE LESEN SIE DIE FOLGENDE INSTRUKTION SORGFÄLTIG DURCH!</b></p> <p><b>INSTRUKTION</b>: In dieser Studie werden Sie immer einen Drehknopf sehen, wie unten abgebildet. Unter dem Drehknopf erscheinen Sätze, die in Satzteile unterteilt sind. Ihre Aufgabe ist es, die Sätze in Ihrem eigenen Tempo zu lesen. Klicken Sie auf die Innenseite des Drehknopfes, um zum nächsten Satzteil zu gelangen. Achten Sie beim Lesen darauf, ob die Satzteile das Wort "öffnet" oder "schließt" enthalten. Wenn dies der Fall ist, drehen Sie den Knopf, indem Sie ihn an dem roten Hebel oben ziehen, anstatt drauf zu klicken. In welche Richtung Sie den Knopf drehen müssen, hängt von den Anweisungen ab. Manchmal werden auch Fragen zu den gelesenen Sätzen gestellt, die Sie gelesen haben. Das Experiment ist in 8 Blöcke aufgeteilt.<p>Klicken Sie auf Weiter, um mit den Anweisungen fortzufahren.</p><img src=assets/images/drehknopf.png width = "180"></img>',
  '<p>Wir möchten Sie darum bitten, die Aufgabe so gewissenhaft wie möglich zu lösen.</p> <p>Für unsere Studie können wir keine Daten auswerten, die nur aus zufälligen Antworten bestehen.</p><p>Vielen Dank für Ihre Mitarbeit!</p><p>Klicken Sie nur dann "Weiter", wenn Sie bereit sind zu beginnen.</p><p style="color:red">Wenn Sie sich unsicher bezüglich der Instruktion sind, gehen Sie auf die vorherige Seite zurück.</p>'
  ],
  button_label_next: 'Weiter',
  button_label_previous: 'Zurück',
  show_clickable_nav: true
};

var enter_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: true,
  message: "<p>Das Experiment wechselt in den Vollbildmodus, wenn Sie auf Weiter klicken.</p>",
  button_label: "Weiter"
};



// Shuffle items

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
};

shuffle(items);




// Shuffle instructions

var offnen_clock = '<p style="font-size:30px;font-weight:bold;color:red">ACHTUNG! DIE ANWEISUNGEN ÄNDERN SICH BEI JEDEM BLOCK</p><p style="font-size:30px;font-weight:bold;">BLOCKANWEISUNGEN</p><p>Wenn das Wort "öffnet" erscheint, drehen Sie den Knopf wie unten gezeigt.</p><img src="assets/images/clock.gif"><p>Wenn das Wort "schließt" erscheint, drehen Sie den Knopf wie unten gezeigt.</p><img src="assets/images/counter.gif"><p>Drücken Sie eine beliebige Taste, um fortzufahren.</p>'

var offnen_counter = '<p style="font-size:30px;font-weight:bold;color:red">ACHTUNG! DIE ANWEISUNGEN ÄNDERN SICH BEI JEDEM BLOCK</p><p style="font-size:30px;font-weight:bold;">BLOCKANWEISUNGEN</p><p>Wenn das Wort "schließt" erscheint, drehen Sie den Knopf wie unten gezeigt.</p><img src="assets/images/clock.gif"><p>Wenn das Wort "öffnet" erscheint, drehen Sie den Knopf wie unten gezeigt.</p><img src="assets/images/counter.gif"><p>Drücken Sie eine beliebige Taste, um fortzufahren.</p>'

var offnen_clocks = Array(4).fill(offnen_clock);
var offnen_counters = Array(4).fill(offnen_counter);
var instructions = offnen_clocks.concat(offnen_counters);

shuffle(instructions);



// Define 8 blocks of equal length with random instructions

var blocks = [];

var eightPartIndex = Math.ceil(items.length / 8);

for (let i = 0; i <= 6; i++) {

  var items_block = items.splice(-eightPartIndex);

  for (var item of items_block) {
    item.instruction = instructions[i];

    // Define rotation_direction based on assiged instructions
    if (item.instruction == offnen_clock) {
      item.rotation_direction =  item.verb == "öffnen" ? "clockwise" : "counterclockwise";
    } else {
      item.rotation_direction = item.verb == "schließen" ? "clockwise" : "counterclockwise";
    }
  };

  blocks.push(items_block)
};
// the last one has to be entered separately
var items_block = items;
for (var item of items_block) {
  item.instruction = instructions[7];

  // Define rotation_direction based on assiged instructions
  if (item.instruction == offnen_clock) {
    item.rotation_direction =  item.verb == "öffnen" ? "clockwise" : "counterclockwise";
  } else {
    item.rotation_direction = item.verb == "schließen" ? "clockwise" : "counterclockwise";
  }
};
blocks.push(items_block);




////////////////////////////////////////////////////////////////////////////////
////////////////////////////// SEGMENTS ////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function segment(my_segment) {

  return {
    timeline: [
    {
      type: jsPsychKnobStaticResponse,
      canvas_size: [1280*.9, 960*.9],
      canvas_border: '0px solid black',
      response_border_x: 100,
      text: jsPsych.timelineVariable(my_segment),
      data: {segment: jsPsych.timelineVariable(my_segment),
            verb: jsPsych.timelineVariable('verb'),
            object: jsPsych.timelineVariable('object'),
            frage: jsPsych.timelineVariable('frage'),
            entscheidung: jsPsych.timelineVariable('entscheidung'),
            filler: jsPsych.timelineVariable('filler'),
            item: jsPsych.timelineVariable('item')}
    }],
  conditional_function: function() {if (jsPsych.timelineVariable(my_segment)==="") {return false}}};
};

function critical_segment(my_segment) {

  return {
    timeline: [
    {
      type: jsPsychKnobDragResponse,
      canvas_size: [1280*.9, 960*.9],
      canvas_border: '0px solid black',
      response_border_x: 100,
      text: jsPsych.timelineVariable(my_segment),
      rotation_direction: jsPsych.timelineVariable('rotation_direction'),
      data: {segment: jsPsych.timelineVariable(my_segment),
            verb: jsPsych.timelineVariable('verb'),
            object: jsPsych.timelineVariable('object'),
            frage: jsPsych.timelineVariable('frage'),
            entscheidung: jsPsych.timelineVariable('entscheidung'),
            filler: jsPsych.timelineVariable('filler'),
            item: jsPsych.timelineVariable('item'),
            rotation_direction: jsPsych.timelineVariable('rotation_direction')}
    }
  ],
  conditional_function: function() {if (jsPsych.timelineVariable(my_segment)==="") {return false};}};
};

// Sentence
var segment1 = segment('segment1');
var segment2 = segment('segment2');
var segment3 = segment('segment3');
var segment4 = segment('segment4');
var segment5 = segment('segment5');
var segment6 = segment('segment6');
var subj = segment('subj');
var praedNP = critical_segment('praedNP');


// Sentence _1
var segment1_1 = segment('segment1_1');
var segment2_1 = segment('segment2_1');
var segment3_1 = segment('segment3_1');
var segment4_1 = segment('segment4_1');
var segment5_1 = segment('segment5_1');
var segment6_1 = segment('segment6_1');


// Sentence _2
var segment1_2 = segment('segment1_2');
var segment2_2 = segment('segment2_2');
var segment3_2 = segment('segment3_2');
var segment4_2 = segment('segment4_2');
var segment5_2 = segment('segment5_2');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




/////////////////////////////////// COMPREHENSION QUESTION //////////////////////////////////////////////

// score comprehension question correctness
var correctness_comprehension = function(data) {
  data.question = true;
  data.correctness = false;
  if (data.response == 0 && jsPsych.timelineVariable('entscheidung') == "Ja") {data.correctness = true;};
  if (data.response == 1 && jsPsych.timelineVariable('entscheidung') == "Nein") {data.correctness = true;};
};

  // Comprehension Question
  var comprehension_question = {
    timeline: [
    {
      type: jsPsychHtmlButtonResponse,
      stimulus: jsPsych.timelineVariable('frage'),
      margin_horizontal: "50px",
      margin_vertical: "50px",
      choices: ["Ja", "Nein"],
      on_finish: correctness_comprehension
    }
    ],
    conditional_function: function() {if (jsPsych.timelineVariable('frage')==="") {return false}}};

var feedback_comprehension = {
  timeline: [
  {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function(){
    var last_trial_correct = jsPsych.data.get().last(1).values()[0].correctness;
    if(last_trial_correct != true)
      {return '<div style="font-size: 30px; font-family: Arial;color:red;">Falsch!</div>'} 
    else
      {return '<div style="font-size: 30px; font-family: Arial;color:green;">Richtig!</div>'}},
    trial_duration: 1000  
  }
  ],
  conditional_function: function() {
        var last_trial_question = jsPsych.data.get().last(1).values()[0].question;
        if (last_trial_question != true) {return false}
      }
  };           

//////////////////////////////////////////////////////////////////////////////////////////////////////////




// Next Trial

var next_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<p>Drücken Sie eine beliebige Taste, um fortzufahren.</p>"
};



// Timeline of one trial

var trial_timeline = [segment1, segment2, segment3, segment4, segment5, segment6, 
              subj, praedNP, segment1_1, segment2_1, segment3_1, segment4_1, 
              segment5_1, segment6_1, segment1_2, segment2_2, segment3_2, segment4_2, 
              segment5_2, comprehension_question, feedback_comprehension, next_trial];



// Next Block

const next_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "<p>Sie können jetzt eine Pause machen. Drücken Sie eine beliebige Taste, um mit dem nächsten Block fortzufahren.</p>"
};



// Initialize Experiment Timeline
var timeline = [consent, age, gender, language, general_instructions, enter_fullscreen];



// Create timelines for each block

var blocks_timeline = []

for (let i = 0; i <= 7; i++) {

  // Block Instruction
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[i]
  });

  var block_timeline = {
    timeline: trial_timeline,
    timeline_variables: blocks[i],
    randomize_order: true
  };

  timeline.push(block_timeline);
  timeline.push(next_block)

};



// End of Trials

var end_of_trials = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p>Vielen Dank für Ihre Teilnahme!</p> <p>Es gibt noch ein Paar Fragen zu beantworten, dann erhalten Sie Ihren Abschlusslink zu Prolific.</p><p>Bitte lesen Sie die Frage sorgfältig durch.</p><p>Klicken Sie auf eine beliebige Taste, um fortzufahren.</p>'
};



// Final Surveys (How do you open a bottle?)

var hand_on_lid_question = {
  type: jsPsychHtmlButtonResponse,
  stimulus: '<p style="font-size:18px;">Wie öffnen Sie normalerweise eine Flasche?</p><p style="font-size:18px;">Mit der linken Hand oben (wie auf dem linken Bild)?</p><p style="font-size:18px; ">Oder mit der rechten Hand oben (wie auf dem rechten Bild)?</p>',
  choices: ['<img src=assets/images/left_hand_on_lid.jpg width = "300"></img>', '<img src=assets/images/right_hand_on_lid.jpg width = "300"></img>'], 
  prompt: ""
};



// Final Surveys (Did you use a mouse or a trackpad?)

var mouse_trackpad_question = {
    type: jsPsychSurveyMultiChoice,
    questions: [
        {
            prompt: 'Haben Sie ein Maus oder ein Touchpad benutzt?',
            name: 'MouseTrackpad',
            options: ['Maus', 'Touchpad'],
            required: true,
            horizontal: false,
        },
    ],
    button_label: 'Weiter'
};



// Generate a random subject ID with 15 characters

var subject_id = jsPsych.randomization.randomID(15);
jsPsych.data.addProperties({
  subject: subject_id,
});



// Save Data
function saveData(name, data){
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'write_data.php'); 
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({filename: name, filedata: data}));
};

var save_data_block = {
  type: jsPsychCallFunction,
  func: function(){saveData("data/Subject_"+ subject_id, jsPsych.data.get().csv());},
  timing_post_trial: 200
}; 



// End of Experiment

var end_of_experiment = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<p>Vielen Dank für Ihre Teilnahme!</p> <p>Klicken Sie <a href="https://app.prolific.com/submissions/complete?cc=F9A46341">hier</a>, um zu Prolific zurückzukehren und die Studie abzuschließen.</p>',
  response_ends_trial: false
};



timeline = timeline.concat([end_of_trials, hand_on_lid_question, mouse_trackpad_question, save_data_block, end_of_experiment]);



// Start Experiment

jsPsych.run(timeline);
