

// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Define a global variable to store the selected rim value
    var globalselectedrim = '18" Boxter Wheels';
    var globalselectedcolor="white";
    const totalbill=document.getElementById('totalbill');
    
    // Get all elements with class "rims" and attach a click event listener
    const whitecolor=document.getElementById('whitecolor');
    const blackcolor=document.getElementById('blackcolor');
    const yellowcolor=document.getElementById('yellowcolor');
    const redcolor=document.getElementById('redcolor');

    const boxter1=document.getElementById('boxter1');
    const cayman1=document.getElementById('cayman1');
    const boxter2=document.getElementById('boxter2');
    const carera=document.getElementById('carera');


    whitecolor.addEventListener('click',function(){
        globalselectedcolor="white";
    })
    blackcolor.addEventListener('click',function(){
        globalselectedcolor="blackcolor";
    })
    
    yellowcolor.addEventListener('click',function(){
        globalselectedcolor="yellowcolor";
    })
    redcolor.addEventListener('click',function(){
        globalselectedcolor="redcolor";
    })
    boxter1.addEventListener('click',function(){
        globalselectedrim="boxter1";
    })
    cayman1.addEventListener('click',function(){
        globalselectedrim="cayman1";
    })
    boxter2.addEventListener('click',function(){
        globalselectedrim="boxter2";
    })
    carera.addEventListener('click',function(){
        globalselectedrim="carera";
    })
    

  });
  