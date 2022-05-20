// question handler
import { clear } from './utils.js';

const
  qNum = document.getElementById('qnum'),
  question = document.getElementById('question'),
  answers = document.getElementById('answers'),
  answeredClass = 'answered';

let currentQuestion;

// answer event handlers
answers.addEventListener('click', questionAnswered);
window.addEventListener('keydown', questionAnswered);


// show question
export function show( q ) {

  currentQuestion = q;
  currentQuestion.answered = null;

  clear(question);
  clear(answers);
  answers.classList.remove( answeredClass );

  qNum.textContent = q.num;
  question.innerHTML = q.text;
  currentQuestion.answerNode = [];

  q.answer.forEach((ans, idx) => {
    const button = document.createElement('button');
    button.value = idx;
    button.innerHTML = `<span>${ idx+1 }:</span> ${ ans }`;
    currentQuestion.answerNode[idx] = answers.appendChild(button);
  });

}


// show correct answer
export function correctAnswer( correct ) {

  answers.classList.add( answeredClass );

  if (currentQuestion.answered !== null) {
    currentQuestion.answerNode[ currentQuestion.answered ].classList.remove( answeredClass );
  }

  // highlight correct answer
  currentQuestion.answerNode[ correct ].classList.add('right');

  // highlight button if wrong
  if (currentQuestion.answered !== null && correct !== currentQuestion.answered) {
    currentQuestion.answerNode[ currentQuestion.answered ].classList.add('wrong');
  }

}


// user answers a question
function questionAnswered( e ) {

  // already answered?
  if ( !currentQuestion || currentQuestion.answered !== null ) return;

  let ans = null;
  if (e.type == 'click') {

    // button click
    ans = e.target && e.target.nodeName === 'BUTTON' ? parseInt(e.target.value, 10) : null;
    if (ans > currentQuestion.answer.length) ans = null;

  }
  else {

    // keypress
    ans = e.key >= '1' && e.key <= String(currentQuestion.answer.length) ? parseInt(e.key, 10) - 1 : null;

  }

  if (ans === null) return;

  // highlight answer
  currentQuestion.answered = ans;
  answers.classList.add( answeredClass );
  currentQuestion.answerNode[ans].classList.add( answeredClass );

  // raise custom event
  document.dispatchEvent( new CustomEvent('answered', { detail: ans }) );

}
