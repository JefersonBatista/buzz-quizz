// Validate number of chars of title
function title_validation(title) {
    const num_chars = title.length;
    return num_chars >= 20 && num_chars <= 65;
}

// Validate image URL
function URL_validation(URL) {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

    return pattern.test(URL);
}

function validate_basic_info() {
    const info_entry = document.querySelector(".info-entry");
    const title = info_entry.querySelector(".title").value;
    const image_URL = info_entry.querySelector(".image-URL").value;
    const num_questions = parseInt(info_entry.querySelector(".num-questions").value);
    const num_levels = parseInt(info_entry.querySelector(".num-levels").value);

    // Alert user if some input is invalid
    const info_is_valid = 
        title_validation(title) &&
        URL_validation(image_URL) &&
        num_questions >= 3 &&
        num_levels >= 2;

    if (info_is_valid) {
        alert("Tudo certo pra prosseguir.");
    } else {
        alert("Insira os dados corretamente");
    }
}
