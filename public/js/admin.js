document.addEventListener('DOMContentLoaded', async function () {



    // Your other DOM-related code here...
    document.getElementById('cuser').onclick = function () {
        window.location.href = '/signup';
    };

    const updateUserBtn = document.getElementById('updateUserBtn');
    // Select the "editContent" div
    const editContent = document.getElementById('editContent');
    // Select the template
    const editTemplate = document.getElementById('editTemplate');
    const editshowuser = document.getElementById('editshowuser');
    const showUserBtn = document.getElementById('showUserBtn');
    const editdeluserBtn = document.getElementById('delUserBtn');
    const editdeluser = document.getElementById('editdeluser');
    editdeluserBtn.addEventListener('click', function () {
        const clone = document.importNode(editdeluser.content, true);
        editContent.innerHTML = '';
        editContent.appendChild(clone);
    })
    showUserBtn.addEventListener('click', function () {
        // Export users data
        const clone = document.importNode(editshowuser.content, true);
        editContent.innerHTML = '';
        editContent.appendChild(clone);
    });

    // Add click event listener to the "Update User" button
    updateUserBtn.addEventListener('click', function () {
        // Clone the content of the template
        const clone = document.importNode(editTemplate.content, true);
        // Append the cloned content to the "editContent" div
        editContent.innerHTML = '';
        editContent.appendChild(clone);
    });

    const editForm = document.getElementById("updateform");


    editForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        // Collect form data
        const formData = new FormData(editForm);
        const data = {};
        formData.forEach(function (value, key) {
            data[key] = value;
        });

        // Make a POST request to your API endpoint
        fetch("/admin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Success:", data);
            // Do something with the response if needed
        })
        .catch(error => {
            console.error("Error:", error);
            // Handle errors
        });
    });
});
