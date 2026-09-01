
function onSelectChange()
{
  var value = document.getElementById("type_name").value;
  
  if (value == "Other")
  {
    
    document.getElementById("other").style.display = "block";
  }
  else
  {
    document.getElementById("other").style.display = "none";
    
  }
}


function onEmailChange() {
  const add_email = document.querySelector('input[name=add_email]');
  const confirm = document.querySelector('input[name=add_email_check]');
  if (confirm.value === add_email.value && confirm.value !== "" && add_email.value !== "") {
    confirm.setCustomValidity('');
    document.getElementById('add_email_btn').disabled = false;
  } else {
    confirm.setCustomValidity('Emails do not match !');
    confirm.reportValidity();
    document.getElementById('add_email_btn').disabled = true;
  }
}


function delete_account()
{

  //var email_to_delete = document.getElementById('add_email').value;
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {

      $.post("/delete_email").done(function (response) {
        state = response.state;

        setTimeout(() => {  window.location.replace("/logout"); }, 3000);

        if (state == "success") {
        
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Your email has been deleted.',
            showConfirmButton: false,
            showCancelButton: false
          })

      }

        else {
          Swal.fire(
            'Hmmm',
            'Something went wrong, try again in a few moments',
            'error');
        }

      });
    }
  })
}


function change_account_type(email, type)
{
  //console.log(email);
  $.post("/change_account_type",{ email:email, type:type }).done(function (response) {
    state = response.state;

    if (state == "success") {
      setTimeout(() => {  window.location.replace("/home"); }, 2000);
      Swal.fire(
        'Privilege changed.',
        'Redirecting...',
        'success');
        }

    else if (state == "last")
    {
      Swal.fire(
        'Last Admin',
        'There must be at least One Admin',
        'info');
    }

    else if (state == "fail")
    {
      Swal.fire(
        'Hmmm',
        'Something went wrong, try again in a few moments',
        'error');
    }

    else if (state == "not_admin")
    {
      Swal.fire(
        'Hmmm',
        'Not Authorized.',
        'error');
    }

  });
}

function get_linked_accounts()
{

  let linked_accounts = $('#linked_accounts_list');

  const url = '/get_linked_accounts';
    
  $.getJSON(url, function (data) {

    $.each(data, function (key, entry) {

      //console.log(entry.type);
      if(entry.type == 1)
      {
        type = "Admin"
      }
      else
      {
        type = "Non Admin"
      }
      linked_accounts.append("<tr><td>"+entry.email+"</td>\\\
      <td>"+entry.mobile+"</td>\\\
      <td> <button class='btn btn-primary btn-sm' onclick='change_account_type(\""+entry.email+"\" , \""+type+"\")' >"+type+"</button> </td>\\\
      </tr>");            

    })
  });

}


function onChange_theme()
{
    //navbar-dark bg-dark
    //navbar sticky-top navbar-expand-lg
    var theme_list = document.getElementById('theme_list').value;
    document.getElementById("main_nav_bar").className = "navbar sticky-top navbar-expand-lg " + theme_list;
}

function change_app_theme()
{

  const theme_list = document.getElementById('theme_list').value;

  $.post("/change_app_theme", { application_theme:theme_list }).done(function (response) {

      state = response.state;
      console.log(state);
      if (state == "success") {    
        setTimeout(() => {  window.location.replace("/logout"); }, 1500);
          Swal.fire(
              'Done!',
              'Theme has been changed, reloading...',
              'success');
      }

      else {
        Swal.fire(
          'Hmmm',
          'Something went wrong, try again in a few moments',
          'error');
      }

    });

}