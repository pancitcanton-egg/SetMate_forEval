import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { getDatabase, ref, set, get, child} from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-storage.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js';

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
 const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
const signUpForm = document.getElementById('signup-form');
const signInForm = document.getElementById('signin-form');

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

if (signUpForm) {
    signUpForm.addEventListener('submit', handleSignUpFormSubmit);
}

if (signInForm) {
    signInForm.addEventListener('submit', handleSignInFormSubmit);
}

// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         // User is signed in. Handle the case where the user is always signed in.
//         console.log('User is signed in:', user.uid);

//         // You can perform additional actions here, such as updating UI or redirecting.
//     } else {
//         // User is signed out.
//         console.log('User is signed out.');
//     }
// });

})

function handleSignUpFormSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    createUserWithEmailAndPassword(auth, email, password, username)
        .then((userCredential) => {
            // Signed up successfully
            const user = userCredential.user;
            console.log('User signed up:', user);
            const userRef = ref(database, 'users/' + user.uid);
            set(userRef, {
                username: username,
                email: email,
                history: '',
            })
            .then(() => {
                console.log('User data written successfully');
                window.location.reload();
            })
            .catch((error) => {
                console.error('Error writing user data:', error);
            });
            
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error signing up:', errorCode, errorMessage);
            // Handle the error appropriately (e.g., display an error message)
        });
}

function handleSignInFormSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userRef = ref(database, 'users/' + user.uid);

            // Retrieve the user details from the database
            get(userRef)
                .then((snapshot) => {
                    const userData = snapshot.val();
                    const username = userData ? userData.username : 'Unknown';

                    console.log(`User signed in with UID: ${user.uid}, Username: ${username}`);

                    const userUID = user.uid; // Ensure user.uid is defined

                    // Set user.uid to localStorage only after successful sign-in
                    localStorage.setItem('userUID', userUID);

                    window.location.href = 'landing-page.html';
                    // Perform additional actions based on the sign-in, e.g., redirect, update UI, etc.
                })
                .catch((error) => {
                    console.error('Error retrieving user data:', error);
                });
        })
        .catch((error) => {
            console.error('Error signing in:', error);
        });
}

