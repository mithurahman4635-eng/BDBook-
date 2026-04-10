const githubUser = "mithurahman4635-eng"; 
const repoName = "BDBook-"; 

// ১. রিয়েল ডিজিটাল ঘড়ি
function startClock() {
    const clockElement = document.getElementById('clock');
    if(clockElement) {
        setInterval(() => {
            const now = new Date();
            let hours = now.getHours();
            let minutes = now.getMinutes();
            let seconds = now.getSeconds();

            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            clockElement.innerText = `${hours}:${minutes}:${seconds}`;
        }, 1000);
    }
}

// ২. ফ্রেমকে নিরাপদভাবে রেন্ডার করার জন্য Iframe লজিক (সাদা গ্যাপ ফিক্সড)
function createSafeFrame(code, userName, userAvatar) {
    const content = `
    <html>
    <head>
        <style>
            /* মিঠু ভাই, এখানে margin এবং padding ০ করে width ১০০% করা হয়েছে */
            body { 
                margin:0; padding:0; display:flex; 
                justify-content:center; align-items:center; 
                overflow:hidden; background:transparent; 
                font-family: Arial, sans-serif; 
                height: 40px; width: 100vw; 
            }
            .frame-wrapper { 
                position: relative; width: 100%; height: 100%; 
                display: flex; justify-content: center; align-items: center; 
                overflow: hidden;
            }
            .kill-overlay { 
                position: absolute; top: 0; left: 0; 
                width: 100%; height: 100%; 
                display: flex; align-items: center; 
                justify-content: center; z-index: 99; pointer-events: none; 
            }
            .kill-avatar { width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; overflow: hidden; margin-right: 10px; background: #444; flex-shrink: 0; }
            .kill-info { color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); line-height: 1.1; }
            .kill-name { font-weight: bold; font-size: 13px; text-transform: uppercase; display: block; white-space: nowrap; }
            .kill-sub { font-size: 8px; white-space: nowrap; opacity: 0.9; }
        </style>
    </head>
    <body>
        <div class="frame-wrapper">
            ${code}
            <div class="kill-overlay">
                <div class="kill-avatar"><img src="${userAvatar}" style="width:100%; height:100%; object-fit:cover;"></div>
                <div class="kill-info">
                    <span class="kill-name">${userName}</span>
                    <span class="kill-sub">Shared a New Post!</span>
                </div>
            </div>
        </div>
    </body>
    </html>`;

    // এখানে style এ width: 100vw এবং display: block যোগ করা হয়েছে
    return `<iframe srcdoc='${content.replace(/'/g, "&apos;")}' style="width: 100vw; height: 40px; border: none; overflow: hidden; pointer-events: none; display: block; margin: 0; padding: 0;"></iframe>`;
}

// ৩. কিলিং মেসেজ ট্রিগার (সংশোধিত ও নিরাপদ)
function triggerKillMessage(userName, userAvatar) {
    const box = document.getElementById('kill-message-box');
    if (!box) return;

    const savedFrame = localStorage.getItem('activeFrameSource');
    const frameType = localStorage.getItem('activeFrameType');

    box.innerHTML = ''; 
    box.className = 'kill-visible'; 
    box.id = 'kill-message-box';
    box.style.background = "none";
    box.style.padding = "0";
    box.style.width = "100vw"; // বক্সের উইডথ ১০০% নিশ্চিত করা
    box.style.left = "0";

    if (savedFrame && frameType === "code") {
        box.innerHTML = createSafeFrame(savedFrame, userName, userAvatar);
    } else if (savedFrame && frameType === "media") {
        box.style.background = `url('${savedFrame}') center/cover no-repeat`;
        box.innerHTML = `
            <div class="kill-content" style="padding: 0 10px; height: 40px; display: flex; align-items:center; gap:10px; width:100%; justify-content:center;">
                <div class="kill-avatar" style="width:30px; height:30px; border-radius:50%; border:2px solid white; overflow:hidden; flex-shrink:0;">
                    <img src="${userAvatar}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div class="kill-text" style="line-height:1.1;">
                    <span style="color:white; font-weight:bold; font-size:13px; text-transform:uppercase;">${userName}</span><br>
                    <span style="color:#ffc107; font-size:8px;">Shared a New Post!</span>
                </div>
            </div>`;
    } else {
        box.style.background = "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(33, 33, 33, 0.9) 15%, rgba(33, 33, 33, 0.9) 85%, rgba(0,0,0,0) 100%)";
        box.innerHTML = `
            <div class="kill-content" style="padding: 0 10px; height: 40px; display: flex; align-items:center; gap:13px; width:100%; justify-content:center;">
                <div class="kill-avatar" style="width:30px; height:30px; border-radius:50%; border:2px solid white; overflow:hidden;">
                    <img src="${userAvatar}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div class="kill-text">
                    <span style="color:white; font-weight:bold; text-transform:uppercase; font-size:13px;">${userName}</span>
                    <span style="color:#ff4444; margin-left:8px; font-size:10px;">Shared a Post!</span>
                </div>
            </div>`;
    }

    setTimeout(() => {
        box.classList.remove('kill-visible');
    }, 4500);
}

// ৪. নতুন ইভেন্ট নোটিফিকেশন চেক
async function checkNewEvents() {
    try {
        const response = await fetch(`https://api.github.com/repos/${githubUser}/${repoName}/contents/frames/post`);
        if (!response.ok) return;
        
        const files = await response.json();
        const actualFrames = files.filter(file => !file.name.startsWith('.') && !file.name.toLowerCase().includes('ocean'));
        const totalFramesInGithub = actualFrames.length;

        let lastSeenCount = localStorage.getItem('lastSeenEventCount') || 0;
        lastSeenCount = parseInt(lastSeenCount);

        updateEventNotification(totalFramesInGithub > lastSeenCount ? totalFramesInGithub - lastSeenCount : 0);
    } catch (error) { console.log("Event Check Error:", error); }
}

function updateEventNotification(count) {
    const eventCountElement = document.getElementById('event-count');
    const newTag = document.querySelector('.new-tag');
    if (eventCountElement) {
        if (count > 0) {
            eventCountElement.innerText = count;
            eventCountElement.style.display = 'inline-block';
            if(newTag) newTag.style.display = 'inline-block';
        } else {
            eventCountElement.style.display = 'none';
            if(newTag) newTag.style.display = 'none';
        }
    }
}

// ৫. শপ ও নেভিগেশন
async function openShop() {
    try {
        const response = await fetch(`https://api.github.com/repos/${githubUser}/${repoName}/contents/frames/post`);
        if (response.ok) {
            const files = await response.json();
            const actualFrames = files.filter(file => !file.name.startsWith('.') && !file.name.toLowerCase().includes('ocean'));
            localStorage.setItem('lastSeenEventCount', actualFrames.length);
        }
    } catch (e) { console.log(e); }
    window.location.href = "shop.html"; 
}

function goToProfile() { window.location.href = "profile.html"; }
function goToNotifications() {
    // এখানে আপনি চাইলে আরও কিছু কাজ করিয়ে নিতে পারেন
    window.location.href = "notification.html";
}
function openSearchPage() { window.location.href = "search.html"; }
// পোস্ট করার পেজে যাওয়ার ফাংশন
function goToCreatePost() {
    // এখানে আপনার পোস্ট তৈরি করার HTML ফাইলের নাম দিন
    window.location.href = "post.html"; 
}

// ৬. পেজ লোড এক্সিকিউশন
window.onload = function() {
    startClock(); 
    checkNewEvents();
    setTimeout(() => {
        triggerKillMessage("MITHU RAHMAN", "https://via.placeholder.com/100");
    }, 1000);
};