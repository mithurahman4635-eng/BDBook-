console.log("JS LOADED ✔ MITHU RAILWAY v10");

let currentUser = "";
let allProjects = [];

// ডাইনামিক লিঙ্ক: এটি থাকলে আইপি বদলালেও সমস্যা হবে না
const SERVER_URL = window.location.origin;

function notify(msg) {
  alert(msg);
}

async function login() {
    const userInput = document.getElementById('username').value.trim();
    if (!userInput) return alert("মিঠু ভাই, আগে ইউজার নাম দিন!");

    try {
        const res = await fetch(`${SERVER_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: userInput })
        });
        const data = await res.json();
        
        if (data.message === "Success") {
            currentUser = userInput; 
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('main-dashboard').style.display = 'block';
            document.getElementById('welcome-msg').innerText = "স্বাগতম, " + currentUser;
            loadProjects();
        } else {
            alert("🚨 লগইন ব্যর্থ!");
        }
    } catch (err) {
        alert("🚨 সার্ভার কানেকশন এরর! টার্মিনালে node server.js চালু আছে তো?");
    }
}

async function deploy() {
  const repo = document.getElementById('project').value.trim();
  if (!currentUser) return alert("আগে লগইন করেন মিঠু ভাই!");
  if (!repo) return alert("গিথুব লিঙ্কটা কই?");

  const box = document.getElementById('progress');
  box.innerHTML = "⏳ ডেপ্লয় ও ব্যাকআপ শুরু হচ্ছে...";

  try {
    const res = await fetch(`${SERVER_URL}/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser, repo: repo })
    });

    const data = await res.json();
    if (data.error) {
        box.innerHTML = "❌ ব্যর্থ!";
        notify(data.error);
    } else {
        box.innerHTML = `✅ LIVE 🚀 <br><a href="${data.github_url}" target="_blank" style="color:cyan">GitHub Link</a>`;
        notify("🚀 ডেপ্লয় সফল!");
    }
  } catch (err) {
    notify("🚨 সার্ভার রেসপন্স দিচ্ছে না!");
  }
}

async function loadProjects() {
  if (!currentUser) return;
  try {
    const res = await fetch(`${SERVER_URL}/projects/${currentUser}`);
    allProjects = await res.json();
    render(allProjects);
    updateStats();
  } catch (err) { console.log("Load failed"); }
}

function render(data) {
  const box = document.getElementById('projects');
  box.innerHTML = (data.length === 0) ? "<p>কোনো প্রজেক্ট নেই।</p>" : "";
}

function updateStats() {
  const statsBox = document.getElementById('stats');
  if(statsBox) statsBox.innerHTML = `📊 Active Projects: ${allProjects.length}`;
}

function checkStatus() {
    fetch(`${SERVER_URL}/`).then(() => alert("সার্ভার সচল! ✅")).catch(() => alert("সার্ভার অফলাইন ❌"));
}

setInterval(() => { if (currentUser) loadProjects(); }, 10000);  