import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { getDatabase, ref, set, get, child, push, remove, onValue} from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
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

var appId = 'setmate_34bbff_d4680d';
var appKey = '889fcecb2d467b5c87885247f7e5bddbbf6d936e52a9e1cbf62283144859f1b5';
var apiUrl = 'https://api.mathpix.com/v3/text';

 const app = initializeApp(config); 
 const database = getDatabase(app);
 const storage = getStorage(app);
 var cropper;

 var problemsRef = ref(database, 'proofTasks');
 var inputProblem = document.getElementById('input');
 var problem;
 var way;
 
 const popupsContainer = document.querySelector(".popupsContainer");
 const popup = document.querySelector(".popup");
 const problemNotFound = document.querySelector(".problemNotFound");
 const historyList = document.querySelector(".history-list");

document.addEventListener("DOMContentLoaded", function () {
    const sideBar = document.querySelector(".side-bar");
    const menuBtn = document.querySelector(".menu-btn");
    const closeBtn = document.querySelector(".close");
    const keyboard = document.querySelector(".keyboard-container");
    const done =document.querySelector(".done");
    const continueBtn = document.querySelector(".continue");
    const edit = document.querySelector(".edit");
    const historyBtn = document.querySelector(".historyBtn");
    const history = document.querySelector(".history-tab");
    const closeHistory = document.querySelector(".close-history");
    const helpBtn = document.querySelector(".help-btn");
    const help = document.querySelector(".help-tab");
    const closeHelp = document.querySelector(".close-help");
    const logo =  document.querySelector(".logo");
    const cameraBtn = document.querySelector(".camera-btn");
    const textArea =document.querySelector(".text-area");
    
    const buttons = document.querySelectorAll(".btn");
    const deleteBtn = document.querySelector(".delete");
    const spaceBtn = document.querySelector(".space");

    let chars = [];
    const userUID = localStorage.getItem('userUID');

    fetchHistory(userUID);

continueBtn.addEventListener("click", function () {
  if (problem) { 
    if (inputProblem.value) {
      pushHistory(userUID, inputProblem.value);
      window.location.href = 'proving.html';
    } else {
      console.log('from history');
      window.location.href = 'proving.html';
    }
} else {
    console.log("No problem value available.");
}
});
edit.addEventListener("click", function () {
  problemNotFound.style.visibility="hidden";
  popupsContainer.style.visibility="hidden";
});

historyBtn.addEventListener("click", function () {
  history.style.bottom="0";
});
closeHistory.addEventListener("click", function () {
  history.style.bottom="-1000px";
});

helpBtn.addEventListener("click", function () {
  window.location.href = 'help.html';
});
closeHelp.addEventListener("click", function () {
  help.style.right="-1000px";
});

    // Open side-bar when clicking the menu button
menuBtn.addEventListener("click", function () {
  sideBar.style.left = "0";
  menuBtn.style.display="none";
  getUsernameByUID(userUID)
    .then((userData) => {
          // Use the retrieved user data here
      if (userData) {
        const username = userData.username;
        logo.innerHTML = `<h1>Hi ${username}!</h1>`
      }
    })
  .catch((error) => {
          // Handle errors if needed
  });
});

    // Close side-bar when clicking the close button
    closeBtn.addEventListener("click", function () {
        sideBar.style.left = "-1000px";
        setTimeout(function () {
            menuBtn.style.display = "";
        }, 500);
    });

    textArea.addEventListener("click", function(){
        keyboard.style.bottom = "0"
    })
    done.addEventListener("click", function(){
      keyboard.style.bottom = "-300px";
      problem = toLatex(inputProblem.value).trim().replace(/\s+/g, '').toUpperCase();
      way = 'keyboard';
      console.log(problem);
      
      localStorage.setItem('problem', inputProblem.value);
      localStorage.setItem('way', way);
      getProblemData(problem);
  });

    buttons.forEach(btn => {
        btn.addEventListener("click", function (){
            textArea.value += btn.innerText
            chars = textArea.value.split('');
        })
    });

    deleteBtn.addEventListener("click", () =>{
        chars.pop();
        textArea.value = chars.join('');
    });

    spaceBtn.addEventListener("click", () => {
        chars.push(' ');
        textArea.value = chars.join('');
    });

    cameraBtn.addEventListener("click", () =>{
      takePicture();
    });

    

});

function getProblemData(problemId) {
  // Reference to a specific problem by its ID
  var specificProblemRef = child(problemsRef, problemId);

  // Fetch the data for the specific problem using get function
  get(child(specificProblemRef, '/')).then((snapshot) => {
    if (snapshot.exists()) {
      console.log('Problem Data:', snapshot.val());
      popup.style.visibility="visible";
      popupsContainer.style.visibility="visible";

    } else {
      problemNotFound.style.visibility="visible";
      popupsContainer.style.visibility="visible";
      console.log('Problem not found');
    }
  }).catch((error) => {
    console.error('Error fetching problem data:', error);
  });
}

function getUsernameByUID(userUID) {
  const userRef = ref(database, 'users/' + userUID);

  return get(userRef)
      .then((snapshot) => {
          if (snapshot.exists()) {
              // User data exists, you can access it using snapshot.val()
              const userData = snapshot.val();
              console.log('User Data:', userData);

              return userData; // Return the user data if needed
          } else {
              console.log('User data not found.');
              return null; // Return null or handle accordingly if data doesn't exist
          }
      })
      .catch((error) => {
          console.error('Error fetching user data:', error);
          throw error; // Propagate the error for handling elsewhere if needed
      });
}

function pushHistory(userUID, problem) {
  const userHistoryRef = ref(database, `users/${userUID}/history`);

  // Fetch the existing entries in the user's history
  get(userHistoryRef).then((snapshot) => {
    if (snapshot.exists()) {
      const historyData = snapshot.val();

      // Iterate over existing entries to check for the same value
      Object.entries(historyData).forEach(([key, value]) => {
        if (value === problem) {
          // Problem already exists, remove the previous entry
          remove(child(userHistoryRef, key)).then(() => {
            console.log('Previous entry removed.');
          }).catch((error) => {
            console.error('Error removing previous entry:', error);
          });
        }
      });
    }

    // Add the new entry to the user's history
     push(userHistoryRef, problem).then(() => {
       console.log('New entry added to history.');
     }).catch((error) => {
       console.error('Error adding new entry to history:', error);
     });
  }).catch((error) => {
    console.error('Error fetching user history:', error);
  });
}



function fetchHistory(userUID){
  const userHistoryRef = ref(database, `users/${userUID}/history`);
  
  onValue(userHistoryRef, function(snapshot) {
    if (snapshot.exists()) {
        let historyArray = Object.entries(snapshot.val())
    
        clearHistoryList();
        
        for (let i = 0; i < historyArray.length; i++) {
            let currentItem = historyArray[i]
            let currentItemID = currentItem[0]
            let currentItemValue = currentItem[1]
            
            appendHistoryToList(currentItem);
        }    
    } else {
        historyList.innerHTML = "No problems solved... yet"
    }
  })
}

function clearHistoryList(){
  historyList.innerHTML="";
}
function appendHistoryToList(item) {
  let itemID = item[0];
  let itemValue = item[1];
    
  let newEl = document.createElement("li");
    
  newEl.textContent = itemValue;
newEl.addEventListener("click", function() {
    problem = toLatex(itemValue).trim().replace(/\s+/g, '').toUpperCase();
    way = 'keyboard';
    console.log(problem);
    
    localStorage.setItem('problem', itemValue);
    localStorage.setItem('way', way);
    getProblemData(problem);
})
  historyList.append(newEl);
}

function takePicture() {
  navigator.camera.getPicture(onSuccess, onFail, {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI
  });
}

function onSuccess(imageURI) {
  var imageContainer = document.getElementById('imageContainer'); 
  var image = document.getElementById('image');
  image.src = '';

  window.resolveLocalFileSystemURL(imageURI, function (fileEntry) {
    image.src = fileEntry.toInternalURL();
    image.style.display = 'block';
    imageContainer.style.display = 'flex';
    
    // Initialize Cropper.js on the image
      cropper = new Cropper(image, {
      aspectRatio: NaN, // You can change this according to your needs
    });
    var doneButton = document.createElement('button');
    doneButton.textContent = 'Done';
    doneButton.id = 'doneButton'; // Assign the button id
    doneButton.classList.add('cropper-button'); // Add the class for styling
    imageContainer.appendChild(doneButton);
  
    doneButton.addEventListener('click', function () {
      // Check if the cropper instance is available
      if (cropper) {
          // Generate a canvas of the cropped image
          var croppedCanvas = cropper.getCroppedCanvas();
          
          // Destroy the cropper instance
          cropper.destroy();
  
          // Optionally, hide or remove the original image and container
          imageContainer.style.display = 'none'; // Hide the entire container, including the image
          image.remove(); // This removes the image element completely if not needed
          
          // Remove the 'Done' button itself
          doneButton.remove();
          sendToMathpix(croppedCanvas.toDataURL());
      } else {
          console.log('Cropper instance is not initialized.');
      }
  });
  
  }, onFail);
}
function onFail(message) {
  alert('Failed because: ' + message);
}

function sendToMathpix(imageData) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", apiUrl, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("app_id", appId);
  xhr.setRequestHeader("app_key", appKey);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        var textResult = response.latex_styled;
        problem = textResult.trim().replace(/\s+/g, '').toUpperCase();
        way = 'camera';
        renderMathJax(textResult);
        
        localStorage.setItem('problem', problem);
        localStorage.setItem('way', way);
        getProblemData(problem);
        
      } else {
        console.error("Error: Mathpix API request failed with status " + xhr.status);
        // Handle error (e.g., display error message)
        // Example: displayErrorMessage("Mathpix API request failed. Please try again.");
      }
    }
  };

  xhr.onerror = function () {
    console.error("Error: Mathpix API request failed.");
    // Handle error (e.g., display error message)
    // Example: displayErrorMessage("Mathpix API request failed. Please try again.");
  };

  var data = JSON.stringify({
    src: imageData
  });

  xhr.send(data);
}

function renderMathJax(mathExpression) {
  // Create a new div element to render the math equation
  var mathContainer = document.createElement("div");

  // Set the innerHTML of the container to the math expression wrapped in MathJax syntax
  mathContainer.innerHTML = "\\(" + mathExpression + "\\)";

  // Append the math container to the document body
  document.body.appendChild(mathContainer);

  // Update MathJax to render the new math expression
  MathJax.typesetPromise([mathContainer]).then(function () {
      // Extract plain text from the rendered equation and set it as the value of inputProblem
      var plainText = mathContainer.textContent || mathContainer.innerText;
      inputProblem.value = plainText.trim();

      console.log(inputProblem.value);

      // Remove the math container from the document body
      mathContainer.remove();
  });
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

