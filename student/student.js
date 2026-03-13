// ---------------- DATA ----------------
let courses = [
    {title:"Mathematics 101", desc:"Basic Algebra concepts", instructor:"Mr. Ravi", video:"https://www.youtube.com/embed/Q-dx75ErGAA"},
    {title:"Physics 101", desc:"Mechanics fundamentals", instructor:"Mrs. Priya", video:"https://www.youtube.com/embed/b1t41Q3xRM8"},
    {title:"Chemistry 101", desc:"Introduction to Chemistry", instructor:"Dr. Anand", video:"https://www.youtube.com/embed/videoseries?list=PLElW1Xs3Mvktu9VPTK5t_Szuki4U8esZ_"},
    {title:"Biology 101", desc:"Basics of Human Anatomy", instructor:"Ms. Meera", video:"https://www.youtube.com/embed/uBGl2BujkPQ"},
    {title:"Computer Science 101", desc:"Introduction to Programming", instructor:"Mr. Karthik", video:"https://www.youtube.com/embed/zOjov-2OZ0E"},
    {title:"English 101", desc:"Grammar and Composition", instructor:"Mrs. Anitha", video:"https://www.youtube.com/embed/cqTa2aV8LTY"}
];

let assignments = [
    {title:"Algebra Homework", course:"Mathematics 101", due:"2026-03-20", details:"Solve 10 algebra problems from chapter 1. Submit as PDF."},
    {title:"Mechanics Lab", course:"Physics 101", due:"2026-03-25", details:"Complete the mechanics lab experiment. Upload lab report."},
    {title:"Chemistry Experiment", course:"Chemistry 101", due:"2026-03-22", details:"Perform the titration experiment and submit results."},
    {title:"Biology Report", course:"Biology 101", due:"2026-03-28", details:"Prepare a report on human anatomy for the assigned section."},
    {title:"Programming Assignment", course:"Computer Science 101", due:"2026-03-30", details:"Build a small JS calculator and submit code files."}
];

let progressData = [
    {course:"Mathematics 101", progress:50},
    {course:"Physics 101", progress:30},
    {course:"Chemistry 101", progress:20},
    {course:"Biology 101", progress:70},
    {course:"Computer Science 101", progress:40},
    {course:"English 101", progress:60}
];

let quizzes = {
    "Algebra Homework":[
        {question:"What is 2 + 3?", options:["4","5","6","7"], answer:"5"},
        {question:"Solve for x: x - 5 = 10", options:["5","10","15","20"], answer:"15"}
    ],
    "Mechanics Lab":[
        {question:"Newton's First Law is also called?", options:["Law of Inertia","Law of Gravity","Law of Motion","Law of Action-Reaction"], answer:"Law of Inertia"},
        {question:"Force = Mass x ?", options:["Velocity","Acceleration","Distance","Momentum"], answer:"Acceleration"}
    ],
    "Chemistry Experiment":[
        {question:"What is the chemical symbol for water?", options:["O2","H2O","CO2","NaCl"], answer:"H2O"},
        {question:"pH of pure water?", options:["7","0","14","1"], answer:"7"}
    ],
    "Biology Report":[
        {question:"Largest organ in human body?", options:["Skin","Liver","Heart","Lungs"], answer:"Skin"},
        {question:"Red blood cells carry?", options:["Oxygen","CO2","Glucose","Hormones"], answer:"Oxygen"}
    ],
    "Programming Assignment":[
        {question:"Which language runs in a browser?", options:["Python","JavaScript","C++","Java"], answer:"JavaScript"},
        {question:"JS stands for?", options:["Java System","JavaScript","JustScript","JScript"], answer:"JavaScript"}
    ]
};

let availableCourses = [
    {title:"Mathematics 101", price:1999},
    {title:"Physics 101", price:2499},
    {title:"Chemistry 101", price:2299},
    {title:"Biology 101", price:1899},
    {title:"Computer Science 101", price:2999},
    {title:"English 101", price:1499}
];

// ---------------- DOM ----------------
let contentDiv = document.getElementById("content");

// ---------- VIDEO MODAL ----------
let videoModal = document.createElement("div");
videoModal.id = "videoModal";
videoModal.style.display = "none";
videoModal.style.position = "fixed";
videoModal.style.top = "0";
videoModal.style.left = "0";
videoModal.style.width = "100%";
videoModal.style.height = "100%";
videoModal.style.background = "rgba(0,0,0,0.8)";
videoModal.style.justifyContent = "center";
videoModal.style.alignItems = "center";
videoModal.style.zIndex = "1000";
videoModal.innerHTML = `<div style="position:relative;width:80%;max-width:800px;">
<span id="closeVideoModal" style="position:absolute;top:-10px;right:0;font-size:30px;color:white;cursor:pointer;">&times;</span>
<div id="modalContent"></div></div>`;
document.body.appendChild(videoModal);
document.getElementById("closeVideoModal").onclick = ()=>{videoModal.style.display="none";document.getElementById("modalContent").innerHTML="";};
videoModal.onclick=(e)=>{if(e.target===videoModal){videoModal.style.display="none";document.getElementById("modalContent").innerHTML="";}};

// ---------- PURCHASE MODAL ----------
let purchaseModal = document.createElement("div");
purchaseModal.id="purchaseModal";
purchaseModal.style.display="none";
purchaseModal.style.position="fixed";
purchaseModal.style.top="0";
purchaseModal.style.left="0";
purchaseModal.style.width="100%";
purchaseModal.style.height="100%";
purchaseModal.style.background="rgba(0,0,0,0.8)";
purchaseModal.style.justifyContent="center";
purchaseModal.style.alignItems="center";
purchaseModal.style.zIndex="1000";
purchaseModal.innerHTML=`<div style="position:relative;width:90%;max-width:400px;background:#fff;border-radius:8px;padding:20px;">
<span id="closePurchaseModal" style="position:absolute;top:10px;right:15px;font-size:28px;cursor:pointer;">&times;</span>
<h3 id="purchaseCourseTitle"></h3>
<form id="purchaseForm">
<label>Name:</label><input type="text" id="customerName" required>
<label>Email:</label><input type="email" id="customerEmail" required>
<label>Phone:</label><input type="tel" id="customerPhone" required>
<button type="submit">Pay ₹<span id="coursePrice"></span></button>
</form></div>`;
document.body.appendChild(purchaseModal);
document.getElementById("closePurchaseModal").onclick = ()=>{purchaseModal.style.display="none";};

// ---------- ASSIGNMENT MODAL ----------
let assignmentModal = document.createElement("div");
assignmentModal.id="assignmentModal";
assignmentModal.style.display="none";
assignmentModal.style.position="fixed";
assignmentModal.style.top="0";
assignmentModal.style.left="0";
assignmentModal.style.width="100%";
assignmentModal.style.height="100%";
assignmentModal.style.background="rgba(0,0,0,0.8)";
assignmentModal.style.justifyContent = "center";
assignmentModal.style.alignItems = "center";
assignmentModal.style.zIndex = "1000";
assignmentModal.innerHTML=`<div style="position:relative;width:80%;max-width:600px;background:#fff;border-radius:8px;padding:20px;">
<span id="closeAssignmentModal" style="position:absolute;top:10px;right:15px;font-size:28px;cursor:pointer;">&times;</span>
<div id="assignmentModalContent"></div></div>`;
document.body.appendChild(assignmentModal);
document.getElementById("closeAssignmentModal").onclick = ()=>{assignmentModal.style.display="none";document.getElementById("assignmentModalContent").innerHTML="";};

// ---------- SHOW SECTION ----------
function showSection(section){
    contentDiv.innerHTML="";

    // GRID STYLING: 2-IN-A-ROW
    const gridStyle = "display:grid;grid-template-columns:repeat(2,1fr);gap:20px;";

    // Courses
    if(section==="courses"){
        if(courses.length===0){contentDiv.innerHTML="<p>No enrolled courses yet.</p>";return;}
        let grid=document.createElement("div");
        grid.style.cssText=gridStyle;
        courses.forEach(course=>{
            let card=document.createElement("div");
            card.classList.add("card");
            card.innerHTML=`<h3>${course.title}</h3><p>${course.desc}</p><p><b>Instructor:</b> ${course.instructor}</p>
            <button class="playBtn">▶ Play Video</button>`;
            card.querySelector(".playBtn").addEventListener("click",()=>{videoModal.style.display="flex";document.getElementById("modalContent").innerHTML=`<iframe width="100%" height="380" src="${course.video}?autoplay=1" frameborder="0" allowfullscreen></iframe>`;});
            grid.appendChild(card);
        });
        contentDiv.appendChild(grid);
    }

    // Assignments
    if(section==="assignments"){
        if(assignments.length===0){contentDiv.innerHTML="<p>No assignments yet.</p>";return;}
        let grid=document.createElement("div");
        grid.style.cssText=gridStyle;
        assignments.forEach(assign=>{
            let card=document.createElement("div");
            card.classList.add("card");
            card.innerHTML=`<h3>${assign.title}</h3><p><b>Course:</b> ${assign.course}</p><p><b>Due:</b> ${assign.due}</p>
                              <button onclick="startQuizModal('${assign.title}')">Start Quiz</button>`;
            grid.appendChild(card);
        });
        contentDiv.appendChild(grid);
    }

    // Buy Courses
    if(section==="buy"){
        let grid=document.createElement("div");
        grid.style.cssText=gridStyle;
        availableCourses.forEach(course=>{
            let card=document.createElement("div");
            card.classList.add("card");
            card.innerHTML=`<h3>${course.title}</h3><p><b>Price:</b> ₹${course.price}</p>
            <button class="buy-btn" onclick="openPurchaseForm('${course.title}', ${course.price})">Buy Now</button>`;
            grid.appendChild(card);
        });
        contentDiv.appendChild(grid);
    }

    // Progress
    if(section==="progress"){
        if(progressData.length===0){contentDiv.innerHTML="<p>No progress available.</p>";return;}
        let grid=document.createElement("div");
        grid.style.cssText=gridStyle;
        progressData.forEach(p=>{
            let card=document.createElement("div");
            card.classList.add("card");
            card.innerHTML=`<h3>${p.course}</h3><p><b>Progress:</b> ${p.progress}%</p>
            <div class="progress-bar"><div class="progress-fill" style="width:${p.progress}%"></div></div>`;
            grid.appendChild(card);
        });
        contentDiv.appendChild(grid);
    }
}

// ---------- OPEN PURCHASE FORM ----------
function openPurchaseForm(title, price){
    document.getElementById("purchaseCourseTitle").innerText=`Purchase: ${title}`;
    document.getElementById("coursePrice").innerText=price;
    purchaseModal.style.display="flex";

    document.getElementById("purchaseForm").onsubmit=function(e){
        e.preventDefault();
        let name=document.getElementById("customerName").value;
        let email=document.getElementById("customerEmail").value;
        let phone=document.getElementById("customerPhone").value;
        let amount = price * 100;
        alert(`Payment simulation: ${title} ₹${price}`);
        purchaseModal.style.display="none";
        courses.push({title:title,desc:"Newly purchased course",instructor:"TBA",video:"https://www.youtube.com/embed/dQw4w9WgXcQ"});
        showSection('courses');
    };
}

// ---------- QUIZ FUNCTION ----------
function startQuizModal(assignmentTitle){
    let quizData = quizzes[assignmentTitle];
    if(!quizData || quizData.length===0){alert("No quiz available."); return;}
    let score=0;
    let current=0;
    assignmentModal.style.display="flex";
    let modalContent = document.getElementById("assignmentModalContent");

    function showQuestion(){
        let q = quizData[current];
        modalContent.innerHTML = `<h3>Question ${current+1} of ${quizData.length}</h3>
                                  <p>${q.question}</p>
                                  <div id="quizOptions"></div>
                                  <button id="nextQuizBtn">Next</button>`;
        let optionsDiv = document.getElementById("quizOptions");
        q.options.forEach(opt=>{
            let btn=document.createElement("button");
            btn.textContent=opt;
            btn.style.display="block";
            btn.style.margin="5px 0";
            btn.onclick=()=>{
                if(opt===q.answer) score++;
                Array.from(optionsDiv.children).forEach(b=>b.disabled=true);
                btn.style.background=(opt===q.answer)?"lightgreen":"lightcoral";
            };
            optionsDiv.appendChild(btn);
        });
        document.getElementById("nextQuizBtn").onclick=()=>{
            current++;
            if(current<quizData.length) showQuestion();
            else modalContent.innerHTML=`<h2>Quiz Completed!</h2><p>Score: ${score} / ${quizData.length}</p><button onclick="assignmentModal.style.display='none'">Close</button>`;
        };
    }
    showQuestion();
}

// ---------- LOGOUT ----------
function logout(){window.location.href="index.html";}