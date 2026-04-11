// ১. ইউজার ডাটা ও পোস্ট লোড করার লজিক
const urlParams = new URLSearchParams(window.location.search);
const userEmail = urlParams.get('email');

// ডাটাবেস থেকে ইউজারের তথ্য আনা
async function loadProfileData() {
    if (!userEmail) return;

    try {
        const response = await fetch(`/api/get-profile?email=${userEmail}`);
        if (response.ok) {
            const data = await response.json();
            if(data.name) document.getElementById('name-display').innerText = data.name;
            if(data.bio) document.getElementById('bio-display').innerText = data.bio;
            if(data.location) document.getElementById('loc-display').innerText = data.location;
            if(data.relationship) document.getElementById('rel-display').innerText = data.relationship;
            if(data.dob) document.getElementById('dob-display').innerText = data.dob;
            if(data.profilePic) document.getElementById('display-pic').src = data.profilePic;
        }
    } catch (err) { console.error("প্রোফাইল ডাটা এরর:", err); }
}

// ২. মিঠু ভাই, এই অংশটি আমি নতুন যোগ করলাম আপনার পোস্টগুলো দেখানোর জন্য
async function loadUserPosts() {
    if (!userEmail) return;

    try {
        const response = await fetch(`/api/user-posts?email=${userEmail}`);
        const posts = await response.json();
        const postContainer = document.getElementById('user-post-container'); // আপনার HTML এ এই ID থাকতে হবে

        if (!postContainer) return;

        postContainer.innerHTML = ""; // আগের ডাটা পরিষ্কার

        if (posts.length === 0) {
            postContainer.innerHTML = "<p style='text-align:center; color:gray; padding:20px;'>আপনি এখনো কোনো পোস্ট করেননি!</p>";
            return;
        }

        posts.forEach(post => {
            postContainer.innerHTML += `
                <div class="profile-post-card" style="background:#fff; margin-bottom:15px; border-radius:10px; overflow:hidden; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                    <div style="padding:10px; display:flex; align-items:center; gap:10px;">
                        <img src="${post.userPic || 'default-avatar.png'}" style="width:35px; height:35px; border-radius:50%;">
                        <b style="font-size:14px;">${post.userName}</b>
                    </div>
                    <div style="padding:0 10px 10px 10px; font-size:14px;">${post.postText}</div>
                    ${post.postMedia ? (post.mediaType === 'video' ? 
                        `<video src="${post.postMedia}" controls style="width:100%;"></video>` : 
                        `<img src="${post.postMedia}" style="width:100%;">`) : ''}
                </div>`;
        });
    } catch (err) { console.error("পোস্ট লোড এরর:", err); }
}

// ৩. ফলো বাটন লজিক (অপরিবর্তিত)
let isFollowed = false;
function handleFollow() {
    const btn = document.getElementById('main-follow-btn');
    const count = document.getElementById('f-count');
    let current = parseInt(count.innerText);
    if (!isFollowed) {
        current++;
        btn.innerHTML = '<i class="fas fa-check"></i> Following';
        btn.classList.add('active');
        isFollowed = true;
    } else {
        current--;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
        btn.classList.remove('active');
        isFollowed = false;
    }
    count.innerText = current;
}

// ৪. অন্যান্য কন্ট্রোল (See More, Modal, Search) - আপনার আগের কোড সব ঠিক আছে
function toggleExtraInfo() {
    const box = document.getElementById('extra-data-box');
    box.classList.toggle('active');
    document.querySelector('.more-toggle-btn').innerText = box.classList.contains('active') ? "See Less" : "See More About";
}

function openFollowList(type) {
    const modal = document.getElementById('follow-modal-overlay');
    if(modal) {
        document.getElementById('modal-title').innerText = type.toUpperCase();
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; 
    }
}

function closeFollowList() {
    const modal = document.getElementById('follow-modal-overlay');
    if(modal) {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto'; 
    }
}

// ৫. পেজ লোড হলে কল করা
window.addEventListener('DOMContentLoaded', () => {
    loadProfileData(); // নাম-ছবি লোড হবে
    loadUserPosts();   // ইউজারের নিজের পোস্টগুলো লোড হবে (নতুন যোগ করা)
    
    document.body.style.overflowY = "auto";
    document.documentElement.style.overflowY = "auto";
});