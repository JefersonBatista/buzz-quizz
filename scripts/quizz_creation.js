const blank_text = text => text.trim().length === 0;

// Validate URL
function valid_URL(URL) {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
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
    const info_entry = document.querySelector(".basic-info .entry");

    const title = info_entry.querySelector(".title").value.trim();
    const image_URL = info_entry.querySelector(".image-URL").value.trim();
    const num_questions = parseInt(info_entry.querySelector(".num-questions").value.trim());
    const num_levels = parseInt(info_entry.querySelector(".num-levels").value.trim());

    // Alert user if some input is invalid
    const valid_info = 
        title.length >= 20 &&
        title.length <= 65 &&
        valid_URL(image_URL) &&
        num_questions >= 3 &&
        num_levels >= 2;

    if (valid_info) {
        go_to_questions();
    } else {
        alert("Insira os dados corretamente.");
    }
}

function go_to_questions() {
    // Hide basic info entry
    const basic_info = document.querySelector(".basic-info");
    basic_info.classList.add("hidden");

    // Show questions entry
    const questions = document.querySelector(".questions");
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
    const questions = Array.from(document.querySelectorAll(".questions .question"));
    
    // No invalid questions must be present
    const valid_questions = questions
        .filter(q => !valid_question(q))
        .length === 0;

    // Alert user if some question is invalid
    if (valid_questions) {
        alert("Tudo certo por aqui.");
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
