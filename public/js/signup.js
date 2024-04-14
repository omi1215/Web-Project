function toggleTitleInput() {
    var salutation = document.getElementById("salutation").value;
    var titleSelect = document.getElementById("title");
    if (salutation === "dr") {
        titleSelect.options.namedItem("dr").disabled = false;
    } else {
        titleSelect.options.namedItem("dr").disabled = true;
        titleSelect.value = "none";
    }
}

function validateForm() {
    var salutation = document.getElementById("salutation").value;
    var firstName = document.getElementById("first-name").value;
    var lastName = document.getElementById("last-name").value;
    var form = document.getElementById("signupForm");
    if (form.checkValidity()) {
        alert(`${salutation} ${firstName} ${lastName}, welcome to the Porsche Club!`);
    } else {
        form.querySelectorAll(':invalid').forEach((elem) => {
            elem.classList.add('is-invalid');
        });
    }
}
