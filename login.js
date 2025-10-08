// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
  
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD4QgYInkbdn8igp34HTMv4IeRRdSXNCOc",
  authDomain: "gifts-a1a34.firebaseapp.com",
  projectId: "gifts-a1a34",
  storageBucket: "gifts-a1a34.firebasestorage.app",
  messagingSenderId: "297894058977",
  appId: "1:297894058977:web:dd62d1a361e524362990a0",
  measurementId: "G-1K5Z3FGH6C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const submit = document.getElementById("submit");
const db = getFirestore(app);


//это регистрация//
submit.addEventListener("click", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value; //получаю вэлью//
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;


  if (password.length < 6) {
    //проверяю больше 6 ли//
    alert("э пароль больше 6 символов или бан");
  }

  if (!email || !password) {
    //проверясю заполнено ли все хуйни//
    alert("еблан все заполни");
  }

  const auth = getAuth(); // функция фаербейса //

  createUserWithEmailAndPassword(auth, email, password) //принимаю функции фб, почту и пароль//
    .then((userCredential) => {
       const user = userCredential.user; //креатим юзера//
       //а тут мы добавляем в дб//
       setDoc(doc(db, "users", user.uid), {
          email: email,
          username: username
      });

      alert("зарегало хихик"); //оповещалка если успешно зарегало//
      window.location.hash = username; //переход на его страницу//
    })
    .catch((error) => {
      //я допилю потом//
      const errorCode = error.code;
      const errorMessage = error.message;
    });

 
});


//РЕАЛЗИАЦИЯ СМЕНЫ ПАРОЛЯ//


async function sendPasswordResetEmailWrapper() {
    const email = document.getElementById('resetEmail').value;
    const auth = getAuth();

    try {
        await sendPasswordResetEmail(auth, email);
        alert('Письмо со ссылкой для сброса пароля отправлено на ваш email!');
        // hideForgotPasswordModal(); // Скрыть модальное окно
    } catch (error) {
        console.error("Ошибка при отправке письма:", error);
        alert('Произошла ошибка: ' + error.message);
    }
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("buttonReset")) {
    sendPasswordResetEmailWrapper();
  }
});