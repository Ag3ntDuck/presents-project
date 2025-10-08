import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const db = getFirestore();

async function addGift(userId, giftName, giftDescription = "") {
  try {
    // Ссылка на подколлекцию "gifts" внутри документа пользователя
    const giftsRef = collection(db, "users", userId, "gifts");

    // Добавляем новый документ в подколлекцию
    const docRef = await addDoc(giftsRef, {
      name: giftName,
      description: giftDescription,
      createdAt: serverTimestamp(), // Используем серверное время
      reserved: false, // Изначально подарок не забронирован
      reservedBy: null // ID пользователя, который забронировал подарок
    });

    console.log("Подарок добавлен с ID: ", docRef.id);
    return docRef.id; // Возвращаем ID нового подарка
  } catch (error) {
    console.error("Ошибка при добавлении подарка: ", error);
    throw error; // Перебрасываем ошибку для обработки в UI
  }
}

// Пример вызова функции при отправке формы
document.getElementById('app').addEventListener('click', function(event) {
    if (event.target.classList.contains('gift-form')) {
        console.log("я вижу gift-form");
        addingGifts();
    }
});

function addingGifts() {
  e.preventDefault();
  const user = getAuth().currentUser; // Получаем текущего пользователя
  const giftNameInput = document.getElementById("gift-name");
  const giftDescInput = document.getElementById("gift-desc");

  if (user) {
    try {
      addGift(user.uid, giftNameInput.value, giftDescInput.value);
      giftNameInput.value = ""; // Очищаем поле ввода
      giftDescInput.value = "";
      alert("Подарок успешно добавлен!");
    } catch (error) {
      alert("Не удалось добавить подарок: " + error.message);
    }
  }
};







if (event.target.classList.contains('gift-button')) {
        console.log("так ну")
        

        
      }








      function idk() {
  document.addEventListener('DOMContentLoaded', (event) => {
      document.getElementById('app').addEventListener('click', function(event) {
        console.log(document.getElementById("gift-button"))
        const button = document.getElementById("gift-button");
        button.addEventListener("click", (event) => {
              event.preventDefault();
              const user = getAuth().currentUser; // Получаем текущего пользователя
              const giftNameInput = document.getElementById("gift-name");
              const giftDescInput = document.getElementById("gift-desc");
                  if (user) {
                try {
                  addGift(user.uid, giftNameInput.value, giftDescInput.value);
                  alert("Подарок успешно добавлен!");
                } catch (error) {
                  alert("Не удалось добавить подарок: " + error.message);
            }
                      }


        })
      
   });
 });
}

 idk()





 function kys() {
  document.addEventListener('DOMContentLoaded', (event) => {
    const appElement = document.getElementById("app");
      if (appElement) {
        const buttonElement = appElement.querySelector("#gift-button");
        buttonElement.addEventListener("click", (event) => {
              event.preventDefault();
              const user = getAuth().currentUser; // Получаем текущего пользователя
              const giftNameInput = document.getElementById("gift-name");
              const giftDescInput = document.getElementById("gift-desc");
                  if (user) {
                try {
                  addGift(user.uid, giftNameInput.value, giftDescInput.value);
                  alert("Подарок успешно добавлен!");
                } catch (error) {
                  alert("Не удалось добавить подарок: " + error.message);
            }
                      }


        })
      }
  })
}

kys();


