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


function forgot_pass()
{
    const email = document.getElementById('email').value;
    var email_CV = document.querySelector('input[name=email]');

    if(email === ""){
        email_CV.setCustomValidity('Required...');
        email_CV.reportValidity();
        return false;
        }

        $.post("/forgot_pass", { email: email }).done(function (response) {
            //console.log("Start");
            //console.log(email);
            state = response.state
            //console.log(state);
            if (state == "success") {
              //console.log("1st step success")
              document.getElementById('registeration_code_form').style.display = "block";

              document.getElementById('register_div').style.display = "none";
              document.getElementById('fogot_pass_link').style.display = "none";
              document.getElementById('login').disabled = true;

              count_down();  // Timer for code to expire
            }
            else if (state == "fail") {
        
              setTimeout(() => {  location.reload(); }, 3000);
        
              Swal.fire(
                'Sorry',
                'Something Went Wrong',
                'error');
        
            }
        
            else if (state == "null") {
        
              setTimeout(() => {  location.reload(); }, 3000);
        
              Swal.fire(
                'Sorry',
                'Hmmm, Email does not exit...',
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
  
        document.getElementById('email').disabled = true;
  
  
        document.getElementById('password_div').style.display = "block";
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


function change_pass(){
    const email = document.getElementById('email').value;
    const password = document.getElementById('password-field').value;
  
    $.post("/change_pass", { email: email, password: password }).done(function (response) {
  
      state = response.state;
      //console.log(state);
      if (state == "success") {
  
        Swal.fire(
          'Great',
          'Password Changed, now try to login again',
          'success');
  
          window.location.replace("/login");
      }
  
      else {
  
        setTimeout(() => {  location.reload(); }, 3000);
  
        Swal.fire(
          'Sorry',
          'Something went wrong with while changing the password! reloading...',
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