// ১. ইনপুট হ্যান্ডলিং
function handleInput() {
    const editor = document.getElementById('post-editor');
    const btn = document.getElementById('post-btn');
    if (editor.innerText.trim().length > 0 || document.getElementById('media-preview-container').innerHTML !== "") {
        btn.disabled = false;
        btn.classList.add('active');
    } else {
        btn.disabled = true;
        btn.classList.remove('active');
    }
}

// ২. স্টাইল ও পজিশন মেমোরি
let currentStyle = { color: '#000000', fontSize: '24px', fontFamily: 'inherit' };
let lastSavedRange = null;

function savePosition() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (document.getElementById('post-editor').contains(range.commonAncestorContainer)) {
            lastSavedRange = range.cloneRange();
        }
    }
}

const editorElement = document.getElementById('post-editor');
editorElement.addEventListener('keyup', savePosition);
editorElement.addEventListener('click', savePosition);
editorElement.addEventListener('touchend', savePosition);

// ৩. মাস্টার ফরম্যাট ফাংশন (পরপর লেখার জন্য)
function applyNewStyle() {
    const editor = document.getElementById('post-editor');
    editor.focus();
    const sel = window.getSelection();
    if (lastSavedRange) { sel.removeAllRanges(); sel.addRange(lastSavedRange); }
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const span = document.createElement("span");
    span.style.color = currentStyle.color;
    span.style.fontSize = currentStyle.fontSize;
    span.style.fontFamily = currentStyle.fontFamily;
    span.innerHTML = "&#8203;"; 

    range.insertNode(span);
    const newRange = document.createRange();
    newRange.setStart(span.firstChild, 1);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    lastSavedRange = newRange;
}

// ৪. টেক্সট একশন
function changeTextColor(color) { currentStyle.color = color; applyNewStyle(); }
function updateSize(val) { 
    if(document.getElementById('size-val')) document.getElementById('size-val').innerText = val;
    currentStyle.fontSize = val + "px"; applyNewStyle(); 
}
function setFont(fontName) { currentStyle.fontFamily = fontName; applyNewStyle(); closeModal(); }

// ৫. ব্যাকগ্রাউন্ড (কালো কালারসহ)
function setManualColor(bgColor, txtColor) {
    const target = document.getElementById('bg-target');
    const editor = document.getElementById('post-editor');
    target.style.background = bgColor;
    if(bgColor === 'black' || bgColor === '#000000') {
        editor.style.color = 'white';
    } else if(txtColor) {
        editor.style.color = txtColor;
    }
    editor.style.textAlign = (bgColor === '#ffffff' || bgColor === 'white') ? "left" : "center";
}

function applyMagicBg() {
    const r = () => Math.floor(Math.random() * 256);
    document.getElementById('bg-target').style.background = `linear-gradient(45deg, rgb(${r()},${r()},${r()}), rgb(${r()},${r()},${r()}))`;
    document.getElementById('post-editor').style.textAlign = "center";
}

// ৬. ফটো/ভিডিও প্রিভিউ
function previewMedia(e) {
    const file = e.target.files[0];
    const container = document.getElementById('media-preview-container');
    container.innerHTML = "";
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (file.type.startsWith('image/')) {
                container.innerHTML = `<img src="${event.target.result}" style="width:100%; border-radius:10px; margin-top:10px;">`;
            } else if (file.type.startsWith('video/')) {
                container.innerHTML = `<video src="${event.target.result}" controls style="width:100%; border-radius:10px; margin-top:10px;"></video>`;
            }
            handleInput();
        };
        reader.readAsDataURL(file);
    }
}

// ৭. প্রাইভেসি ও ট্যাগিং (ফ্রেন্ড ট্যাগ আপডেট)
function setPrivacy(text, iconClass) {
    document.getElementById('privacy-text').innerText = text;
    document.getElementById('privacy-icon').className = `fas ${iconClass}`;
    closeModal();
}

function setTag(feeling) {
    document.getElementById('dynamic-tags').innerText = feeling ? " — is " + feeling : "";
    closeModal();
}

// --- ফ্রেন্ড ট্যাগ ফিক্সড লজিক ---
let selectedFriends = [];
const allFriends = ["Arif Hossain", "Sumon Ahmed", "Mithu Rahman", "Rakib Hasan", "Jasim Uddin", "Bappy Khan", "Tanvir Islam"];

function filterFriends() {
    const query = document.getElementById('friend-search').value.toLowerCase();
    const listContainer = document.getElementById('friend-list-container');
    listContainer.innerHTML = "";

    const filtered = allFriends.filter(f => f.toLowerCase().includes(query));

    filtered.forEach(friend => {
        const isChecked = selectedFriends.includes(friend) ? "checked" : "";
        listContainer.innerHTML += `
            <div class="modal-item" style="display:flex; justify-content:space-between; align-items:center; padding:10px;" onclick="toggleFriendSelection('${friend}')">
                <span>👤 ${friend}</span>
                <input type="checkbox" ${isChecked} onclick="event.stopPropagation(); toggleFriendSelection('${friend}')">
            </div>`;
    });
}

function toggleFriendSelection(name) {
    const index = selectedFriends.indexOf(name);
    if (index > -1) {
        selectedFriends.splice(index, 1);
    } else {
        if (selectedFriends.length < 5) {
            selectedFriends.push(name);
        } else {
            alert("সর্বোচ্চ ৫ জনকে ট্যাগ করা যাবে!");
            return;
        }
    }
    updateTagDisplay();
    filterFriends();
    document.getElementById('selected-count').innerText = `Selected: ${selectedFriends.length}/5`;
}

function updateTagDisplay() {
    const tagDisplay = document.getElementById('dynamic-tags');
    if (tagDisplay) {
        if (selectedFriends.length === 0) tagDisplay.innerText = "";
        else if (selectedFriends.length === 1) tagDisplay.innerText = " — with " + selectedFriends[0];
        else tagDisplay.innerText = ` — with ${selectedFriends[0]} and ${selectedFriends.length - 1} others`;
    }
}

function detectLocation() {
    const lb = document.getElementById('location-tag');
    lb.style.display = 'block';
    document.getElementById('loc-name').innerText = "Butterworth, Malaysia";
}

// ৮. মডাল লজিক
function openModal(type) {
    savePosition();
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    overlay.style.display = "flex";
    content.innerHTML = "";

    if (type === 'font-modal') {
        const currentSize = parseInt(currentStyle.fontSize) || 24;
        content.innerHTML = `
            <div style="text-align:center; padding:10px;">
                <p>Text Size: <span id="size-val">${currentSize}</span>px</p>
                <input type="range" min="10" max="100" value="${currentSize}" class="size-slider" oninput="updateSize(this.value)">
            </div>
            <div class="font-card" style="font-family: 'Lobster';" onclick="setFont('Lobster')">Stylish English</div>
            <div class="font-card" style="font-family: 'Hind Siliguri';" onclick="setFont('Hind Siliguri')">শিলিগুরি (Bangla)</div>
            <div class="font-card" style="font-family: 'Mina';" onclick="setFont('Mina')">মিলা ফন্ট (Bold)</div>
            <div class="modal-item" onclick="resetAll()" style="color:red;">সব মুছুন</div>`;
    } else if (type === 'privacy-modal') {
        content.innerHTML = `
            <div class="modal-item" onclick="setPrivacy('Public', 'fa-globe-americas')">🌐 Public</div>
            <div class="modal-item" onclick="setPrivacy('Friends', 'fa-users')">👥 Friends</div>
            <div class="modal-item" onclick="setPrivacy('Only Me', 'fa-lock')">🔒 Only Me (Private)</div>`;
    } else if (type === 'feeling-modal') {
        content.innerHTML = `
            <div class="modal-item" onclick="setTag('Happy 😊')">😊 Happy</div>
            <div class="modal-item" onclick="setTag('Loved 😍')">😍 Loved</div>
            <div class="modal-item" onclick="setTag('Sad 😢')">😢 Sad</div>
            <div class="modal-item" onclick="setTag('Angry 😡')">😡 Angry</div>`;
    } else if (type === 'friend-modal') {
        content.innerHTML = `
            <h3 style="text-align:center; padding:10px;">Tag Friends</h3>
            <div style="padding:10px;"><input type="text" id="friend-search" placeholder="বন্ধুর নাম লিখুন..." style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc;" onkeyup="filterFriends()"></div>
            <div id="friend-list-container" style="max-height: 200px; overflow-y: auto;"></div>
            <div id="selected-count" style="text-align:center; padding:5px; font-weight:bold; color:#1877F2;">Selected: ${selectedFriends.length}/5</div>
            <button onclick="closeModal()" style="width:100%; padding:10px; background:#1877F2; color:white; border:none; border-radius:5px; margin-top:10px;">Done</button>`;
        filterFriends();
    }
}

function closeModal() { document.getElementById('modal-overlay').style.display = "none"; }

function toggleColorBox() {
    const box = document.getElementById('custom-color-box');
    box.style.display = box.style.display === "flex" ? "none" : "flex";
}

function resetAll() {
    document.getElementById('post-editor').innerHTML = "";
    document.getElementById('bg-target').style.background = "#ffffff";
    document.getElementById('media-preview-container').innerHTML = "";
    document.getElementById('dynamic-tags').innerText = "";
    selectedFriends = [];
    handleInput();
    closeModal();
}

// ৮. পোস্ট পাবলিশ করা (সার্ভারে পাঠানো)
async function publishPost() {
    const editor = document.getElementById('post-editor');
    const text = editor.innerText.trim(); // এডিটর থেকে টেক্সট নেওয়া
    const mediaInput = document.getElementById('media-input');
    const mediaFile = mediaInput.files[0];
    
    // লোকাল স্টোরেজ থেকে ইউজারের ইমেইল নেওয়া (লগইনের সময় যেটা সেভ করেছিলেন)
    const email = localStorage.getItem('userEmail') || "mithu@example.com"; 

    const formData = new FormData();
    formData.append('email', email);
    formData.append('text', text);
    if (mediaFile) {
        formData.append('mediaFile', mediaFile);
    }

    // বাটন লোডিং দেখানো
    const btn = document.getElementById('post-btn');
    btn.innerText = "Posting...";
    btn.disabled = true;

    try {
        const response = await fetch('/api/create-post', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === "success") {
            alert("✅ পোস্ট সফল হয়েছে, মিঠু ভাই!");
            window.location.href = "newsfeed.html"; // সাকসেস হলে নিউজফিডে যাবে
        } else {
            alert("ভুল হয়েছে: " + result.message);
        }
    } catch (err) {
        console.error("Error:", err);
        alert("সার্ভারের সাথে কানেক্ট করা যাচ্ছে না!");
    } finally {
        btn.innerText = "Post";
        btn.disabled = false;
    }
}