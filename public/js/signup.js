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

async function submitForm(e) {
    e.preventDefault();

    const form = document.getElementById('signupForm');
    if (!form.checkValidity()) {
        form.querySelectorAll(':invalid').forEach(elem => {
            elem.classList.add('is-invalid');
        });
        return;
    }

    const formData = new FormData(form);
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        });

        if (!response.ok) {
            throw new Error('Failed to submit form');
        }

        const data = await response.json();
        console.log('Server Response:', data);
        
        if (data.success) {
            if (data.redirectTo === '/email_verify') {
                window.location.href = data.redirectTo;
            } else {
                console.error('Unknown redirection:', data.redirectTo);
            }
        } else {
            console.error('Registration failed');
            alert('Registration Failed.');
        }

    } catch (error) {
        console.error('Error:', error.message);
        alert('Registeration Failed Try using another email.');
        window.location.reload(); // Reload the page after alerting failed submission
    }
}

document.getElementById("salutation").addEventListener("change", toggleTitleInput);
document.getElementById('signupForm').addEventListener('submit', submitForm);
