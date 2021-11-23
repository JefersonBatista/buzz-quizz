// Caso seja adicionado mais variaveis globais, elas devem ser zeradas em resetQuizzGame
let quizz = [];
let questions = [];
let correctAnswers = [];
let qtyCorrectChoices = 0;


function resetQuizzGame(id){
    addLoadScreen();
    const quizzGame = document.querySelector(".quizz-game");
    quizzGame.innerHTML = `<div class="banner">
    </div>
    <main class="questions">
        <section class="option" data-identifier="question">
            <div class="alternatives">
            </div>
        </section>
    </main>
    <section class="results" data-identifier="quizz-result">
    </section>
    <button class="reload-quizz" onclick="changePage(1, ${id})">Reiniciar Quizz</button>
    <button class="back-home" onclick="changePage(0)">Voltar para Home</button>
    `
    quizz = [];
    questions = [];
    correctAnswers = [];
    qtyCorrectChoices = 0;
    getQuizz(id)
}

function getQuizz(id) {
    const promise = axios.get('https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes' + `/${id}`);
    promise.then(listQuizz);
    promise.catch(alertError);
}

function listQuizz(response) {
    quizz = response.data;
    questions = quizz.questions;
    renderBanner();
    renderQuestions();
}

function alertError() {
    alert("Houve um erro ao carregar este quizz");
}

function renderBanner() {
    let banner = document.querySelector(".banner");
    banner.innerHTML = "";

    banner.style.backgroundImage = `
    linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${quizz.image})
    `;
    banner.innerHTML += ` <h2 class="quizz-name">${quizz.title}</h2>`
}

function renderQuestions() {
    let questionsQuizz = document.querySelector(".questions");
    questionsQuizz.innerHTML = ""

    let alternative = [];
    let stringAlternatives = ""
    let altId = 0;
    for (let i = 0; i < questions.length; i++) {
        alternative = [];
        for (let x = 0; x < questions[i].answers.length; x++) {
            alternative.push(x)
        }
        alternative = alternative.sort(shuffleAlternatives);
        stringAlternatives = "";
        for (let j = 0; j < alternative.length; j++, altId++) {
            stringAlternatives += `<div class="alternative" data-identifier="answer" onclick="selectAnswer(this)" id="${altId}">
                <img class="alternative-image clickable" src="${questions[i].answers[alternative[j]].image}">
                <span class="alternative-name">${questions[i].answers[alternative[j]].text}</span>
            </div>
            `
            correctAnswers.push(questions[i].answers[alternative[j]].isCorrectAnswer);
        }
        questionsQuizz.innerHTML += `
        <section class="option" data-identifier="question">
            <h3 class="question-text">${questions[i].title}</h3>
            <div class="alternatives">
                ${stringAlternatives}
            </div>
        </section>
        `     
    }

    let titles = document.querySelectorAll(".question-text");

    for (i = 0; i < titles.length; i++) {
        titles[i].style.backgroundColor = `${questions[i].color}`
    }

    removeLoadScreen()
}

function shuffleAlternatives() { 
	return Math.random() - 0.5; 
}

function selectAnswer(choice) {
    let alternativesByQuestion = choice.parentNode;
    let options = alternativesByQuestion.querySelectorAll(".alternative");

    if (alternativesByQuestion.classList.contains("answered")) {
        return;
    }
    for (let i = 0; i < options.length; i++) {
        options[i].classList.add("unchosen");
        alternativesByQuestion.classList.add("answered")
    }
    choice.classList.remove("unchosen");
    verifyAnswer(options, choice);
    setTimeout(autoScroll, 2000, getCurrentQuestionIndex(choice));
}

function verifyAnswer(options, choice) {
    options.forEach(option => {
        if (correctAnswers[option.id]){
            option.classList.add("correct");
            if (option.id === choice.id){
                qtyCorrectChoices++;
            }
        }else{
            option.classList.add("wrong");
        }
    });
}

function calcScore() {
    return ((qtyCorrectChoices / questions.length) * 100).toFixed(0);
}

function getCurrentQuestionIndex(choice) {
    let DOMQuestions = document.querySelectorAll(".option");
    let option = choice.parentNode.parentNode;
    for (i = 0; i < DOMQuestions.length; i++) {
        if (DOMQuestions[i] === option) {
            return i;
        }
    }
}

function autoScroll(currentIndex) {
    let DOMQuestions = document.querySelectorAll(".option");
    for (let i = currentIndex; i < DOMQuestions.length + currentIndex; i++) {
        if (!DOMQuestions[i % (DOMQuestions.length)].lastElementChild.classList.contains("answered")) {
            DOMQuestions[i % (DOMQuestions.length)].scrollIntoView({block:"center", behavior:"smooth"});
            return;
        }
    }
    renderResult();
    document.querySelector(".results").scrollIntoView({block:"center", behavior:"smooth"});
}

function renderResult() {
    const results = document.querySelector(".results");
    const score = calcScore();
    const level = selectLevel(score);
    results.innerHTML = `<h3 class="results-title">${score}% de acerto: ${level.title}</h3>
    <img class="results-image" src="${level.image}">
    <p class="results-text">${level.text}</p>
    `
}

function selectLevel(score) {
    let currentMin = 0;
    let currentIndex = 0;
    quizz.levels.forEach((level, index) => {
        if (level.minValue <= score && level.minValue >= currentMin){
            currentMin = level.minValue;
            currentIndex = index;
        }
    });
    return quizz.levels[currentIndex];
}