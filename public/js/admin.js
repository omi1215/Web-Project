document.addEventListener('DOMContentLoaded', async function () {



    // Your other DOM-related code here...
    document.getElementById('cuser').onclick = function () {
        window.location.href = '/signup';
    };

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
        fetch("/admin/updateUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                const errm=document.getElementById('showmwssage');
                errm.innerHTML='';
                errm.innerHTML=" Updated user";
                return response.json();
            } else if (response.status === 400) {
                const errm=document.getElementById('showmwssage');
                errm.innerHTML='';
                errm.innerHTML="Failed to Update user";
                return response.json();
            } else {
                throw new Error('Failed to update user');
            }
        })
        .then(data => {
            console.log("Success:", data);
            // Do something with the response if needed
            if (data.message) {
                // Display an alert if user already exists
                alert(data.message);
            }
        })
        .catch(error => {
            console.error("Error:", error);
            // Handle errors
        });
    });
// Assuming delform is your delete user form element
const delform = document.getElementById('delform');

// Add event listener for form submission
delform.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const formData = new FormData(delform);
    const data = {};
    formData.forEach(function(value, key) {
        data[key] = value;
    });

    // Make a POST request to your API endpoint
    fetch("/admin/deleteuser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete user');
        }
        if(response.status===200)
            {
                console.log("user deleted ");
            }
        // If the response is okay (status 200), the user is deleted successfully
        // You can choose not to handle the success response, so the page won't clear
        // Optionally, you can do something here if needed
    })
    .then(data=>{
        console.log("Success:", data);
    })
    .catch(error => {
        console.error("Error:", error);
        // Handle errors
    });
});


const delcarform = document.getElementById('delcarform');

// Add event listener for form submission
delcarform.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const formData = new FormData(delcarform);
    const data = {};
    formData.forEach(function(value, key) {
        data[key] = value;
    });

    // Make a POST request to your API endpoint
    fetch("/admin/deletecar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete car');
        }
        if(response.status===200)
            {
                console.log("Car deleted ");
            }
        // If the response is okay (status 200), the car is deleted successfully
        // You can choose not to handle the success response, so the page won't clear
        // Optionally, you can do something here if needed
    })
    .then(data=>{
        console.log("Success:", data);
    })
    .catch(error => {
        console.error("Error:", error);
        // Handle errors
    });
});

       
});




