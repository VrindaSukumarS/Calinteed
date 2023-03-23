// USER SIGNUP VALIDATION

var nameError = document.getElementById('name-error');
var emailError = document.getElementById('email-error');
var passwordError = document.getElementById('password-error');
var password2Error = document.getElementById('password2-error');
var submitError = document.getElementById('submit-error');
var telError = document.getElementById('tel-error');

function validateName(){                                 
  var name = document.getElementById('name').value;
  if(name.length == 0){
    nameError.innerHTML = 'Name is required';
    return false;
  }
  if(!name.match(/^[A-Za-z]+ [A-Za-z]+$/)) {
      nameError.innerHTML = 'Write full name';
      return false;
  }
  nameError.innerHTML = '';
      return true;
}

function validateEmail(){
  var email = document.getElementById('email').value;
  if(email.length==0){
      emailError.innerHTML = 'Email is required';
      return false;
  }
  if(!email.match(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/)){
    emailError.innerHTML = 'Email invalid';
    return false;
  }
  emailError.innerHTML = '';
  return true;
}


function validateTel(){
  var tel = document.getElementById('tel').value;
  if(tel.length==0){
      telError.innerHTML = 'Mobile number is required';
      return false;
  }
  if(!tel.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)){
    telError.innerHTML = 'Invalid mobile number';
    return false;
  }
  telError.innerHTML = '';
  return true;
}


function validatePassword(){
  var password = document.getElementById('password').value;
  var passChecker = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  if(password.match(passChecker)){
    passwordError.innerHTML = '';
    return true;
  }
  if(password.length==0){
    passwordError.innerHTML = 'Password is required';
    return false;
  }else{
    passwordError.innerHTML = 'required 6-20 character,1 numeric digit, 1 uppercase and 1 lowercase';
    return false;
  }
}

function validateConfirmPassword(){
    var password = document.getElementById('password').value;
    var password2 = document.getElementById('password2').value;
   
    if(password2===password){
      password2Error.innerHTML = '';
      return true;
    }else{
      password2Error.innerHTML = 'Password is not matching';
      return false;
    }

}

function validateForm(){
  if(!validateName() || !validateEmail() || !validatePassword() || !validateConfirmPassword() || !validateTel()){
    submitError.style.display='flex';
    submitError.style.justifyContent='center';
    submitError.innerHTML = 'Please fill all fields to submit';
    setTimeout(()=>{
      submitError.style.display='none';
    },3000);
    return false;
  }
}


function validateAddress(){
  var address = document.getElementById('address').value;
  if(address.length==0){
    addressError.innerHTML = 'Address is required';
    return false;
  }
  addressError.innerHTML = '';
    return true;
}

function validateCountry(){
  var country = document.getElementById('country').value;
  if(country.length==0){
    countryError.innerHTML = 'Country name is required';
    return false;
  }
  countryError.innerHTML = '';
    return true;
}

function validateState(){
  var state = document.getElementById('state').value;
  if(state.length==0){
    stateError.innerHTML = 'State name is required';
    return false;
  }
  stateError.innerHTML = '';
    return true;
}

function validatePincode(){
  var pincode = document.getElementById('pincode').value;
  if(pincode.length==0){
      pincodeError.innerHTML = 'Pincode is required';
      return false;
  }
  if(pincode.length>6){
      pincodeError.innerHTML = 'Invalid Pincode';
      return false;
  }
  if(!pincode.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)){
    pincodeError.innerHTML = 'Invalid pincode';
    return false;
  }
  pincodeError.innerHTML = '';
  return true;
}
