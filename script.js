function showSection(section){

document.getElementById("loginSection").style.display="none"
document.getElementById("registerSection").style.display="none"

document.getElementById("loginTab").classList.remove("active")
document.getElementById("registerTab").classList.remove("active")

if(section==="login"){

document.getElementById("loginSection").style.display="block"
document.getElementById("loginTab").classList.add("active")

document.getElementById("title").innerText="Welcome Back"
document.getElementById("subtitle").innerText="Login to continue"

}

if(section==="register"){

document.getElementById("registerSection").style.display="block"
document.getElementById("registerTab").classList.add("active")

document.getElementById("title").innerText="Welcome"
document.getElementById("subtitle").innerText="Register to continue"

}

}



function togglePassword(id,icon){

let field=document.getElementById(id)

if(field.type==="password"){
field.type="text"
icon.classList.replace("fa-eye","fa-eye-slash")
}
else{
field.type="password"
icon.classList.replace("fa-eye-slash","fa-eye")
}

}



function checkStrength(){

let pass=document.getElementById("regPass").value
let bar=document.getElementById("strengthBar")

let strength=0

if(pass.length>5) strength++
if(/[A-Z]/.test(pass)) strength++
if(/[0-9]/.test(pass)) strength++
if(/[^A-Za-z0-9]/.test(pass)) strength++

if(strength<=1){
bar.style.width="30%"
bar.style.background="red"
}
else if(strength==2){
bar.style.width="60%"
bar.style.background="orange"
}
else{
bar.style.width="100%"
bar.style.background="green"
}

}



function register(){

let username=document.getElementById("regUser").value
let password=document.getElementById("regPass").value
let role=document.getElementById("regRole").value
let email=document.getElementById("regEmail").value

if(username==="" || password==="" || email===""){
alert("Please fill all fields")
return
}

let users=JSON.parse(localStorage.getItem("users")) || []

users.push({username,password,role,email})

localStorage.setItem("users",JSON.stringify(users))

document.getElementById("regMsg").style.color="green"
document.getElementById("regMsg").innerText="Registration successful"

/* clear inputs */

document.getElementById("regUser").value=""
document.getElementById("regPass").value=""
document.getElementById("regEmail").value=""

document.getElementById("strengthBar").style.width="0%"

/* redirect */

setTimeout(()=>{

if(role==="student"){
window.location.href="student.html"
}

if(role==="instructor"){
window.location.href="instructor.html"
}

},1000)

}



function login(){

let username=document.getElementById("loginUser").value
let password=document.getElementById("loginPass").value
let role=document.getElementById("loginRole").value

if(username==="" || password===""){
alert("Please enter username and password")
return
}

let users=JSON.parse(localStorage.getItem("users")) || []

let found=users.find(u =>
u.username===username &&
u.password===password &&
u.role===role
)

if(found){

document.getElementById("loginMsg").style.color="green"
document.getElementById("loginMsg").innerText="Login successful"

/* clear inputs */

document.getElementById("loginUser").value=""
document.getElementById("loginPass").value=""

/* redirect */

setTimeout(()=>{

if(role==="student"){
window.location.href="student.html"
}

if(role==="instructor"){
window.location.href="instructor.html"
}

},1000)

}
else{

document.getElementById("loginMsg").style.color="red"
document.getElementById("loginMsg").innerText="Invalid credentials"

}

}