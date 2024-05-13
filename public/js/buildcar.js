// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Define a global variable to store the selected rim value
    var globalselectedrim = '18" Boxter Wheels';
    var globalselectedcolor = "white";

    // Get all elements with class "rims" and attach a click event listener
    const whitecolor = document.getElementById('whitecolor');
    const blackcolor = document.getElementById('blackcolor');
    const yellowcolor = document.getElementById('yellowcolor');
    const redcolor = document.getElementById('redcolor');

    const boxter1 = document.getElementById('boxter1');
    const cayman1 = document.getElementById('cayman1');
    const boxter2 = document.getElementById('boxter2');
    const carera = document.getElementById('carera');
    const carName=document.getElementById('car-name');
    const carprice=document.getElementById('car-price');
    const price=carprice.getAttribute('value');
    const car=carName.getAttribute('value');
    whitecolor.addEventListener('click', function () {
        globalselectedcolor = "white";
    });
    blackcolor.addEventListener('click', function () {
        globalselectedcolor = "blackcolor";
    });

    yellowcolor.addEventListener('click', function () {
        globalselectedcolor = "yellowcolor";
    });
    redcolor.addEventListener('click', function () {
        globalselectedcolor = "redcolor";
    });
    boxter1.addEventListener('click', function () {
        globalselectedrim = "boxter1";
    });
    cayman1.addEventListener('click', function () {
        globalselectedrim = "cayman1";
    });
    boxter2.addEventListener('click', function () {
        globalselectedrim = "boxter2";
    });
    carera.addEventListener('click', function () {
        globalselectedrim = "carera";
    });

    // Add event listener to the button
    document.getElementById('buycar').addEventListener('click', function () {
        // Data to send to the server
        var requestData = {
            selectedrim: globalselectedrim,
            selectedcolor: globalselectedcolor,
            name:car,
            price:price,
        };

        // Make an AJAX request to the server using POST method
        fetch('/buildcar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData) // Convert data to JSON string
        })
        .then(response => {
            // Check if the response status is a redirect (3xx)
            if (response.redirected) {
                // Redirect to the location provided by the server
                window.location.href = response.url;
            } else {
                // Handle the response data if needed
                console.log('Data received successfully:', response);
                // Redirect to a success page or update UI accordingly
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Handle errors, display an error message, or retry the request
        });
        
    });

});
