// ১. ফলো বাটন লজিক (ক্লিক করলে কাজ করবে)
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

// ২. See More তথ্য দেখানো
function toggleExtraInfo() {
    const box = document.getElementById('extra-data-box');
    box.classList.toggle('active');
    const btn = document.querySelector('.more-toggle-btn');
    btn.innerText = box.classList.contains('active') ? "See Less" : "See More About";
}

// ৩. ফলোয়ার লিস্ট মোডাল
function openFollowList(type) {
    document.getElementById('modal-title').innerText = type.toUpperCase();
    document.getElementById('follow-modal-overlay').classList.add('open');
}

function closeFollowList() {
    document.getElementById('follow-modal-overlay').classList.remove('open');
}

// ৪. নামের প্রথম শব্দ দিয়ে সার্চ
function filterUsers() {
    const term = document.getElementById('user-search').value.toLowerCase();
    const items = document.querySelectorAll('.list-user-row');
    items.forEach(item => {
        const name = item.innerText.toLowerCase();
        item.style.display = name.startsWith(term) ? 'flex' : 'none';
    });
}
// --- ফটো আপলোড এবং স্ক্রল সমস্যার সমাধান ---

function uploadPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // ১. প্রোফাইল ফটো পরিবর্তন করা
            const profilePic = document.getElementById('display-pic');
            if(profilePic) {
                profilePic.src = e.target.result;
                // ২. ছবিটা সেভ করে রাখা যাতে রিফ্রেশ করলে না যায়
                localStorage.setItem('userProfilePic', e.target.result);
                alert("প্রোফাইল ফটো আপডেট হয়েছে!");
            }
        };
        reader.readAsDataURL(file);
    }
}

// পেজ লোড হলে সেভ করা ছবি ফিরিয়ে আনা
window.addEventListener('DOMContentLoaded', () => {
    const savedPic = localStorage.getItem('userProfilePic');
    if (savedPic && document.getElementById('display-pic')) {
        document.getElementById('display-pic').src = savedPic;
    }
    
    // স্ক্রল ফিক্স: নিশ্চিত করা যে বডি স্ক্রল করা যাচ্ছে
    document.body.style.overflowY = "auto";
    document.documentElement.style.overflowY = "auto";
});

// মোডাল ক্লোজ করার সময় স্ক্রল সচল রাখা
function closeFollowList() {
    const modal = document.getElementById('follow-modal-overlay');
    if(modal) {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto'; // স্ক্রল আবার চালু
    }
}

// মোডাল ওপেন করার সময় মেইন পেজ লক করা (প্রফেশনাল লুকের জন্য)
function openFollowList(type) {
    const modal = document.getElementById('follow-modal-overlay');
    if(modal) {
        document.getElementById('modal-title').innerText = type.toUpperCase();
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // বক্স খুললে নিচের পেজ সরবে না
    }
}