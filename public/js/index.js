document.addEventListener('DOMContentLoaded', function() {
    console.log('running');
    let open = document.querySelector('.navbar--icon');
    let menu = document.querySelector('.nav--open');
    let menu2 = document.querySelector('.nav--open2');
    let close = document.querySelector('.nav--open-icon');
    let close2 = document.querySelector('.nav--open-icon2');
    let open1 = document.querySelector('.services_dropdown');
    let navbarContainer = document.querySelector('.navbar--container');
    open.addEventListener('click', function() {
      menu.classList.toggle('close');
      navbarContainer.style.display = 'none';
    });
    
    close.addEventListener('click', function() {
      menu.classList.toggle('close');
      navbarContainer.style.display = 'block';
    });
    
    open1.addEventListener('click', function() {
      menu2.classList.toggle('close');
      navbarContainer.style.display = 'none';
    });
    
    close2.addEventListener('click', function() {
      menu2.classList.toggle('close');
    });

    var video = document.getElementById('porsche-video');
    var button = document.getElementById('stopButton');
    var icon = document.getElementById('icon');
    var muteButton = document.getElementById('muteButton');
    
   
    video.addEventListener('play', function() {
        icon.classList.remove('fa-play'); 
        icon.classList.add('fa-pause');
    });
    
    video.addEventListener('pause', function() {
        icon.classList.remove('fa-pause'); 
        icon.classList.add('fa-play');
    });
    
    button.addEventListener('click', function() {
        if (video.paused) {
            video.play(); 
        } else {
            video.pause(); 
        }
    });
});
