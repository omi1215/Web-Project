const express=require('express')
const app=express()
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formObject = {};

    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    try {
        const response = await fetch('/email_verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        });

        if (!response.ok) {
            throw new Error('Failed to submit form');
        }

    } catch (error) {
        console.error('Error:', error.message);
        alert('An error occurred while signing up');
    }
});

 