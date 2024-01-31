

var formLog=document.querySelector(".form-log");
console.log(formLog);

var button = document.querySelector("nav #btn1");
console.log(button);

var register=document.querySelector(".register-div");
console.log(register);

var registerbtn=document.querySelector("nav #btn2");
console.log(registerbtn);

var TextRegister=document.querySelector("h3");
console.log(TextRegister);

var TextLogin=document.querySelector("h2");
console.log(TextLogin);
TextLogin.innerText='';

 
var forgotpass = document.querySelector("div #code");
console.log(forgotpass);

var formForgot = document.querySelector("div .forgot");
console.log(formForgot);

var TextForget = document.querySelector("h4").innerText;
console.log(TextForget);



  registerbtn.addEventListener("click", (e) => {
    console.log(e);
    if (register.style.display === 'none') {
      formLog.style.display = 'none';
      TextLogin.innerText='';
      TextRegister.innerText="Register Now";
      register.style.display = 'block';
      formForgot.style.display = 'none';
    } else {
      TextLogin.innerText='';
      TextRegister.innerText="Register Now";
      register.style.display = 'none';
      formLog.style.display = 'none';
      formForgot.style.display = 'none';
    }
  
  });
  
  

  button.addEventListener("click", () => {

   if (formLog.style.display === 'none') {
     formLog.style.display = 'block';
     TextLogin.innerText='Make a Log In';
     TextRegister.innerText= " ";
     register.style.display = 'none';
     formForgot.style.display = 'none';
   }  else {
     TextRegister.innerText= " ";
     TextLogin.innerText='Make a Log In';
     formLog.style.display = 'none'; 
     register.style.display = 'none';
     formForgot.style.display = 'none';
   }

  });
  


  var link=document.querySelector('.list-child:nth-of-type(3) ');
  console.log(link);
  
  var submit=document.querySelector('.login input[type="submit"]');


  var username = document.getElementById("email").value;
  console.log(username);
  var password = document.getElementById("password").value;
  console.log(password);


submit.addEventListener("click", (event) => {
  console.log(event);
  CheckData();
});
console.log(submit);
     

function CheckData(){
  var username = document.getElementById("email").value;
  console.log(username);
  var password = document.getElementById("password").value;
  console.log(password);

  if (localStorage.getItem("dataArray") !== null) {
    var users = JSON.parse(localStorage.getItem('dataArray'));
    console.log(users);
  
      for (var i=0; i<users.length; i++){
        console.log(users);
        if (username == users[i].email && password == users[i].password) {
      
            alert("Login Successful");
            changeFormAction();  
            break;
        }else{
          alert("user do not exist");
          alert("Make a register");
          registerbtn.onclick = function() {
               if (register.style.display === 'none') {
                     formLog.style.display = 'none';
                     register.style.display = 'block';
                    } else {
                formLog.style.display = 'none';
                register.style.display = 'block';
                    }
            }  
        }  
        break;  
  }
  }
  
}; 


var givepass =  document.querySelector(' #forget input');
  console.log(givepass);
  
  givepass.addEventListener("click",(e) =>{
    console.log(e);
      GivePass();
  });


  

function GivePass(){
  var user_pass = document.getElementById("mail").value;
  console.log(user_pass);
   var  useres = JSON.parse(localStorage.getItem("dataArray"));
   if (useres.length){
    for (var i=0; i<useres.length; i++){
      if (user_pass == useres[i].email){
        var sum = 0; 
        for (var j=0; j<6; j++){
          var code= Math.floor(Math.random()*10);
          sum = code +sum;
             }
        alert("The code is " + sum);
        
       }else if (user_pass = ""){
          alert("type your email");
           alert("write your correct email");
          
        }else{
          alert("make a register");
        
        }
        break;
      }
   
   }
};
var action2=document.querySelector(".Forgot-form form");
console.log(action2);
function changeFormForgot() {
  action2.getAttribute("action");
 action2.setAttribute("action","project1.html");
  return action2;
}

var action1=document.querySelector("div .register-form");  
console.log(action1);
var action=document.querySelector(".form-log form");
console.log(action);


function changeFormAction() {
  action.getAttribute("action");
 action.setAttribute("action","project1.html");
  return action;
}
 // Change the action attribute to the desired URL
function changeAction(){
 action1.getAttribute("action");
  action1.setAttribute("action","project1.html");
  return action1;
}




function addData() { 
   var namereg=document.querySelector(" .name").value;
  console.log(namereg);
  var surname=document.querySelector(" .surname").value;
  console.log(surname);

  var emailreg=document.querySelector(" .email").value;
  console.log(emailreg);
  var passwordreg=document.querySelector(" .pass").value;
  console.log(passwordreg);
  
    var new_entry = 
      {name: namereg,
      surname : surname,
      email: emailreg,
      password: passwordreg 
    };
  
   
    
      var new_array= JSON.parse(localStorage.getItem("dataArray") || "[]");
      new_array.push(new_entry);
      localStorage.setItem("dataArray", JSON.stringify(new_array));

    if  (emailreg=="" || namereg=="" || surname=="" || passwordreg==""){
      alert("Please fill it out");
      return  false;
    }else{
      
     
      for (var j=0; j<new_array.length;j++){
        console.log(new_array.includes(emailreg));
        if (emailreg  == new_array[j].email){
          alert('User already exist');
          new_array.pop();
          break;
          
        } else if (passwordreg == new_array[j].password){
            alert('this password already exist');
           break;
            
        }else{ 
         
         
          alert("succesfull register");
          console.log(new_array);
          changeAction(); 
          break;
       }   
    }
  }
};   


  

forgotpass.addEventListener("click", (e) => {
    console.log(e);
    if ( formForgot.style.display === 'none') {
      formLog.style.display = 'none';
      TextLogin.innerText='';
      TextRegister.innerText=" ";
      formForgot.style.display = 'block';
      TextForget.innerText="Ask a Password";
      register.style.display = 'none';
    } else {
      formLog.style.display = 'none';
      TextLogin.innerText='';
      TextRegister.innerText=" ";
      formForgot.style.display = 'block';
      TextForget.innerText="Ask a Password";
      register.style.display = 'none';
    }
  
});
  
