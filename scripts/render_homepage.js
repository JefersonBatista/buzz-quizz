
resetHome();
function requestQuizzes() {
    addLoadScreen();
    const promise = axios.get("https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes")
    promise.then(renderHome);
    promise.catch(console.log)
}

function resetHome() {
    document.querySelector(".home").innerHTML = `<section class="user-quizzes ">
    </section>
    <section class="all-quizzes">
        <div class="section-title">
            <strong>Todos os Quizzes</strong>
        </div>
        <div class="quizz-box">
        </div>
    </section>
    `;
    requestQuizzes()
}

function renderHome(response) {
    const quizzes = response.data;
    const userQuizzIds = renderUserQuizzes();
    const allQuizzBox = document.querySelector(".all-quizzes .quizz-box");
    allQuizzBox.innerHTML = ""
    quizzes.forEach(quizz => {
        if (!userQuizzIds.includes(quizz.id)){
            allQuizzBox.innerHTML += `<div class="quizz clickable" onclick="changePage(1, ${quizz.id})">
                <img src="${quizz.image}">
                <div class="black-gradient"></div>
                <div class="title-box">
                    <p>${quizz.title}</p>
                </div>
            </div>`;
        }});
    if (userQuizzIds.length === 0){
        removeLoadScreen();
    }
}

// Renderiza os quizzes do usuário

function renderUserQuizzes () {
    const userQuizzIds = getUserQuizzes();
    const userQuizzes = document.querySelector(".user-quizzes");
    userQuizzes.innerHTML = `<div class="empty">
        <p>
            Você não criou nenhum <br>
            quizz ainda :(
        </p>
        <button onclick="changePage(2)">
            <span>Criar Quizz</span>
        </button>
    </div>`;
    if (userQuizzIds.length > 0) {
        userQuizzes.innerHTML = `<div class="section-title">
            <strong>Seus Quizzes</strong>
            <ion-icon name="add-circle" onclick="changePage(2)"></ion-icon>
        </div>
        <div class="quizz-box">
        </div>`
        const userQuizzBox = document.querySelector(".user-quizzes .quizz-box")
        userQuizzIds.forEach((quizzId, index) => {
            let quizz;
            const promise = axios.get("https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes" + `/${quizzId.id}`);
            promise.then(response => {
                quizz = response.data;
                userQuizzBox.innerHTML += 
                `<div class="quizz clickable" onclick="changePage(1, ${quizzId.id})">
                    <img src="${quizz.image}">
                    <div class="black-gradient"></div>
                    <div class="box-edit-exclude">
                        <ion-icon onclick="editUserQuizz(${quizzId.id},'${quizzId.auth}')" name="create-outline"></ion-icon>
                        <ion-icon onclick="deleteUserQuizz(${quizzId.id},'${quizzId.auth}')" name="trash-outline"></ion-icon>
                    </div>
                    <div class="title-box">
                        <p>${quizz.title}</p>
                    </div>
                </div>`
                if (index === userQuizzIds.length - 1){
                    removeLoadScreen();
                }
            });
        });
    }
    return userQuizzIds;
}

function getUserQuizzes() {
    let userQuizzIds = localStorage.getItem("userQuizzIds");
    if (!userQuizzIds) {
        localStorage.setItem("userQuizzIds", "[]");
        return getUserQuizzes();
    }
    userQuizzIds = JSON.parse(userQuizzIds);
    return userQuizzIds;
}

function changePage(pageId, information){
    const pages = document.querySelectorAll("article");
    switch (pageId) {
        case 0:
            pages[2].classList.add("hidden");
            pages[1].classList.add("hidden");
            pages[0].classList.remove("hidden");
            resetHome();
            break;
        case 1:
            pages[2].classList.add("hidden");
            pages[0].classList.add("hidden");
            pages[1].classList.remove("hidden");
            resetQuizzGame(information);
            break;
        case 2:
            pages[0].classList.add("hidden");
            pages[1].classList.add("hidden");
            pages[2].classList.remove("hidden");
            resetAddQuizz(pages[2]);
            break;
        default:
            pages[0].classList.add("hidden");
            pages[1].classList.add("hidden");
            pages[2].classList.add("hidden");
            break;
    }
}

function addLoadScreen() {
    document.querySelector(".loading-page").classList.remove("hidden");
}

function removeLoadScreen() {
    document.querySelector(".loading-page").classList.add("hidden");
}
