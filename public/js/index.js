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
});
