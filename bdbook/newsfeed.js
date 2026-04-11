const githubUser = "mithurahman4635-eng"; 
const repoName = "BDBook-"; 
let lastPostCount = 0; 

// ১. রিয়েল ডিজিটাল ঘড়ি
function startClock() {
    const clockElement = document.getElementById('clock');
    if(clockElement) {
        setInterval(() => {
            const now = new Date();
            let hours = now.getHours().toString().padStart(2, '0');
            let minutes = now.getMinutes().toString().padStart(2, '0');
            let seconds = now.getSeconds().toString().padStart(2, '0');
            clockElement.innerText = `${hours}:${minutes}:${seconds}`;
        }, 1000);
    }
}

// ২. ফ্রেম রেন্ডার লজিক (আপনার অরিজিনাল কোড)
function createSafeFrame(code, userName, userAvatar) {
    const content = `<html><head><style>body { margin:0; padding:0; display:flex; justify-content:center; align-items:center; overflow:hidden; background:transparent; font-family: Arial, sans-serif; height: 40px; width: 100vw; } .frame-wrapper { position: relative; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; overflow: hidden; } .kill-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 99; pointer-events: none; } .kill-avatar { width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; overflow: hidden; margin-right: 10px; background: #444; flex-shrink: 0; } .kill-info { color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); line-height: 1.1; } .kill-name { font-weight: bold; font-size: 13px; text-transform: uppercase; display: block; white-space: nowrap; } .kill-sub { font-size: 8px; white-space: nowrap; opacity: 0.9; }</style></head><body><div class="frame-wrapper">${code}<div class="kill-overlay"><div class="kill-avatar"><img src="${userAvatar}" style="width:100%; height:100%; object-fit:cover;"></div><div class="kill-info"><span class="kill-name">${userName}</span><span class="kill-sub">Shared a New Post!</span></div></div></div></body></html>`;
    return `<iframe srcdoc='${content.replace(/'/g, "&apos;")}' style="width: 100vw; height: 40px; border: none; overflow: hidden; pointer-events: none; display: block; margin: 0; padding: 0;"></iframe>`;
}

// ৩. ডাটাবেস থেকে নিউজফিড লোড করা
async function loadNewsfeed() {
    try {
        const response = await fetch('/api/newsfeed');
        const posts = await response.json();
        
        // রিয়েল-টাইম কিলিং মেসেজ ট্রিগার
        if (posts.length > lastPostCount && lastPostCount !== 0) {
            const latest = posts[0];
            triggerKillMessage(latest.userName, latest.userPic || "https://via.placeholder.com/100");
        }
        lastPostCount = posts.length;

        const container = document.getElementById('all-posts-feed');
        if (!container) return;

        // ডাটাবেস থেকে পাওয়া পোস্টগুলো আপনার ডিজাইনের কার্ডে বসানো
        container.innerHTML = posts.map(post => `
            <div class="post-card">
                <div class="post-header">
                    <img src="${post.userPic || 'https://via.placeholder.com/50'}" class="post-avatar">
                    <div class="post-info">
                        <h4>${post.userName}</h4>
                        <span>${new Date(post.createdAt).toLocaleString()} · <i class="fas fa-globe-americas"></i></span>
                    </div>
                </div>
                <div class="post-content">
                    ${post.postText}
                </div>
                <div class="post-media-box">
                    ${post.postMedia ? (post.mediaType === 'video' ? 
                        `<video src="${post.postMedia}" controls style="width:100%; border-radius:8px;"></video>` : 
                        `<img src="${post.postMedia}" style="width:100%; border-radius:8px;">`) : ''}
                </div>
                <div class="post-stats">
                    <span><i class="fas fa-thumbs-up"></i> ${post.likes ? post.likes.length : 0}</span>
                    <span>10 Comments</span>
                </div>
            </div>
        `).join('');
    } catch (e) { console.log("Newsfeed Load Error:", e); }
}

// ৪. কিলিং মেসেজ ট্রিগার
function triggerKillMessage(userName, userAvatar) {
    const box = document.getElementById('kill-message-box');
    if (!box) return;

    const savedFrame = localStorage.getItem('activeFrameSource');
    const frameType = localStorage.getItem('activeFrameType');

    box.innerHTML = ''; 
    box.style.display = 'block'; 

    if (savedFrame && frameType === "code") {
        box.innerHTML = createSafeFrame(savedFrame, userName, userAvatar);
    } else {
        box.innerHTML = `<div class="kill-content" style="padding: 0 10px; height: 40px; display: flex; align-items:center; gap:13px; width:100%; justify-content:center;"><div class="kill-avatar" style="width:30px; height:30px; border-radius:50%; border:2px solid white; overflow:hidden;"><img src="${userAvatar}" style="width:100%; height:100%; object-fit:cover;"></div><div class="kill-text"><span style="color:white; font-weight:bold; text-transform:uppercase; font-size:13px;">${userName}</span><span style="color:#ff4444; margin-left:8px; font-size:10px;">Shared a Post!</span></div></div>`;
    }

    setTimeout(() => box.style.display = 'none', 4500);
}

// ৫. ইভেন্ট চেক ও নেভিগেশন
async function checkNewEvents() {
    try {
        const response = await fetch(`https://api.github.com/repos/${githubUser}/${repoName}/contents/frames/post`);
        if (!response.ok) return;
        const files = await response.json();
        const actualFrames = files.filter(file => !file.name.startsWith('.') && !file.name.toLowerCase().includes('ocean'));
        updateEventNotification(actualFrames.length > (localStorage.getItem('lastSeenEventCount') || 0) ? actualFrames.length - localStorage.getItem('lastSeenEventCount') : 0);
    } catch (error) { console.log(error); }
}

function updateEventNotification(count) {
    const eventCountElement = document.getElementById('event-count');
    if (eventCountElement) {
        eventCountElement.innerText = count;
        eventCountElement.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function goToProfile() { window.location.href = "profile.html"; }
function goToCreatePost() { window.location.href = "post.html"; }
function openShop() { window.location.href = "shop.html"; }

// ৬. পেজ লোড এক্সিকিউশন
window.onload = function() {
    startClock(); 
    checkNewEvents();
    loadNewsfeed(); 
    setInterval(loadNewsfeed, 5000); // ৫ সেকেন্ড পর পর নতুন পোস্ট চেক করবে
};