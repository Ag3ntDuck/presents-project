import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged
  
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  where,
  updateDoc,
  deleteDoc,
  limit,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
 //твой конфиг тут
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const submit = document.getElementById("submitlogin");

//я сдалась, я правда пыталась это сделать все сама, но в какой-то момент все пошло по пиздец, большая часть кода здесь - вайб кодинг ЧИСТЕЙШЕЙ воды
//самое забавное, что я реально за это время успела разобраться в документации firebase и понимаю как эта залупа устроена, я реально понимаю как все функции тут работают,
//но сама я бы недоперла как их сделать (точнее доперла бы, но сука лет через 8, и то, с хуевым успехом)

const gifUrlAnya = '/anyagif.gif';
const gifUrlSanya = '/sanyacrosses.gif';
const gifUrlTanya = '/tanyalbedo.gif';
const gifUrlVika = '/vikagif.gif';
const gifUrlSuslan = '/suslangif.gif';




window.addEventListener("hashchange", loadProfileFromURL);
window.addEventListener("load", loadProfileFromURL);
let ProfileOwnerId = null;

//оно сверху как костыль, это обработка кнопкки отменить резервацию, которая запускает функцию unreserveGift
document.getElementById('app').addEventListener('click', async (event) => {
    // Обработка кнопки "Отменить резервирование" 
    if (event.target.classList.contains('unreserve-btn')) {
        const ownerId = event.target.getAttribute('data-owner');
        const giftId = event.target.getAttribute('data-gift');
        await unreserveGift(ownerId, giftId);
    }
});

//функция регистрации
submit.addEventListener("click", (event) => {
  event.preventDefault();
  const email = document.getElementById("emaillogin").value; //получаю вэлью//
  const password = document.getElementById("passwordlogin").value;
  const auth = getAuth(); // функция фаербейса //
  signInWithEmailAndPassword(auth, email, password) //принимаю функции фб, почту и пароль//
    .then((userCredential) => {
      const user = userCredential.user;
      alert("вошло хихик"); //оповещалка если успешно зарегало//
    })
    .catch((error) => {
      //я допилю потом//
      const errorCode = error.code;
      const errorMessage = error.message;
    });
});

//hard//

const auth = getAuth();
const db = getFirestore();

// Обработчик изменения статуса авторизации
onAuthStateChanged(auth, (user) => {
  console.log(
    "Статус авторизации изменен:",
    user ? user.uid : "Не авторизован"
  );
  // Не вызываем loadUserProfile здесь иначе будут проблемы в завимодествиии с хешем
  // Просто проверяем: если хэша нет, но пользователь залогинен, загружаем его профиль
  const hash = window.location.hash.substring(1);
  if (!hash && user) {
    loadUserProfile(user.uid);
  }
  // Если хэш есть, сработает loadProfileFromURL
});

//загрузка непосредственно профиля 
async function loadUserProfile(userIdentifier) {
  //добавляем проверку входящего параметра
  if (userIdentifier === undefined || userIdentifier === null) {
    // Если идентификатор не передан, смотрим, есть ли авторизованный пользователь
    const currentUser = getAuth().currentUser;
    if (currentUser) {
      userIdentifier = currentUser.uid; // Загружаем свой профиль
    } else {
      // Если пользователь не авторизован и хэша нет, остаемся на странице логина
      console.log("Не передан идентификатор профиля для загрузки.");
      return;
    }
  }

  try {
    let userDocRef;
    let targetUserId; // ID пользователя, чей профиль загружаем

    // Проверяем, является ли идентификатор UID (обычно длиной 28 символов)
    if (userIdentifier.length === 28) {
      targetUserId = userIdentifier;
      userDocRef = doc(db, "users", targetUserId);
    } else {
      // Если это не UID, ищем пользователя по никнейму
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", userIdentifier));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Находим ID пользователя по документу
        targetUserId = querySnapshot.docs[0].id;
        userDocRef = doc(db, "users", targetUserId);
      } else {
        console.log("Пользователь с таким никнеймом не найден!");
        // Здесь можно показать сообщение "Профиль не найден"
        return;
      }
    }

    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const currentUser = getAuth().currentUser;

      // Определяем, свой это профиль или чужой
      if (currentUser && currentUser.uid === targetUserId) {
        hideRegisterAndLogin(userData); // Показываем личный кабинет
        loadUserGifts(targetUserId); // Загружаем подарки для своего профиля
      } else {
        showPublicProfile(userData, targetUserId); // Показываем публичный профиль
        // Подарки загружаются внутри showPublicProfile
      }
    } else {
      console.log("Документ пользователя не найден!");
    }
  } catch (error) {
    console.error("Ошибка загрузки профиля:", error);
  }
}

//функция скрытиая формы логина и открытия личного кабинета
function hideRegisterAndLogin(userData) {
  const credit = document.getElementById("credit");
  if (credit) credit.remove();

  const appDiv = document.getElementById("app");
  appDiv.innerHTML = `
    <div class="profile-header">
      <h1 class="profileH1">Добро пожаловать, ${userData.username}!</h1>
      <h2>В кратце что тут делать: </h2>
      <ol>
        <li>Ты вводишь краткое название подарка и его ссылку (можно и не ссылку, но тогда по клику будет ошибка</li>
        <li>Ты нажимаешь на одну из трех кнопок приоритета</li>
        <li>ты нажимаешь кнопку добавить подарок</li>
      </ol>
      <ul>
        <li>Так же если что ты можешь удалить свой подарок, если передумал!</li>
        <li>У других людей ты спокойно можешь бронировать подарки, если они не заняты, это отображается в реальном времеи </li>
        <li>ты так же можешь отменить бронирование, ес передумал</li>
      </ul>
      <button id="showUsersBtn">👥 Посмотреть пользователей</button>
    </div>
    <p>Email: ${userData.email}</p>
    <button class="signOutButton">Выйти</button>
    <br>
    
    <!-- Форма добавления подарков -->
    <div class="add-gift-form">
      <input type="text" placeholder="Имя подарка" id="gift-name">
      <input type="text" placeholder="Ссылка на подарок" id="gift-desc">
      <button type="submit" class="gift-button">📤 Добавить подарок</button>
    </div>
    
    <!-- Контейнер для списка пользователей -->
    <div id="users-list-container"></div>
    
    <!-- Контейнер для подарков -->
    <div class="gifts-container"></div>
  `;

  // Загружаем подарки текущего пользователя
  loadUserGifts(getAuth().currentUser.uid);

  // Добавляем обработчик для кнопки показа пользователей
  document
    .getElementById("showUsersBtn")
    .addEventListener("click", showUsersListHandler);
  
     setTimeout(() => {
        updateAddGiftForm(); // или addPriorityButtons() для простого варианта
    }, 100);


}



// Обработчик для кнопки показа пользователей
async function showUsersListHandler() {
  const container = document.getElementById("users-list-container");
  const usersList = await showUsersList();

  // Если список уже открыт - закрываем, иначе показываем
  if (container.innerHTML.includes("users-grid")) {
    container.innerHTML = "";
  } else {
    container.innerHTML = "";
    container.appendChild(usersList);
  }
}

//функиця выхода из акка1
document.getElementById("app").addEventListener("click", function (event) {
  if (event.target.classList.contains("signOutButton")) {
    logout();
  }
});

//функиця выхода из акка 2
function logout() {
  signOut(auth)
    .then(() => {
      // onAuthStateChanged автоматически сработает
      window.location.hash = ""; // Очищаем хэш епт
      location.reload();
    })
    .catch((error) => {
      console.error("Ошибка выхода:", error);
    });
}

function loadProfileFromURL() {
  const identifierFromHash = window.location.hash.substring(1);
  // Если хэш есть, загружаем профиль по нему. Если нет - функция сама проверит авторизацию.
  loadUserProfile(identifierFromHash);
}

//непосредственно функция добавления подарка, берет в себя консты из предыдущего и создает подколлекцию
async function addGift(userId, giftName, giftDescription = "", priority = "medium") {
    try {
        const userDocRef = doc(db, "users", userId);
        const giftsRef = collection(userDocRef, "gifts");

        const docRef = await addDoc(giftsRef, {
            name: giftName,
            description: giftDescription,
            priority: priority, // Добавляем приоритет
            createdAt: serverTimestamp(),
            reserved: false,
            reservedBy: null,
        });

        console.log("Подарок добавлен с приоритетом: ", priority);
    } catch (error) {
        console.error("Ошибка при добавлении подарка: ", error);
        throw error;
    }
}
//функция добавления подарка 1 находим этот элемент и доавляем к нему функцию
document.getElementById("app").addEventListener("click", (event) => {
  if (event.target.classList.contains("gift-button")) {
    addingGifts();
  }
});

function updateAddGiftForm() {
    // Находим или создаем контейнер для кнопок приоритета
    let priorityContainer = document.querySelector('.priority-buttons');
    if (!priorityContainer) {
        priorityContainer = document.createElement('div');
        priorityContainer.className = 'priority-buttons';
        
        const giftForm = document.querySelector('.add-gift-form');
        if (giftForm) {
            // Вставляем перед кнопкой "Добавить"
            const addButton = giftForm.querySelector('.gift-button');
            giftForm.insertBefore(priorityContainer, addButton);
        }
    }
    
    priorityContainer.innerHTML = `
        <button type="button" class="priority-btn priority-low" data-priority="low">
            💚 Было бы прикольно
        </button>
        <button type="button" class="priority-btn priority-medium active" data-priority="medium">
            🧡 Хочу
        </button>
        <button type="button" class="priority-btn priority-high" data-priority="high">
            ❤️ ОЧЕНЬ ХОЧУ
        </button>
    `;
    
    // Обработчики для кнопок приоритета
    priorityContainer.querySelectorAll('.priority-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            priorityContainer.querySelectorAll('.priority-btn').forEach(b => {
                b.classList.remove('active');
            });
            // Добавляем активный класс к выбранной
            this.classList.add('active');
        });
    });
}



//функция добавления подарка 2, находим пользователя и его инпуты и вызывает функцию обработчик добавки подарки
async function addingGifts() {
    const user = getAuth().currentUser;
    const giftNameInput = document.getElementById("gift-name");
    const giftDescInput = document.getElementById("gift-desc");
    
    if (user) {
        try {
            // Получаем выбранный приоритет
            const activePriorityBtn = document.querySelector('.priority-btn.active');
            const priority = activePriorityBtn ? activePriorityBtn.getAttribute('data-priority') : 'medium';
            
            await addGift(user.uid, giftNameInput.value, giftDescInput.value, priority);
            
            giftNameInput.value = "";
            giftDescInput.value = "";
            await loadUserGifts(user.uid);
            alert("Подарок успешно добавлен!");
        } catch (error) {
            alert("Не удалось добавить подарок: " + error.message);
        }
    }
}

document.getElementById("app").addEventListener("click", async (event) => {
  if (event.target.classList.contains("reserve-btn")) {
    const ownerId = event.target.getAttribute("data-owner");
    const giftId = event.target.getAttribute("data-gift");
    await reserveGift(ownerId, giftId);
  }
});

//функуия загрузки добавленых подарков
async function loadUserGifts(userId) {
    try {
        const userDocRef = doc(db, "users", userId);
        const giftsCollectionRef = collection(userDocRef, "gifts");
        const q = query(giftsCollectionRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        let giftsContainer = document.querySelector(".gifts-container");
        if (!giftsContainer) {
            giftsContainer = document.createElement("div");
            giftsContainer.className = "gifts-container";
            document.getElementById("app").appendChild(giftsContainer);
        }

        // Создаем структуру с тремя колонками
        giftsContainer.innerHTML = `
            <div class="priority-section priority-low-section">
                <div class="priority-header priority-low-header">
                    <h3>💚 Было бы прикольно</h3>
                    <small>Необязательные но прикольные</small>
                </div>
                <div class="gifts-low" id="gifts-low"></div>
            </div>
            
            <div class="priority-section priority-medium-section">
                <div class="priority-header priority-medium-header">
                    <h3>🧡 Хочу</h3>
                    <small>Желаемые подарки</small>
                </div>
                <div class="gifts-medium" id="gifts-medium"></div>
            </div>
            
            <div class="priority-section priority-high-section">
                <div class="priority-header priority-high-header">
                    <h3>❤️ ОЧЕНЬ ХОЧУ</h3>
                    <small>Самые желанные</small>
                </div>
                <div class="gifts-high" id="gifts-high"></div>
            </div>
        `;

        if (querySnapshot.empty) {
            document.getElementById('gifts-medium').innerHTML = "<p>Пока нет подарков в списке</p>";
            return;
        }

        const currentUser = getAuth().currentUser;
        const isMyProfile = currentUser && currentUser.uid === userId;

        // Группируем подарки по приоритетам
        const lowGifts = [];
        const mediumGifts = [];
        const highGifts = [];

        querySnapshot.forEach((doc) => {
            const gift = doc.data();
            gift.id = doc.id;
            
            const priority = gift.priority || 'medium';
            
            switch (priority) {
                case 'low':
                    lowGifts.push(gift);
                    break;
                case 'medium':
                    mediumGifts.push(gift);
                    break;
                case 'high':
                    highGifts.push(gift);
                    break;
            }
        });

        // Отображаем подарки по секциям
        displayGiftsInSection(lowGifts, 'gifts-low', userId, isMyProfile);
        displayGiftsInSection(mediumGifts, 'gifts-medium', userId, isMyProfile);
        displayGiftsInSection(highGifts, 'gifts-high', userId, isMyProfile);

    } catch (error) {
        console.error("Ошибка при загрузке подарков:", error);
    }
}

function displayGiftsInSection(gifts, sectionId, userId, isMyProfile) {
    const section = document.getElementById(sectionId);
    
    if (gifts.length === 0) {
        section.innerHTML = '<p class="empty-section">Пока нет подарков</p>';
        return;
    }

    section.innerHTML = '';
    
    gifts.forEach(gift => {
        const giftElement = createGiftElement(gift, userId, isMyProfile);
        section.appendChild(giftElement);
    });
}

function createGiftElement(gift, userId, isMyProfile) {
    const isReserved = gift.reserved === true;
   const currentUser = getAuth().currentUser;
    const reservedByCurrentUser = currentUser && gift.reservedBy === currentUser.uid;
    const priority = gift.priority || 'medium';
    const priorityInfo = getPriorityInfo(priority);

    const giftElement = document.createElement("div");
    giftElement.className = `gift priority-${priority}`;
    
    if (isMyProfile) {
        giftElement.innerHTML = `
            <div class="gift-header">
                <h4>${gift.name}</h4>
            </div>
            ${gift.description ? `
    <a href="${gift.description}" target="_blank" class="gift-link">
        ${getMarketplaceIcon(gift.description)} Перейти к товару
    </a>
` : ""}
            <button class="delete-gift-btn" data-owner="${userId}" data-gift="${gift.id}">❌ Удалить</button>
        `;
    } else {
        let actionButton = "";
        
        if (!isReserved) {
            actionButton = `<button class="reserve-btn" data-owner="${userId}" data-gift="${gift.id}">🎁 Зарезервировать</button>`;
        } else if (reservedByCurrentUser) {
    actionButton = `
        <span class="reserved-by-you">✅ Ваш</span>
        <button class="unreserve-btn" data-owner="${userId}" data-gift="${gift.id}">
            ❌ Отменить
        </button>
            `;
        } else {
            actionButton = `<span class="reserved">⛔ Занят</span>`;
        }

        giftElement.innerHTML = `
            <div class="gift-header">
                <h4>${gift.name}</h4>
            </div>
            ${gift.description ? `<a href="${gift.description}" target="_blank" class="gift-link">🔗 Ссылка</a>` : ""}
            ${isReserved ? `<p class="reserved-info">🛑 Зарезервирован</p>` : ""}
            ${actionButton}
        `;
    }
    
    return giftElement;
}

// Функция для получения информации о приоритете
function getPriorityInfo(priority) {
    const priorities = {
        low: { 
            icon: '💚', 
            class: 'priority-low-badge', 
            text: 'Было бы прикольно' 
        },
        medium: { 
            icon: '🧡', 
            class: 'priority-medium-badge', 
            text: 'Хочу' 
        },
        high: { 
            icon: '❤️', 
            class: 'priority-high-badge', 
            text: 'ОЧЕНЬ ХОЧУ' 
        }
    };
    return priorities[priority] || priorities.medium;
}
//функция резеврации

function showPublicProfile(userData, userId) {
  // Скрываем форму логина при просмотре чужого профиля
  const credit = document.getElementById("credit");
  if (credit) {
    credit.style.display = "none"; // или credit.remove();
  }

  const currentUser = getAuth().currentUser;
  const appDiv = document.getElementById("app");

  appDiv.innerHTML = `
    <div class="profile-header">
      <h1>Профиль пользователя: ${userData.username}!</h1>
      ${
        currentUser
          ? `
        <div class="profile-actions">
          <button class="back-to-profile-btn">← Вернуться в мой профиль</button>
          <button class="signOutButton">Выйти из аккаунта</button>
        </div>
      `
          : ""
      }
    </div>
    <p>Email: ${userData.email}</p>
    <br>
    <div class="gifts-container">Загрузка списка подарков...</div>
  `;

  // Загружаем подарки этого пользователя
  loadUserGifts(userId);
}


document.addEventListener("click", (event) => {
  if (event.target.classList.contains("back-to-profile-btn")) {
    goBackToMyProfile();
  }
});

// Функция возврата в свой профиль
function goBackToMyProfile() {
  const currentUser = getAuth().currentUser;
  if (currentUser) {
    // Очищаем хэш и загружаем свой профиль
    window.location.hash = "";
    loadUserProfile(currentUser.uid);
  }
}


// Функция резервирования подарка
async function reserveGift(ownerId, giftId) {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
        alert('Чтобы зарезервировать подарок, необходимо войти в систему.');
        return;
    }

    try {
        const giftDocRef = doc(db, "users", ownerId, "gifts", giftId);
        
        // Проверяем, не зарезервирован ли уже подарок
        const giftDoc = await getDoc(giftDocRef);
        if (giftDoc.exists() && giftDoc.data().reserved) {
            alert('Этот подарок уже зарезервирован другим пользователем!');
            await loadUserGifts(ownerId); // Обновляем статус
            return;
        }
        
        await updateDoc(giftDocRef, {
            reserved: true,
            reservedBy: currentUser.uid,
            reservedAt: serverTimestamp()
        });
        
        alert('Подарок зарезервирован! 🎁');
        await loadUserGifts(ownerId);
        
    } catch (error) {
        console.error("Ошибка при резервировании подарка:", error);
        alert('Не удалось зарезервировать подарок.');
    }
}

async function unreserveGift(ownerId, giftId) {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
        alert('Для отмены резервирования необходимо войти в систему.');
        return;
    }

    // Подтверждение действия
    const isConfirmed = confirm('Вы уверены, что хотите отменить резервирование этого подарка?');
    if (!isConfirmed) {
        return;
    }

    try {
        const giftDocRef = doc(db, "users", ownerId, "gifts", giftId);
        await updateDoc(giftDocRef, {
            reserved: false,
            reservedBy: null,
            reservedAt: null
        });
        
        alert('Резервирование отменено!');
        
        // Перезагружаем подарки
        await loadUserGifts(ownerId);
        
    } catch (error) {
        console.error("Ошибка при отмене резервирования:", error);
        alert('Не удалось отменить резервирование.');
    }
}

async function deleteGift(profileOwnerId, giftId) {
  // Проверяем, авторизован ли пользователь и является ли он владельцем подарка
  const currentUser = getAuth().currentUser;
  if (!currentUser) {
    alert("Для выполнения этого действия необходимо войти в систему.");
    return;
  }

  // Создаем ссылку на документ подарка, который нужно удалить
  // Формат пути: users/{profileOwnerId}/gifts/{giftId}
  const giftDocRef = doc(db, "users", profileOwnerId, "gifts", giftId);

  try {
    // Удаляем документ
    await deleteDoc(giftDocRef);
    console.log("Подарок успешно удален!");

    // После удаления перезагружаем список подарков, чтобы изменения сразу отобразились на странице
    loadUserGifts(profileOwnerId);
  } catch (error) {
    console.error("Ошибка при удалении подарка:", error);
    alert("Не удалось удалить подарок.");
  }
}

//кнопка удаление обертка
document.getElementById("app").addEventListener("click", (event) => {
  // Если кликнули по кнопке удаления
  if (event.target.classList.contains("delete-gift-btn")) {
    const ownerId = event.target.getAttribute("data-owner");
    const giftId = event.target.getAttribute("data-gift");
    deleteGift(ownerId, giftId);
  }
});

//реализауия друзей

async function getAllUsers() {
  try {
    console.log("Начинаем загрузку пользователей...");

    const usersRef = collection(db, "users");
    const q = query(usersRef, limit(limit));
    const querySnapshot = await getDocs(q);

    console.log("Найдено документов:", querySnapshot.size);

    const users = [];
    querySnapshot.forEach((doc) => {
      console.log("Обрабатываем документ:", doc.id, doc.data());

      const userData = doc.data();
      // Проверяем, что у пользователя есть необходимые поля
      if (userData.username && userData.email) {
        users.push({
          id: doc.id,
          username: userData.username,
          email: userData.email,
          createdAt: userData.createdAt || null,
        });
      } else {
        console.warn("Пользователь без username или email:", doc.id, userData);
      }
    });

    console.log("Успешно загружено пользователей:", users.length);
    return users;
  } catch (error) {
    console.error("Ошибка при загрузке пользователей:", error);

    // Более детальный анализ ошибки
    if (error.code === "permission-denied") {
      console.error(
        "Ошибка прав доступа. Проверьте правила безопасности Firestore"
      );
    } else if (error.code === "not-found") {
      console.error("Коллекция users не найдена");
    }

    return [];
  }
}

async function showUsersList() {
  const users = await getAllUsers();

  const usersContainer = document.createElement("div");
  usersContainer.className = "users-container";
  usersContainer.innerHTML = `
    <h3>🎭 Недавно зарегистрировались</h3>
    <div class="users-grid" id="users-grid">
      ${users
        .map(
          (user) => `
        <div class="user-card" data-user-id="${user.id}">
          <h4>${user.username}</h4>
          <p>${user.email}</p>
          <button class="view-profile-btn" data-username="${user.username}">
            👀 Посмотреть профиль
          </button>
        </div>
      `
        )
        .join("")}
    </div>
  `;

  return usersContainer;
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("view-profile-btn")) {
    const username = event.target.getAttribute("data-username");
    // Переходим к профилю пользователя через хэш
    window.location.hash = username;
  }
});




//ПОШЛА ШИЗОФРЕНИЯ


document.addEventListener('click', (event) => {
  const avatar = event.target.closest('.flying-avatar');
  if (avatar) {
    createParticlesEffect(avatar);
    avatar.classList.add('flying');
    
    // Останавливаем анимацию через 5 секунд
    setTimeout(() => {
      avatar.classList.remove('flying');
    }, 4000);
  }
});


  

let currentAudio = null;

// Обработчик клика на фотографии
document.addEventListener('click', (event) => {
    const photo = event.target.closest('.user-photo');
    if (photo) {
        const musicFile = photo.getAttribute('data-music');
        const name = photo.getAttribute('data-username');
        
        playPhotoMusic(musicFile, name);
        
    }
});

function playPhotoMusic(musicFile, name) {
    // Разделяем строку с треками в массив
    const tracks = musicFile.split(',');
    
    // Случайно выбираем трек
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)].trim();
    
    // Останавливаем предыдущую музыку
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    
    try {
        currentAudio = new Audio(randomTrack);
        currentAudio.volume = 0.4;
        currentAudio.play();
        
       
        
    } catch (error) {
        console.log('Не удалось воспроизвести музыку:', error);
    }
}


//нижний уровнеь айсберга 

const botPhrases = [
    "Я бот блядь але",
    "Аня лучший кодер",
    "Только попробуй мне тут попинтестить",
    "Амогус?"
];

let chatHistory = [];

function createChatBot() {
    // Создаем кнопку бота
    const botButton = document.createElement('div');
    botButton.className = 'chat-bot';
    botButton.innerHTML = '🦆';
    botButton.title = 'Чат-консультант';
    
    // Создаем окно чата
    const chatWindow = document.createElement('div');
    chatWindow.className = 'chat-window';
    chatWindow.innerHTML = `
        <div class="chat-header">
            <h3>Аня Бот</h3>
            <small>Всегда не рада помочь!</small>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input">
            <input type="text" id="chat-input" placeholder="Напишите свою хуйню...">
            
        </div>
    `;
    
    document.body.appendChild(botButton);
    document.body.appendChild(chatWindow);
    
    // Обработчики событий
    botButton.addEventListener('click', toggleChat);
    
    // Отправка по Enter
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && document.getElementById('chat-input')) {
            sendMessage();
        }
    });
}

function toggleChat() {
    const chatWindow = document.querySelector('.chat-window');
    chatWindow.classList.toggle('active');
    
    if (chatWindow.classList.contains('active')) {
        // Показываем приветственное сообщение
        showBotMessage("Ну че как ты?");
    }
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message) {
        // Показываем сообщение пользователя
        showUserMessage(message);
        input.value = '';
        
        // Имитация набора текста ботом
        setTimeout(() => {
            const randomPhrase = botPhrases[Math.floor(Math.random() * botPhrases.length)];
            showBotMessage(randomPhrase);
        }, 1000);
    }
}

function showUserMessage(text) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showBotMessage(text) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.innerHTML = `🤖: ${text}`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Инициализируем чат-бота при загрузке страницы
document.addEventListener('DOMContentLoaded', createChatBot);


let isRainbowMode = false;

function createThemeToggle() {
    const toggle = document.createElement('div');
    toggle.className = 'theme-toggle';
    toggle.innerHTML = '🌈';
    toggle.title = 'Включить радужный режим';
    
    document.body.appendChild(toggle);
    
    // Загружаем сохраненное состояние
    const savedTheme = localStorage.getItem('rainbowTheme');
    if (savedTheme === 'true') {
        enableRainbowTheme();
        toggle.classList.add('rainbow-mode');
        toggle.innerHTML = '🎨';
        toggle.title = 'Выключить радужный режим';
    }
    
    toggle.addEventListener('click', toggleRainbowTheme);
}

function toggleRainbowTheme() {
    const toggle = document.querySelector('.theme-toggle');
    
    if (!isRainbowMode) {
        // Включаем радужную тему
        enableRainbowTheme();
        toggle.classList.add('rainbow-mode');
        toggle.innerHTML = '🎨';
        toggle.title = 'Выключить радужный режим';
        
    } else {
        // Выключаем радужную тему
        disableRainbowTheme();
        toggle.classList.remove('rainbow-mode');
        toggle.innerHTML = '🌈';
        toggle.title = 'Включить радужный режим';
    }
    
    isRainbowMode = !isRainbowMode;
    localStorage.setItem('rainbowTheme', isRainbowMode.toString());
}

function enableRainbowTheme() {
    document.body.classList.add('rainbow-theme');
    
}

function disableRainbowTheme() {
    document.body.classList.remove('rainbow-theme');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', createThemeToggle);


//аня кот

document.addEventListener('click', (event) => {
    const photo = event.target.closest('.your-photo'); // Ваш класс фотографии
    if (photo) {
        const originalSrc = photo.src;
        
        
        // Если сейчас фото - меняем на гифку, если гифка - возвращаем фото
        if (photo.src === originalSrc) {
            photo.src = gifUrlAnya;
            photo.style.transform = 'scale(1.1)'; // Легкая анимация
            setTimeout(() => photo.style.transform = 'scale(1)', 300);
        } else {
            photo.src = originalSrc;
        }
    }
});

//croses

document.addEventListener('click', (event) => {
    const photo = event.target.closest('.sanyacrosses'); // Ваш класс фотографии
    if (photo) {
        const originalSrc = photo.src;
        
        
        // Если сейчас фото - меняем на гифку, если гифка - возвращаем фото
        if (photo.src === originalSrc) {
            photo.src = gifUrlSanya;
            photo.style.transform = 'scale(1.1)'; // Легкая анимация
            setTimeout(() => photo.style.transform = 'scale(1)', 300);
        } else {
            photo.src = originalSrc;
        }
    }
});

//albedo 

document.addEventListener('click', (event) => {
    const photo = event.target.closest('.tanyalbedo'); // Ваш класс фотографии
    if (photo) {
        const originalSrc = photo.src;
        
        
        // Если сейчас фото - меняем на гифку, если гифка - возвращаем фото
        if (photo.src === originalSrc) {
            photo.src = gifUrlTanya;
            photo.style.transform = 'scale(1.1)'; // Легкая анимация
            setTimeout(() => photo.style.transform = 'scale(1)', 300);
        } else {
            photo.src = originalSrc;
        }
    }
});

//NEIN

document.addEventListener('click', (event) => {
    const photo = event.target.closest('.vikanein'); // Ваш класс фотографии
    if (photo) {
        const originalSrc = photo.src;
        
        
        // Если сейчас фото - меняем на гифку, если гифка - возвращаем фото
        if (photo.src === originalSrc) {
            photo.src = gifUrlVika;
            photo.style.transform = 'scale(1.1)'; // Легкая анимация
            setTimeout(() => photo.style.transform = 'scale(1)', 300);
        } else {
            photo.src = originalSrc;
        }
    }
});

//suslan

document.addEventListener('click', (event) => {
    const photo = event.target.closest('.crueltyruslan'); // Ваш класс фотографии
    if (photo) {
        const originalSrc = photo.src;
        
        
        // Если сейчас фото - меняем на гифку, если гифка - возвращаем фото
        if (photo.src === originalSrc) {
            photo.src = gifUrlSuslan;
            photo.style.transform = 'scale(1.1)'; // Легкая анимация
            setTimeout(() => photo.style.transform = 'scale(1)', 300);
        } else {
            photo.src = originalSrc;
        }
    }
});

//дно айсберга 

function createParticlesEffect(avatar, count = 150) {
    const avatarRect = avatar.getBoundingClientRect();
    const originalSrc = avatar.src;
    
    // Создаем контейнер для частиц
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10000;
    `;
    document.body.appendChild(particlesContainer);
    
    // Создаем частицы
    for (let i = 0; i < count; i++) {
        createParticle(particlesContainer, avatarRect, originalSrc, i, count);
    }
    
    // Удаляем контейнер после анимации
    setTimeout(() => {
        particlesContainer.remove();
    }, 2000);
}

// Функция создания одной частицы
function createParticle(container, avatarRect, src, index, total) {
    const particle = document.createElement('div');
    const size = 30 + Math.random() * 40; // Размер от 30 до 70px
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-image: url('${src}');
        background-size: cover;
        background-position: center;
        top: ${avatarRect.top + avatarRect.height / 2}px;
        left: ${avatarRect.left + avatarRect.width / 2}px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: particleFly${index} 1.5s ease-out forwards;
        box-shadow: 0 0 10px rgba(255,255,255,0.5);
        border: 2px solid white;
    `;
    
    // Создаем уникальную анимацию для каждой частицы
    const style = document.createElement('style');
    const angle = (index / total) * Math.PI * 2;
    const distance = 200 + Math.random() * 300;
    const endX = Math.cos(angle) * distance;
    const endY = Math.sin(angle) * distance;
    const rotation = Math.random() * 720 - 360;
    
    style.textContent = `
        @keyframes particleFly${index} {
            0% {
                transform: translate(-50%, -50%) scale(1) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translate(${endX}px, ${endY}px) scale(0.3) rotate(${rotation}deg);
                opacity: 0;
            }
        }
    `;
    
    document.head.appendChild(style);
    container.appendChild(particle);
    
    // Удаляем стиль после анимации
    setTimeout(() => {
        style.remove();
    }, 1500);
}

//определялка магаза 
function getMarketplaceIcon(url) {
    if (!url) return '🛒';
    
    if (url.includes('wildberries') || url.includes('wb.ru')) return '🟣 WB';
    if (url.includes('ozon.ru')) return '🔵 OZ';
    if (url.includes('market.yandex')) return '🔴 YM';
    if (url.includes('aliexpress')) return '🟠 AE';
    
    return '🛒';
}



//взрывы

const explosionGif = new Image();
explosionGif.src = 'https://media.tenor.com/DqOx5At4J4cAAAAj/explosion.gif';

function createInstantExplosion(x, y) {
    const explosion = document.createElement('img');
    explosion.className = 'instant-explosion';
    explosion.src = explosionGif.src;
     const size = 80; // Размер GIF
    
    explosion.style.cssText = `
        position: fixed;
        top: ${y - size/2}px; /* Центрируем по вертикали */
        left: ${x - size/2}px; /* Центрируем по горизонтали */
        width: ${size}px;
        height: ${size}px;
        pointer-events: none;
        z-index: 9999;
        border-radius: 50%;
    `;
    
    document.body.appendChild(explosion);
    
    setTimeout(() => {
        explosion.remove();
    }, 600);
}

// Обработчик с проверкой чтобы не мешать интерфейсу
document.addEventListener('click', (event) => {
    // Не создаем взрывы при клике на важные элементы
    const ignoreElements = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'];
    if (ignoreElements.includes(event.target.tagName)) {
        return;
    }
    
    // Не создаем взрывы при клике на интерактивные элементы
    if (event.target.closest('button') || event.target.closest('a') || event.target.closest('input')) {
        return;
    }
    
    createInstantExplosion(event.clientX, event.clientY);
});


// cum is 

const magicWordElement = document.getElementById('cumIs');
const magicVideoElement = document.getElementById('cumIsVideo');

// Сохраняем оригинальный текст
const originalText = magicWordElement.textContent;

// Добавляем реакцию на клик
magicWordElement.addEventListener('click', function() {
    // Скрываем слово
    magicWordElement.style.display = 'none';
    //  Показываем и запускаем видео
    magicVideoElement.style.display = 'inline';
    magicVideoElement.play(); // Начинаем воспроизведение
    // 3. Ждём окончания видео и возвращаем слово
    magicVideoElement.addEventListener('ended', function videoEndHandler() {
        // Скрываем видео
        magicVideoElement.style.display = 'none';
        // Показываем слово обратно
        magicWordElement.style.display = 'inline';
        // Убираем обработчик, чтобы он не копился
        magicVideoElement.removeEventListener('ended', videoEndHandler);
    });
});