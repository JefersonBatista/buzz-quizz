let newQuizz = {};
let newQuizzId;
let numQuestions;
let numLevels;

function questionToJson(question) {
    let jsonQuestion = {};

    jsonQuestion.title = question.querySelector(".text").value.trim();
    jsonQuestion.color = question.querySelector(".background").value.trim();

    // Add answers
    jsonQuestion.answers = [];

    // Add correct answer
    const correctAnswer = question.querySelector(".correct-answer");
    jsonQuestion.answers.push(answerToJson(correctAnswer, true));

    // Add incorrect answers
    const incorrectAnswers = Array.from(
        question.querySelectorAll(".incorrect-answer")
    );
    incorrectAnswers.filter(a => !blankAnswer(a)).forEach(answer => {
        jsonQuestion.answers.push(answerToJson(answer, false));
    });

    return jsonQuestion;
}

function answerToJson(answer, correct) {
    let jsonAnswer = {};

    jsonAnswer.text = answer.querySelector(".text").value.trim();
    jsonAnswer.image = answer.querySelector(".image").value.trim();
    jsonAnswer.isCorrectAnswer = correct;

    return jsonAnswer;
}

function levelToJson(level) {
    let jsonLevel = {};

    jsonLevel.title = level.querySelector(".title").value.trim();
    jsonLevel.minValue = parseInt(level.querySelector(".min-value").value.trim());
    jsonLevel.image = level.querySelector(".image").value.trim();
    jsonLevel.text = level.querySelector(".description").value.trim();

    return jsonLevel;
}

const blankText = text => text.trim().length === 0;

// Validate URL
function validUrl(url) {
    const pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    
    const test = pattern.test(url);
    console.log("URL test: " + test);
    return test;
}

// Validate hexadecimal code
function validHex(code) {
    const hexDigits = "0123456789abcdefABCDEF";
    const digitsArray = Array.from(code.slice(1));
    
    const validHex =
        code[0] === "#" &&
        digitsArray.length === 6 &&

        // Filter invalid digits. No one must be present
        digitsArray
            .filter(d => !hexDigits.includes(d))
            .length === 0;

    console.log("hex test: " + validHex);
    return validHex;
}

function validateBasicInfo() {
    const infoEntry = document.querySelector(".quizz-creation .basic-info .entry");

    const title = infoEntry.querySelector(".title").value.trim();
    const imageUrl = infoEntry.querySelector(".image-URL").value.trim();
    numQuestions = parseInt(infoEntry.querySelector(".num-questions").value.trim());
    numLevels = parseInt(infoEntry.querySelector(".num-levels").value.trim());

    // Alert user if some input is invalid
    const validInfo = 
        title.length >= 20 && title.length <= 65 &&
        validUrl(imageUrl) &&
        numQuestions >= 3 &&
        numLevels >= 2;

    if (validInfo) {
        // Add basic info to new quizz
        newQuizz.title = title;
        newQuizz.image = imageUrl;

        goToQuestions();
    } else {
        alert("Insira os dados corretamente.");
    }
}

function goToQuestions() {
    // Hide basic info entry
    const basicInfo = document.querySelector(".quizz-creation .basic-info");
    basicInfo.classList.add("hidden");

    // Show questions entry
    const questions = document.querySelector(".quizz-creation .questions");
    questions.classList.remove("hidden");

    // Fill question list
    const questionList = questions.querySelector(".list");
    questionList.innerHTML = questionHtml(1, true);
    for(let i = 2; i <= numQuestions; i++) {
        questionList.innerHTML += questionHtml(i, false);
    }

    window.scrollTo(0, 0);
}

const validAnswer = answer => {
    const text = answer.querySelector(".text").value.trim();
    const imageUrl = answer.querySelector(".image").value.trim();

    return text.length > 0 && validUrl(imageUrl);
}

const blankAnswer = answer => {
    const text = answer.querySelector(".text").value;
    const imageUrl = answer.querySelector(".image").value;

    return blankText(text) && blankText(imageUrl);
}

function validateQuestions() {
    const questions = Array.from(
        document.querySelectorAll(".quizz-creation .questions .question")
    );
    
    // No invalid questions must be present
    const validQuestions = questions
        .filter(q => !validQuestion(q))
        .length === 0;

    // Alert user if some question is invalid
    if (validQuestions) {
        // Add questions to new quizz
        newQuizz.questions = [];
        questions.forEach(question => {
            newQuizz.questions.push(questionToJson(question));
        });

        goToLevels();
    } else {
        alert("Insira os dados corretamente.");
    }
}

function validQuestion(question) {
    const text = question.querySelector(".text").value.trim();
    const background = question.querySelector(".background").value.trim();
    const correctAnswer = question.querySelector(".correct-answer");

    const incorrectAnswers = Array.from(
        question.querySelectorAll(".incorrect-answer")
    );

    const filledIncorrectAnswers = incorrectAnswers
        .filter(a => !blankAnswer(a));
    
    const validQuestion = 
        text.length >= 20 &&
        validHex(background) &&
        validAnswer(correctAnswer) &&
        
        // At least one filled incorrect answer
        filledIncorrectAnswers.length > 0 &&

        // None invalid filled incorrect answer
        filledIncorrectAnswers
            .filter(a => !validAnswer(a))
            .length === 0;

    return validQuestion;
}

function goToLevels() {
    // Hide questions entry
    const questions = document.querySelector(".quizz-creation .questions");
    questions.classList.add("hidden");

    // Show levels entry
    const levels = document.querySelector(".quizz-creation .levels");
    levels.classList.remove("hidden");

    // Fill level list
    const levelList = levels.querySelector(".list");
    levelList.innerHTML = levelHtml(1, true);
    for(let i = 2; i <= numLevels; i++) {
        levelList.innerHTML += levelHtml(i, false);
    }

    window.scrollTo(0, 0);
}

function validateLevels() {
    const levels = Array.from(
        document.querySelectorAll(".quizz-creation .levels .level")
    );

    // No invalid levels must be present
    const validLevels = levels
        .filter(l => !validLevel(l))
        .length === 0 &&

    // At least one "zero level"
    levels.filter(zeroLevel).length > 0;

    // Alert user if some level is invalid
    if (validLevels) {
        // Add levels to new quizz
        newQuizz.levels = [];
        levels.forEach(level => {
            newQuizz.levels.push(levelToJson(level));
        });

        const creationPromise = axios.post(
            "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes",
            newQuizz
        );

        creationPromise
            .then(quizzSuccessfullyCreated)
            .catch(({ response }) => {
                alert("Os dados foram validados, mas algo deu errado na criação do quizz.");
                console.dir(response.data);
            });
    } else {
        alert("Insira os dados corretamente.");
    }
}

function validLevel(level) {
    console.log('Is valid level?');

    const title = level.querySelector(".title").value.trim();
    const minValue = parseInt(level.querySelector(".min-value").value.trim());
    const imageUrl = level.querySelector(".image").value.trim();
    const description = level.querySelector(".description").value.trim();

    const validLevel =
        title.length >= 10 &&
        minValue >= 0 && minValue <= 100 &&
        validUrl(imageUrl) &&
        description.length >= 30;

    return validLevel;
}

function zeroLevel(level) {
    console.log('Is "zero level"?');
    const minValue = parseInt(level.querySelector(".min-value").value.trim());
    console.log(minValue === 0);
    return minValue === 0;
}

function quizzSuccessfullyCreated({ data }) {
    console.log("Quizz successfully created!");
    console.dir(data);

    newQuizzId = data.id;

    // Store created quizz ID on user's machine
    let userQuizzIds = localStorage.getItem("userQuizzIds");

    if(!userQuizzIds) {
        userQuizzIds = JSON.stringify([]);
    }

    userQuizzIds = JSON.parse(userQuizzIds);
    userQuizzIds.push(newQuizzId);
    userQuizzIds = JSON.stringify(userQuizzIds);
    localStorage.setItem("userQuizzIds", userQuizzIds);

    // Add created quizz image-div to HTML
    const imageDiv = document.querySelector(".quizz-creation .created-quizz .image-div");
    imageDiv.innerHTML = newQuizzImageDivHtml();

    goToSuccess();
}

function goToSuccess() {
    // Hide levels entry
    const levels = document.querySelector(".quizz-creation .levels");
    levels.classList.add("hidden");

    // Show success screen
    const success = document.querySelector(".quizz-creation .success");
    success.classList.remove("hidden");

    window.scrollTo(0, 0);
}

function questionHtml(index, current) {
    return `
        <article class="question ${current ? "current" : ""}">
            <!-- Show it when question is collapsed (not current) -->
            <div class="collapsed ${current ? "hidden" : ""}">
                <h3>Pergunta ${index}</h3>
                <i class="far fa-edit" onclick="editQuestion(this.parentElement.parentElement)"></i>
            </div>

            <div class="editing ${current ? "" : "hidden"}">
                <div class="entry">
                    <h3>Pergunta ${index}</h3>
                    <input class="text" placeholder="Texto da pergunta" />
                    <input class="background" placeholder="Cor de fundo da pergunta" />
                </div>

                <div class="correct-answer entry">
                    <h3>Resposta correta</h3>
                    <input class="text" placeholder="Resposta correta" />
                    <input class="image" placeholder="URL da imagem" />
                </div>

                <!-- Incorrect answers -->
                <div class="incorrect-answer entry">
                    <h3>Respostas incorretas</h3>
                    <input class="text" placeholder="Resposta incorreta 1" />
                    <input class="image" placeholder="URL da imagem 1" />
                </div>

                <div class="incorrect-answer entry">
                    <input class="text" placeholder="Resposta incorreta 2" />
                    <input class="image" placeholder="URL da imagem 2" />
                </div>
                <div class="incorrect-answer entry">
                    <input class="text" placeholder="Resposta incorreta 3" />
                    <input class="image" placeholder="URL da imagem 3" />
                </div>
            </div>
        </article>
    `;
}

function levelHtml(index, current) {
    return `
        <article class="level ${current ? "current" : ""}">
            <!-- Show it when level is collapsed (not current) -->
            <div class="collapsed ${current ? "hidden" : ""}">
                <h3>Nível ${index}</h3>
                <i class="far fa-edit" onclick="editLevel(this.parentElement.parentElement)"></i>
            </div>

            <div class="editing ${current ? "" : "hidden"}">
                <div class="entry">
                    <h3>Nível ${index}</h3>
                    <input class="title" placeholder="Título do nível" />
                    <input class="min-value" placeholder="% de acerto mínima" />
                    <input class="image" placeholder="URL da imagem do nível" />
                    <textarea class="description" placeholder="Descrição do nível"></textarea>
                </div>
            </div>
        </article>
    `;
}

function editQuestion(question) {
    // Collapse previous editing question
    const questions = document.querySelector(".quizz-creation .questions");
    const prevQuestion = questions.querySelector(".current");

    const prevQuestionCollapsed = prevQuestion.querySelector(".collapsed");
    prevQuestionCollapsed.classList.remove("hidden");
    const prevQuestionEditing = prevQuestion.querySelector(".editing");
    prevQuestionEditing.classList.add("hidden");
    prevQuestion.classList.remove("current");

    // Show this question editing
    const questionCollapsed = question.querySelector(".collapsed");
    questionCollapsed.classList.add("hidden");
    const questionEditing = question.querySelector(".editing");
    questionEditing.classList.remove("hidden");
    question.classList.add("current");

    question.scrollIntoView({block: "start"});

    // Because of top bar
    window.scrollBy(0, -89);
}

function editLevel(level) {
    // Collapse previous editing level
    const levels = document.querySelector(".quizz-creation .levels");
    const prevLevel = levels.querySelector(".current");

    const prevLevelCollapsed = prevLevel.querySelector(".collapsed");
    prevLevelCollapsed.classList.remove("hidden");
    const prevLevelEditing = prevLevel.querySelector(".editing");
    prevLevelEditing.classList.add("hidden");
    prevLevel.classList.remove("current");

    // Show this question editing
    const levelCollapsed = level.querySelector(".collapsed");
    levelCollapsed.classList.add("hidden");
    const levelEditing = level.querySelector(".editing");
    levelEditing.classList.remove("hidden");
    level.classList.add("current");

    level.scrollIntoView({block: "start"});

    // Because of top bar
    window.scrollBy(0, -89);
}

function newQuizzImageDivHtml() {
    return `
        <img src=${newQuizz.image} alt="Imagem do quizz" />
        <div class="gradient-cover">
            <h4 class="title">
                ${newQuizz.title}
            </h4>
        </div>
    `;
}

function cleanUpAllFields() {
    const fields = Array.from(
        document.querySelectorAll(".quizz-creation input")
    );

    fields.forEach(field => {
        field.value = "";
    })
}

function resetQuizzCreation() {
    newQuizz = {};

    // Clean created quizz image-div
    const imageDiv = document.querySelector(".quizz-creation .created-quizz .image-div");
    imageDiv.innerHTML = "";

    cleanUpAllFields();

    const quizzCreation = document.querySelector(".quizz-creation");

    const basicInfo = quizzCreation.querySelector(".basic-info");
    basicInfo.classList.remove("hidden");

    const questions = quizzCreation.querySelector(".questions");
    questions.classList.add("hidden");

    const levels = quizzCreation.querySelector(".levels");
    levels.classList.add("hidden");

    const success = quizzCreation.querySelector(".success");
    success.classList.add("hidden");
}

function goToHome() {
    resetQuizzCreation();

    const home = document.querySelector(".home");
    home.classList.remove("hidden");

    const quizzGame = document.querySelector(".quizz-game");
    quizzGame.classList.add("hidden");

    const quizzCreation = document.querySelector(".quizz-creation");
    quizzCreation.classList.add("hidden");

    resetHome();
}

function goToCreatedQuizz() {
    goToHome();
    changePage(1, newQuizzId);
}
