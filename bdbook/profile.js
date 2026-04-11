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

async function loadUserPosts() {
    if (!userEmail) return;

    try {
        const response = await fetch(`/api/user-posts?email=${userEmail}`);
        const posts = await response.json();
        
        // মিঠু ভাই, আপনার HTML অনুযায়ী এখানে আইডি হবে 'user-posts'
        const postContainer = document.getElementById('user-posts'); 

        if (!postContainer) return;

        postContainer.innerHTML = ""; 

        if (posts.length === 0) {
            postContainer.innerHTML = "<p style='text-align:center; color:gray; padding:20px;'>এখনো কোনো পোস্ট করা হয়নি!</p>";
            return;
        }

        posts.forEach(post => {
            postContainer.innerHTML += `
                <div class="post-card" style="background:#fff; margin-top:10px; padding:15px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.2);">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                        <img src="${post.userPic || 'placeholder.jpg'}" style="width:40px; height:40px; border-radius:50%;">
                        <div>
                            <h4 style="margin:0; font-size:14px;">${post.userName}</h4>
                            <small style="color:gray;">${new Date(post.createdAt).toLocaleString()}</small>
                        </div>
                    </div>
                    <div style="font-size:15px; margin-bottom:10px;">${post.postText}</div>
                    ${post.postMedia ? (post.mediaType === 'video' ? 
                        `<video src="${post.postMedia}" controls style="width:100%; border-radius:5px;"></video>` : 
                        `<img src="${post.postMedia}" style="width:100%; border-radius:5px;">`) : ''}
                </div>`;
        });
    } catch (err) { console.error("প্রোফাইল পোস্ট লোড এরর:", err); }
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