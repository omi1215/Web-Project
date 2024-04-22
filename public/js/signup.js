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
        document.getElementById('signupForm').addEventListener('submit', async (e) => {
            e.preventDefault();
        
            const formData = new FormData(e.target);
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
        
                if (data.first_name && data.last_name) {
                    console.log('Received First Name:', data.first_name);
                    console.log('Received Last Name:', data.last_name);
                    alert(`${data.first_name} ${data.last_name}, welcome to the Porsche Club!`);
                } else {
                    console.log('First Name or Last Name not provided by server');
                }
        
                alert(data.message);
            } catch (error) {
                console.error('Error:', error.message);
                alert('An error occurred while signing up');
            }
        });
        
    } else {
        form.querySelectorAll(':invalid').forEach((elem) => {
            elem.classList.add('is-invalid');
        });
    }
}


