let new_quizz = {};
let num_questions;
let num_levels;

function question_to_json(question) {
    let json_question = {};

    json_question.title = question.querySelector(".text").value.trim();
    json_question.color = question.querySelector(".background").value.trim();

    // Add answers
    json_question.answers = [];

    // Add correct answer
    const correct_answer = question.querySelector(".correct-answer");
    json_question.answers.push(answer_to_json(correct_answer, true));

    // Add incorrect answers
    const incorrect_answers = Array.from(
        question.querySelectorAll(".incorrect-answer")
    );
    incorrect_answers.filter(a => !blank_answer(a)).forEach(answer => {
        json_question.answers.push(answer_to_json(answer, false));
    });

    return json_question;
}

function answer_to_json(answer, correct) {
    let json_answer = {};

    json_answer.text = answer.querySelector(".text").value.trim();
    json_answer.image = answer.querySelector(".image").value.trim();
    json_answer.isCorrectAnswer = correct;

    return json_answer;
}

function level_to_json(level) {
    let json_level = {};

    json_level.title = level.querySelector(".title").value.trim();
    json_level.minValue = parseInt(level.querySelector(".min-value").value.trim());
    json_level.image = level.querySelector(".image").value.trim();
    json_level.text = level.querySelector(".description").value.trim();

    return json_level;
}

const blank_text = text => text.trim().length === 0;

// Validate URL
function valid_URL(URL) {
    const pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    
    const test = pattern.test(URL);
    console.log("URL test: " + test);
    return test;
}

// Validate hexadecimal code
function valid_hex(code) {
    const hex_digits = "0123456789abcdefABCDEF";
    const digits_array = Array.from(code.slice(1));
    
    const valid_hex =
        code[0] === "#" &&
        digits_array.length === 6 &&

        // Filter invalid digits. No one must be present
        digits_array
            .filter(d => !hex_digits.includes(d))
            .length === 0;

    console.log("hex test: " + valid_hex);
    return valid_hex;
}

function validate_basic_info() {
    const info_entry = document.querySelector(".quizz-creation .basic-info .entry");

    const title = info_entry.querySelector(".title").value.trim();
    const image_URL = info_entry.querySelector(".image-URL").value.trim();
    num_questions = parseInt(info_entry.querySelector(".num-questions").value.trim());
    num_levels = parseInt(info_entry.querySelector(".num-levels").value.trim());

    // Alert user if some input is invalid
    const valid_info = 
        title.length >= 20 && title.length <= 65 &&
        valid_URL(image_URL) &&
        num_questions >= 3 &&
        num_levels >= 2;

    if (valid_info) {
        // Add basic info to new quizz
        new_quizz.title = title;
        new_quizz.image = image_URL;

        go_to_questions();
    } else {
        alert("Insira os dados corretamente.");
    }
}

function go_to_questions() {
    // Hide basic info entry
    const basic_info = document.querySelector(".quizz-creation .basic-info");
    basic_info.classList.add("hidden");

    // Show questions entry
    const questions = document.querySelector(".quizz-creation .questions");
    questions.classList.remove("hidden");

    // Fill question list
    const question_list = questions.querySelector(".list");
    question_list.innerHTML = question_html(1, true);
    for(let i = 2; i <= num_questions; i++) {
        question_list.innerHTML += question_html(i, false);
    }

    window.scrollTo(0, 0);
}

const valid_answer = answer => {
    const text = answer.querySelector(".text").value.trim();
    const image_URL = answer.querySelector(".image").value.trim();

    return text.length > 0 && valid_URL(image_URL);
}

const blank_answer = answer => {
    const text = answer.querySelector(".text").value;
    const image_URL = answer.querySelector(".image").value;

    return blank_text(text) && blank_text(image_URL);
}

function validate_questions() {
    const questions = Array.from(
        document.querySelectorAll(".quizz-creation .questions .question")
    );
    
    // No invalid questions must be present
    const valid_questions = questions
        .filter(q => !valid_question(q))
        .length === 0;

    // Alert user if some question is invalid
    if (valid_questions) {
        // Add questions to new quizz
        new_quizz.questions = [];
        questions.forEach(question => {
            new_quizz.questions.push(question_to_json(question));
        });

        go_to_levels();
    } else {
        alert("Insira os dados corretamente.");
    }
}

function valid_question(question) {
    const text = question.querySelector(".text").value.trim();
    const background = question.querySelector(".background").value.trim();
    const correct_answer = question.querySelector(".correct-answer");

    const incorrect_answers = Array.from(
        question.querySelectorAll(".incorrect-answer")
    );

    const filled_incorrect_answers = incorrect_answers
        .filter(a => !blank_answer(a));
    
    const valid_question = 
        text.length >= 20 &&
        valid_hex(background) &&
        valid_answer(correct_answer) &&
        
        // At least one filled incorrect answer
        filled_incorrect_answers.length > 0 &&

        // None invalid filled incorrect answer
        filled_incorrect_answers
            .filter(a => !valid_answer(a))
            .length === 0;

    return valid_question;
}

function go_to_levels() {
    // Hide questions entry
    const questions = document.querySelector(".quizz-creation .questions");
    questions.classList.add("hidden");

    // Show levels entry
    const levels = document.querySelector(".quizz-creation .levels");
    levels.classList.remove("hidden");

    // Fill level list
    const level_list = levels.querySelector(".list");
    level_list.innerHTML = level_html(1, true);
    for(let i = 2; i <= num_levels; i++) {
        level_list.innerHTML += level_html(i, false);
    }

    window.scrollTo(0, 0);
}

function validate_levels() {
    const levels = Array.from(
        document.querySelectorAll(".quizz-creation .levels .level")
    );

    // No invalid levels must be present
    const valid_levels = levels
        .filter(l => !valid_level(l))
        .length === 0 &&

    // At least one "zero level"
    levels.filter(zero_level).length > 0;

    // Alert user if some level is invalid
    if (valid_levels) {
        // Add levels to new quizz
        new_quizz.levels = [];
        levels.forEach(level => {
            new_quizz.levels.push(level_to_json(level));
        });

        const creation_promise = axios.post(
            "https://mock-api.driven.com.br/api/v4/buzzquizz/quizzes",
            new_quizz
        );

        creation_promise
            .then(quizz_successfully_created)
            .catch(({ response }) => {
                alert("Os dados foram validados, mas algo deu errado na criação do quizz.");
                console.dir(response.data);
            });
    } else {
        alert("Insira os dados corretamente.");
    }
}

function valid_level(level) {
    console.log('Is valid level?');

    const title = level.querySelector(".title").value.trim();
    const min_value = parseInt(level.querySelector(".min-value").value.trim());
    const image_URL = level.querySelector(".image").value.trim();
    const description = level.querySelector(".description").value.trim();

    const valid_level =
        title.length >= 10 &&
        min_value >= 0 && min_value <= 100 &&
        valid_URL(image_URL) &&
        description.length >= 30;

    return valid_level;
}

function zero_level(level) {
    console.log('Is "zero level"?');
    const min_value = parseInt(level.querySelector(".min-value").value.trim());
    console.log(min_value === 0);
    return min_value === 0;
}

function quizz_successfully_created({ data }) {
    console.log("Quizz successfully created!");
    console.dir(data);

    const created_quizz = document.querySelector(".quizz-creation .created-quizz");
    const image_div = created_quizz.querySelector(".image-div");
    const title = created_quizz.querySelector(".title");

    image_div.innerHTML += new_quizz_image_html();
    title.innerHTML += new_quizz_title_html();

    go_to_success();
}

function go_to_success() {
    // Hide levels entry
    const levels = document.querySelector(".quizz-creation .levels");
    levels.classList.add("hidden");

    // Show success screen
    const success = document.querySelector(".quizz-creation .success");
    success.classList.remove("hidden");

    window.scrollTo(0, 0);
}

function question_html(index, current) {
    return `
        <article class="question ${current ? "current" : ""}">
            <!-- Show it when question is collapsed (not current) -->
            <div class="collapsed ${current ? "hidden" : ""}">
                <h3>Pergunta ${index}</h3>
                <i class="far fa-edit" onclick="edit_question(this.parentElement.parentElement)"></i>
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

function level_html(index, current) {
    return `
        <article class="level ${current ? "current" : ""}">
            <!-- Show it when level is collapsed (not current) -->
            <div class="collapsed ${current ? "hidden" : ""}">
                <h3>Nível ${index}</h3>
                <i class="far fa-edit" onclick="edit_level(this.parentElement.parentElement)"></i>
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

function edit_question(question) {
    // Collapse previous editing question
    const questions = document.querySelector(".quizz-creation .questions");
    const prev_question = questions.querySelector(".current");

    const prev_question_collapsed = prev_question.querySelector(".collapsed");
    prev_question_collapsed.classList.remove("hidden");
    const prev_question_editing = prev_question.querySelector(".editing");
    prev_question_editing.classList.add("hidden");
    prev_question.classList.remove("current");

    // Show this question editing
    const question_collapsed = question.querySelector(".collapsed");
    question_collapsed.classList.add("hidden");
    const question_editing = question.querySelector(".editing");
    question_editing.classList.remove("hidden");
    question.classList.add("current");

    question.scrollIntoView({block: "start"});

    // Because of top bar
    window.scrollBy(0, -89);
}

function edit_level(level) {
    // Collapse previous editing level
    const levels = document.querySelector(".quizz-creation .levels");
    const prev_level = levels.querySelector(".current");

    const prev_level_collapsed = prev_level.querySelector(".collapsed");
    prev_level_collapsed.classList.remove("hidden");
    const prev_level_editing = prev_level.querySelector(".editing");
    prev_level_editing.classList.add("hidden");
    prev_level.classList.remove("current");

    // Show this question editing
    const level_collapsed = level.querySelector(".collapsed");
    level_collapsed.classList.add("hidden");
    const level_editing = level.querySelector(".editing");
    level_editing.classList.remove("hidden");
    level.classList.add("current");

    level.scrollIntoView({block: "start"});

    // Because of top bar
    window.scrollBy(0, -89);
}

function new_quizz_image_html() {
    return `
        <img src=${new_quizz.image} alt="Imagem do quizz" />
    `;
}

function new_quizz_title_html() {
    return `
        ${new_quizz.title}
    `;
}
