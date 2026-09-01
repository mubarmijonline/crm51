function onPassChange() {
    const password = document.querySelector('input[name=password-field]');
    const confirm = document.querySelector('input[name=password-checker]');
    if (confirm.value === password.value && confirm.value !== "" && password.value !== "") {
      confirm.setCustomValidity('');
      document.getElementById('submit-btn').disabled = false;
    } else {
      confirm.setCustomValidity('Passwords do not match !');
      confirm.reportValidity();
      document.getElementById('submit-btn').disabled = true;
    }
  }

function register_email(){
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const mobile = document.getElementById('mobile').value;
  //console.log("Registering: "+username+", email: "+email);

  if(username === "" || email === "")
  {
    var username_CV = document.querySelector('input[name=username]');
    var email_CV = document.querySelector('input[name=email]');
    if(username === ""){
    username_CV.setCustomValidity('Required...');
    username_CV.reportValidity();
    }
    if(email === ""){
    email_CV.setCustomValidity('Required...');
    email_CV.reportValidity();
    }
    return false;
  }


  $.post("/register_email", { username: username, email: email,mobile:mobile }).done(function (response) {
    //console.log("Start");
    state = response.state
    if (state == "success") {
      //console.log("1st step success")
      document.getElementById('registeration_code_form').style.display = "block";
      count_down();  // Timer for code to expire
    }
    else if (state == "fail") {

      setTimeout(() => {  location.reload(); }, 3000);

      Swal.fire(
        'Sorry',
        'Something Went Wrong',
        'error');

    }

    else if (state == "duplicate") {

      setTimeout(() => {  location.reload(); }, 3000);

      Swal.fire(
        'Sorry',
        'Hmmm, Duplicate Email...',
        'error');

    }
    else if (state == "mobile_exist") {

      setTimeout(() => {  location.reload(); }, 3000);

      Swal.fire(
        'Sorry',
        'Mobile Number added before...',
        'error');

    }


  });

}

function confirm_code(){
  const email = document.getElementById('email').value;
  const registeration_code = document.getElementById('registeration_code').value;

  if(registeration_code === "")
  {
    var registeration_code_CV = document.querySelector('input[name=registeration_code]');
    registeration_code_CV.setCustomValidity('Code has been sent via mail...');
    registeration_code_CV.reportValidity();
    return false;
  }

  $.post("/confirm_code", { email_confirm_code: email, registeration_code: registeration_code }).done(function (response) {

    state = response.state;
    //console.log(state);
    if (state == "success") {

      document.getElementById('registeration_code_form').style.display = "none";

      document.getElementById('username').disabled = true;
      document.getElementById('email').disabled = true;
      document.getElementById('send_code_btn').disabled = true;
      //      document.getElementById('send_code_btn').style.display = "none";


      document.getElementById('password-field').disabled = false;
      document.getElementById('password-checker').disabled = false;
      
      document.getElementById('submit-btn').disabled = false;
    }
    else {

      //setTimeout(() => {  location.reload(); }, 3000);

      Swal.fire(
        'Hmmm',
        'Wrong Code',
        'error');
    }

  });

}

function register(){
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const mobile = document.getElementById('mobile').value;
  const password = document.getElementById('password-field').value;

  $.post("/register", { username: username, email: email, password: password,mobile:mobile }).done(function (response) {

    state = response.state;
    //console.log(state);
    if (state == "success") {

      Swal.fire(
        'Great',
        'Registeration complete...',
        'success');

        window.location.replace("/login");
    }
    else if (state == "mobile_exist") {
      setTimeout(() => {  location.reload(); }, 3000);
      Swal.fire(
        'Sorry',
        'Mobile already exist...',
        'sorry');

        window.location.replace("/register");
    }

    else {

      setTimeout(() => {  location.reload(); }, 3000);

      Swal.fire(
        'Sorry',
        'Something went wrong with registeration! reloading...',
        'error');
    }

  });

}

function expire_code()
{
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;

  $.post("/expire_code", { username: username, email: email }).done(function (response) {

    state = response.state;
    //console.log(state);
    if (state == "success") {

      Swal.fire(
        'Code Expired',
        'Sending a new code...',
        'info');
    }

    else {

      setTimeout(() => {  location.reload(); }, 3000);

      Swal.fire(
        'Sorry',
        'Something went wrong with expiry! reloading...',
        'error');
    }

  });

}

function count_down()
{

  // Set the date we're counting down to
var countDownDate = new Date().getTime() + 60000*5;  // 5 minutes

// Update the count down every 1 second
var x = setInterval(function() {


  // Get today's date and time
  var now = new Date().getTime();
    
  // Find the distance between now and the count down date
  var distance = countDownDate - now;
    
  // Time calculations for days, hours, minutes and seconds
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
  // Output the result in an element with id="demo"
  document.getElementById("registeration_code-addon").innerHTML = minutes + "m " + seconds + "s ";
    
  // If the count down is over, write some text 
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("registeration_code-addon").innerHTML = "EXPIRED";
    expire_code();
  }
}, 1000);

}