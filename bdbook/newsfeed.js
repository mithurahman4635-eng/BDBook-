const githubUser = "mithurahman4635-eng"; 
const repoName = "BDBook-"; 
let lastPostCount = 0; // নতুন পোস্ট চেক করার জন্য

// ১. রিয়েল ডিজিটাল ঘড়ি (আপনার দেওয়া কোড)
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

// ২. ফ্রেম রেন্ডার লজিক (আপনার দেওয়া কোড)
function createSafeFrame(code, userName, userAvatar) {
    const content = `<html><head><style>body { margin:0; padding:0; display:flex; justify-content:center; align-items:center; overflow:hidden; background:transparent; font-family: Arial, sans-serif; height: 40px; width: 100vw; } .frame-wrapper { position: relative; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; overflow: hidden; } .kill-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 99; pointer-events: none; } .kill-avatar { width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; overflow: hidden; margin-right: 10px; background: #444; flex-shrink: 0; } .kill-info { color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); line-height: 1.1; } .kill-name { font-weight: bold; font-size: 13px; text-transform: uppercase; display: block; white-space: nowrap; } .kill-sub { font-size: 8px; white-space: nowrap; opacity: 0.9; }</style></head><body><div class="frame-wrapper">${code}<div class="kill-overlay"><div class="kill-avatar"><img src="${userAvatar}" style="width:100%; height:100%; object-fit:cover;"></div><div class="kill-info"><span class="kill-name">${userName}</span><span class="kill-sub">Shared a New Post!</span></div></div></div></body></html>`;
    return `<iframe srcdoc='${content.replace(/'/g, "&apos;")}' style="width: 100vw; height: 40px; border: none; overflow: hidden; pointer-events: none; display: block; margin: 0; padding: 0;"></iframe>`;
}

// ৩. ডাটাবেস থেকে নিউজফিড লোড করার ফাংশন (এডিট করা হয়েছে শুধু ডাটা দেখানোর জন্য)
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

        // আপনার স্টাইল অনুযায়ী ডাটাবেসের পোস্ট বসানো হচ্ছে
        container.innerHTML = posts.map(post => `
            <div class="post-card" style="background:white; margin:15px; padding:15px; border-radius:12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                    <img src="${post.userPic || 'https://via.placeholder.com/100'}" style="width:45px; height:45px; border-radius:50%; border:2px solid #1877f2;">
                    <div>
                        <h4 style="margin:0; font-size:15px;">${post.userName}</h4>
                        <small style="color:gray;">${new Date(post.createdAt).toLocaleString()}</small>
                    </div>
                </div>
                <div style="font-size:16px; margin-bottom:10px;">${post.postText}</div>
                ${post.postMedia ? (post.mediaType === 'video' ? 
                    `<video src="${post.postMedia}" controls style="width:100%; border-radius:8px;"></video>` : 
                    `<img src="${post.postMedia}" style="width:100%; border-radius:8px;">`) : ''}
            </div>
        `).join('');
    } catch (e) { console.log("Newsfeed Load Error:", e); }
}

// ৪. কিলিং মেসেজ ট্রিগার (আপনার দেওয়া কোড)
function triggerKillMessage(userName, userAvatar) {
    const box = document.getElementById('kill-message-box');
    if (!box) return;

    const savedFrame = localStorage.getItem('activeFrameSource');
    const frameType = localStorage.getItem('activeFrameType');

    box.innerHTML = ''; 
    box.className = 'kill-visible'; 

    if (savedFrame && frameType === "code") {
        box.innerHTML = createSafeFrame(savedFrame, userName, userAvatar);
    } else {
        box.style.background = "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(33, 33, 33, 0.9) 15%, rgba(33, 33, 33, 0.9) 85%, rgba(0,0,0,0) 100%)";
        box.innerHTML = `<div class="kill-content" style="padding: 0 10px; height: 40px; display: flex; align-items:center; gap:13px; width:100%; justify-content:center;"><div class="kill-avatar" style="width:30px; height:30px; border-radius:50%; border:2px solid white; overflow:hidden;"><img src="${userAvatar}" style="width:100%; height:100%; object-fit:cover;"></div><div class="kill-text"><span style="color:white; font-weight:bold; text-transform:uppercase; font-size:13px;">${userName}</span><span style="color:#ff4444; margin-left:8px; font-size:10px;">Shared a Post!</span></div></div>`;
    }

    setTimeout(() => box.classList.remove('kill-visible'), 4500);
}

// ৫. ইভেন্ট চেক ও নেভিগেশন (আপনার দেওয়া কোড)
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

// নেভিগেশন ফাংশনগুলো
function goToProfile() { window.location.href = "profile.html"; }
function goToCreatePost() { window.location.href = "post.html"; }
function openShop() { window.location.href = "shop.html"; }

// ৬. পেজ লোড এক্সিকিউশন (আপনার দেওয়া স্ট্রাকচার)
window.onload = function() {
    startClock(); 
    checkNewEvents();
    loadNewsfeed(); // এখানে কল করা হয়েছে
    setInterval(loadNewsfeed, 10000); 
};