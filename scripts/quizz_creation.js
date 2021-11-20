let new_quizz = {};

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
    const incorrect_answers = question.querySelectorAll(".incorrect-answers");
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
    const hex_digits = "0123456789abcdef";
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
    const num_questions = parseInt(info_entry.querySelector(".num-questions").value.trim());
    const num_levels = parseInt(info_entry.querySelector(".num-levels").value.trim());

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
        question.querySelectorAll(".incorrect-answers")
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

        go_to_success();
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

function go_to_success() {
    // Hide levels entry
    const levels = document.querySelector(".quizz-creation .levels");
    levels.classList.add("hidden");

    // Show success screen
    const success = document.querySelector(".quizz-creation .success");
    success.classList.remove("hidden");

    console.dir(new_quizz);
}
