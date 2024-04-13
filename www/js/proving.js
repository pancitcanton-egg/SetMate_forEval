import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { getDatabase, ref, set, get, child} from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-storage.js';

var config = {
     apiKey: "AIzaSyCeZUvEpuKFgftbgmJqkQtS06D08zg6RXg",
     authDomain: "setmate-db.firebaseapp.com",
     databaseURL: "https://setmate-db-default-rtdb.asia-southeast1.firebasedatabase.app",
     projectId: "setmate-db",
     storageBucket: "setmate-db.appspot.com",
     messagingSenderId: "881886028562",
     appId: "1:881886028562:web:370c16302f11e98d5409cb",
     measurementId: "G-6S8GH3JE25"
};

const app = initializeApp(config);
const database = getDatabase(app);
const storage = getStorage(app);

var problemsRef = ref(database, 'proofTasks');
const claim = document.querySelector(".claim");
var problem;

document.addEventListener("DOMContentLoaded", function () {
  const problemContainer = document.querySelector(".problem-container");
  const firstPart = document.querySelector(".first-part");
  const backBtn = document.querySelector(".backBtn");
  const proving = document.querySelector(".proving");
  const popup = document.querySelector(".popup");
  const yesReveal = document.querySelector(".yes");
  const cancelReveal = document.querySelector(".cancel");
  const okay = document.querySelectorAll(".okay");
  const checking = document.querySelectorAll(".checking");
  const bothNull = document.querySelector(".bothNull");
  const proofNull = document.querySelector(".proofNull");
  const justNull = document.querySelector(".justNull");
  const proofMatch = document.querySelector(".proofMatch");
  const justAndNeither = document.querySelector(".justAndNeither");
  const popupsContainer = document.querySelector(".popupsContainer");
  const helpBtn = document.querySelector(".helpBtn");

  const keyboard = document.querySelector(".keyboard-container");
  const proof =document.querySelector(".proof");
  const just =document.querySelector(".just");
  const done =document.querySelector(".done");
  const buttons = document.querySelectorAll(".btn");
  const deleteBtn = document.querySelector(".delete");
  const spaceBtn = document.querySelector(".space");
  const checkAnswer = document.querySelector(".check-answer");
  const showAnswers = document.querySelector(".show-answers");

  let chars = [];
  let area = "";
  let numberOfSteps = "";
  let currentStep = 0;

  const preProblem = localStorage.getItem('problem');
  const way = localStorage.getItem('way');

  if (way=='keyboard') {
    problem = toLatex(preProblem).trim().replace(/\s+/g, '').toUpperCase();
  } else if (way=='camera') {
    problem = preProblem;
  } else{
    console.log('mali logic mo be');
  }

  if (problem) {
    getJustifications(problem, function(justifications,steps,claim) {
      var divided = claim.split('=');
      var first = divided[0];
      numberOfSteps = parseInt(steps);
      problemContainer.innerHTML = `<h1>${claim}</h1>
                                    <p>Note: Use ${justifications} to prove the claim above.</p>`;
    
      firstPart.innerHTML += `<h3>${first}</h3>`
      console.log(numberOfSteps);
    });
  } else {
    window.location.href = 'index.html';
  }

  backBtn.addEventListener("click", function() {
    proving.style.display= "block";
  checkAnswer.style.display= "block";
    window.location.href = 'landing-page.html';
  });

proof.addEventListener("click", function(){
    keyboard.style.display = "block";
    proof.style.border= "1px solid #004d4d"
    just.style.border= "none"
    area = "proof";
})
just.addEventListener("click", function(){
  keyboard.style.display = "block";
  proof.style.border= "none"
  just.style.border= "1px solid #004d4d"
  area = "just";

})
done.addEventListener("click", function(){
  keyboard.style.display = "none";
    proof.style.border= "none"
    just.style.border= "none"
})
helpBtn.addEventListener("click", function(){
  window.location.href = 'help-proving.html';
})

buttons.forEach(btn => {
    btn.addEventListener("click", function (){
      if (area == "proof") {
        proof.value += btn.innerText
        chars = proof.value.split('');
      } else {
        just.value += btn.innerText
        chars = just.value.split('');
      }
        
    })
})
okay.forEach(function(button) {
  button.addEventListener('click', function () {
    checking.forEach(function(element) {
      element.style.visibility = "hidden";
      popupsContainer.style.visibility = "hidden";
    });
  });
});


checkAnswer.addEventListener("click", function(){
  let proofValue = proof.value;
  let justValue = just.value;
  currentStep++;
  getCorrectAnswer(problem,currentStep, function(stepNow, justifOfStep) {
    var submittedProof = proofValue.split(' ').join('');
    var submittedJust = justValue.split(' ').join('');
    
    if ((submittedProof === null || submittedProof.trim() === "") && (submittedJust === null || submittedJust.trim() === "")) {
      bothNull.style.visibility="visible";
      popupsContainer.style.visibility="visible";
      currentStep--;
    } else if (submittedProof === null || submittedProof.trim() === "") {
      proofNull.style.visibility="visible";
      popupsContainer.style.visibility="visible";
      currentStep--;
    } else if (submittedJust === null || submittedJust.trim() === "") {
      justNull.style.visibility="visible";
      popupsContainer.style.visibility="visible";
      currentStep--;
    } else {
      console.log('Both have values');
      console.log(proofValue, justValue);
      console.log(stepNow, justifOfStep);

       if (compareAns(proofValue,stepNow) && compareAns(justValue,justifOfStep)) {
         console.log('Both values match the current step');
         let lessonContent = document.createElement('p');
         let solutionContainer = document.createElement("div");
         solutionContainer.classList.add('solution-container')
         claim.insertBefore(solutionContainer, proving);

         let solution = document.createElement("div");
         solution.classList.add("solution");
         solutionContainer.appendChild(solution);

         let proofSolution = document.createElement("div");
         let justSolution = document.createElement("div");
         let showLesson = document.createElement("button");
         let hideLesson = document.createElement("button");

         let lesson = {};
         let variableName = 'variable_' + currentStep; 

         showLesson.classList.add("show-lesson");
         hideLesson.classList.add("hide-lesson");
         proofSolution.classList.add("proof-solution");
         justSolution.classList.add("just-solution");

         showLesson.id = 'showLesson_' + currentStep;
         hideLesson.id = 'hideLesson_' + currentStep;

         showLesson.innerHTML = '<i class="fa-solid fa-angle-down"></i>';
         hideLesson.innerHTML = '<i class="fa-solid fa-angle-up"></i>';

         solution.appendChild(proofSolution);
         solution.appendChild(justSolution);
         solution.appendChild(showLesson);
         solution.appendChild(hideLesson);

         proofSolution.innerHTML += `<br><h4>=${stepNow}</h4>`;
         justSolution.innerHTML+= `<br><h4>${justifOfStep}</h4>`;

         const showLessonID = document.getElementById('showLesson_' + currentStep);
         const hideLessonID = document.getElementById('hideLesson_' + currentStep);

         lesson[variableName] = justifOfStep

         showLessonID.addEventListener('click', function() {
            // Your event handler code here
            console.log(lesson[variableName]);
            showLessonID.style.display='none';
            hideLessonID.style.display='flex';

            getLesson(lesson[variableName], function(lessonData) {
              solutionContainer.appendChild(lessonContent);
              lessonContent.innerHTML += `${lessonData}`
            })
          });
          hideLessonID.addEventListener('click', function() {
            // Your event handler code here
            console.log(lesson[variableName]);
            hideLessonID.style.display='none';
            showLessonID.style.display='flex';

            lessonContent.innerHTML = '';
            solutionContainer.removeChild(lessonContent);
          });

         proof.value= "";
         just.value = "";
         if (currentStep == numberOfSteps) {
          proving.style.display='none';
          checkAnswer.style.display='none'
         }
       } else if (compareAns(proofValue,stepNow)) {
        currentStep--;
        proofMatch.style.visibility="visible";
        popupsContainer.style.visibility="visible";
       } else if (compareAns(justValue,justifOfStep)) {
        currentStep--;
        justAndNeither.style.visibility="visible";
        popupsContainer.style.visibility="visible";
       } else {
        currentStep--;
        justAndNeither.style.visibility="visible";
        popupsContainer.style.visibility="visible";
       }
    }
  })
})

deleteBtn.addEventListener("click", () =>{
    chars.pop();
    if (area == "proof") {
      proof.value = chars.join('');
    } else {
      just.value = chars.join('');
    }
    
});

spaceBtn.addEventListener("click", () => {
    chars.push(' ');
    if (area == "proof") {
      proof.value = chars.join('');
    } else {
      just.value = chars.join('');
    }
});
showAnswers.addEventListener("click", () => {
  popup.style.visibility="visible";
  popupsContainer.style.visibility="visible";
});

cancelReveal.addEventListener("click", () => {
  popup.style.visibility="hidden";
  popupsContainer.style.visibility="hidden";
});

yesReveal.addEventListener("click", () => {
  proving.style.display= "none";
  checkAnswer.style.display= "none";
  
  for (let n = 0; n < numberOfSteps; n++) {
    getAllAnswer(problem,n+1, function(proofAns, justAns){
      let lessonContent = document.createElement('p');
         let solutionContainer = document.createElement("div");
         solutionContainer.classList.add('solution-container')
         claim.insertBefore(solutionContainer, proving);

         let solution = document.createElement("div");
         solution.classList.add("solution");
         solutionContainer.appendChild(solution);

         let proofSolution = document.createElement("div");
         let justSolution = document.createElement("div");
         let showLesson = document.createElement("button");
         let hideLesson = document.createElement("button");

         let lesson = {};
         let variableName = 'variable_' + n; 

         showLesson.classList.add("show-lesson");
         hideLesson.classList.add("hide-lesson");
         proofSolution.classList.add("proof-solution");
         justSolution.classList.add("just-solution");

         showLesson.id = 'showLesson_' + n;
         hideLesson.id = 'hideLesson_' + n;

         showLesson.innerHTML = '<i class="fa-solid fa-angle-down"></i>';
         hideLesson.innerHTML = '<i class="fa-solid fa-angle-up"></i>';

         solution.appendChild(proofSolution);
         solution.appendChild(justSolution);
         solution.appendChild(showLesson);
         solution.appendChild(hideLesson);

         proofSolution.innerHTML += `<br><h4>=${proofAns}</h4>`;
         justSolution.innerHTML+= `<br><h4>${justAns}</h4>`;

         const showLessonID = document.getElementById('showLesson_' + n);
         const hideLessonID = document.getElementById('hideLesson_' + n);

         lesson[variableName] = justAns

         showLessonID.addEventListener('click', function() {
            // Your event handler code here
            console.log(lesson[variableName]);
            showLessonID.style.display='none';
            hideLessonID.style.display='flex';

            getLesson(lesson[variableName], function(lessonData) {
              solutionContainer.appendChild(lessonContent);
              lessonContent.innerHTML += `${lessonData}`
            })
          });
          hideLessonID.addEventListener('click', function() {
            // Your event handler code here
            console.log(lesson[variableName]);
            hideLessonID.style.display='none';
            showLessonID.style.display='flex';

            lessonContent.innerHTML = '';
            solutionContainer.removeChild(lessonContent);
          });
    })
  }
  popup.style.visibility="hidden";
  popupsContainer.style.visibility="hidden";
});

});

function getJustifications(problemId, callback) {
  console.log(problemId);
  // Reference to a specific problem by its ID
  var specificProblemRef = child(problemsRef, problemId);

  // Fetch the data for the specific problem using get function
  get(child(specificProblemRef, '/')).then((snapshot) => {
    if (snapshot.exists()) {
      // Declare 'justifications' within this block
      var justifications = snapshot.val().justifications;
      var steps = snapshot.val().steps;
      var claim = snapshot.val().claim;

      // Invoke the callback function with the justifications
      callback(justifications,steps,claim);
    } else {
      console.log('Problem not found');
    }
  }).catch((error) => {
    console.error('Error fetching problem data:', error);
  });
}

function getCorrectAnswer(problemId,stepNumber ,callback ){

  var specificProblemRef = child(problemsRef, problemId)

  get(child(specificProblemRef,'/')).then((snapshot)=>{
    if(snapshot.exists()){
      const justifPropertyName = "step"+stepNumber+"justif";
      const stepReal = "step"+stepNumber;

      var stepNow = snapshot.val()[stepReal];
      var justifOfStep = snapshot.val()[justifPropertyName];

      callback(stepNow, justifOfStep);
    } else{
      console.log('Problem not found');
    }
  }).catch((error) => {
    console.error('Error fetching problem data:', error);
  });

}

function getAllAnswer(problemId,stepNumber, callback){
  var specificProblemRef = child(problemsRef, problemId)

  get(child(specificProblemRef,'/')).then((snapshot)=>{
    if(snapshot.exists()){
      const justifPropertyName = "step"+stepNumber+"justif";
      const stepReal = "step"+stepNumber;
      
      var proofAns = snapshot.val()[stepReal];
      var justAns = snapshot.val()[justifPropertyName];

      callback(proofAns,justAns);
    } else{
      console.log('Problem not found');
    }
  }).catch((error) => {
    console.error('Error fetching problem data:', error);
  });
}

function compareAns(str1,str2){
  const trimmed1 = str1.trim().toLowerCase();
  const trimmed2 = str2.trim().toLowerCase();

  return trimmed1 === trimmed2;
}

function toLatex(expression) {
  // Define a mapping of symbols to their LaTeX equivalents
  const mapping = {
      '∪': '\\cup',
      '∩': '\\cap',
      "'": '^\\prime',
      '⊆': '\\subseteq',
      '⊂': '\\subset',
      '∅': '\\emptyset',
      '∈': '\\in',
      '∉': '\\notin',
      '\\': '\\backslash',
      '×': '\\times',
      '-': '-',
      '(': '(',
      ')': ')'
  };

  // Replace symbols with LaTeX equivalents and log the expression
  const latexExpression = expression.replace(/./g, function (char) {
      const replacement = mapping[char] || char;
      return replacement;
  });

  console.log('Final LaTeX Expression:', latexExpression); // Log the final LaTeX expression
  return latexExpression;
}
function getLesson(lessonId ,callback ){

  const lessonRef = ref(database, `lessons/${lessonId}`);

// Retrieve the data
get(lessonRef).then((snapshot) => {
  if (snapshot.exists()) {
    const lessonData = snapshot.val();
    
    callback(lessonData);
  } else {
    console.log("Lesson not found");
  }
}).catch((error) => {
  console.error("Error fetching lesson data:", error);
});

}