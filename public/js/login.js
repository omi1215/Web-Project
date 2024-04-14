function validateForm() {
    var form = document.getElementById("signinform");
    if (form.checkValidity()) {
        window.location.href = "/index";
    } else {
        form.querySelectorAll(':invalid').forEach((elem) => {
            elem.classList.add('is-invalid');
        });
    }
}
