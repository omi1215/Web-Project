document.addEventListener('DOMContentLoaded', async function() {
    // Your other DOM-related code here...
    document.getElementById('cuser').onclick = function() {
        window.location.href = '/signup';
    };

    const updateUserBtn = document.getElementById('updateUserBtn');
    // Select the "editContent" div
    const editContent = document.getElementById('editContent');
    // Select the template
    const editTemplate = document.getElementById('editTemplate');
    const editshowuser = document.getElementById('editshowuser');
    const showUserBtn = document.getElementById('showUserBtn');
    const editdeluserBtn=document.getElementById('delUserBtn');
    const editdeluser=document.getElementById('editdeluser');
    editdeluserBtn.addEventListener('click',function(){
        const clone = document.importNode(editdeluser.content, true);
        editContent.innerHTML = '';
        editContent.appendChild(clone);
    })
    showUserBtn.addEventListener('click', function() {
        // Export users data
        const clone = document.importNode(editshowuser.content, true);
        editContent.innerHTML = '';
        editContent.appendChild(clone);
    });

    // Add click event listener to the "Update User" button
    updateUserBtn.addEventListener('click', function() {
        // Clone the content of the template
        const clone = document.importNode(editTemplate.content, true);
        // Append the cloned content to the "editContent" div
        editContent.innerHTML = '';
        editContent.appendChild(clone);
    });

});
