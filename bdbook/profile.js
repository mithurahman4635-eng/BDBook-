// ১. ইউজার ডাটা লোড করার লজিক (MongoDB থেকে)
const urlParams = new URLSearchParams(window.location.search);
const userEmail = urlParams.get('email');

async function loadProfileData() {
    if (!userEmail) {
        console.log("ইমেইল পাওয়া যায়নি, তাই ডাটা লোড করা যাচ্ছে না।");
        return;
    }

    try {
        const response = await fetch(`/api/get-profile?email=${userEmail}`);
        if (response.ok) {
            const data = await response.json();

            // HTML-এ ডাটা সেট করা
            if(data.name) document.getElementById('name-display').innerText = data.name;
            if(data.bio) document.getElementById('bio-display').innerText = data.bio;
            if(data.location) document.getElementById('loc-display').innerText = data.location;
            if(data.relationship) document.getElementById('rel-display').innerText = data.relationship;
            if(data.dob) document.getElementById('dob-display').innerText = data.dob;
            
            // ডাটাবেসে ছবি থাকলে সেটি দেখানো
            if(data.profilePic) {
                document.getElementById('display-pic').src = data.profilePic;
            }
        }
    } catch (err) {
        console.error("ডাটা লোড করতে সমস্যা হয়েছে:", err);
    }
}

// ২. ফলো বাটন লজিক
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

// ৩. See More তথ্য দেখানো
function toggleExtraInfo() {
    const box = document.getElementById('extra-data-box');
    box.classList.toggle('active');
    const btn = document.querySelector('.more-toggle-btn');
    btn.innerText = box.classList.contains('active') ? "See Less" : "See More About";
}

// ৪. মোডাল কন্ট্রোল (ফলোয়ার লিস্ট)
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

// ৫. সার্চ লজিক
function filterUsers() {
    const term = document.getElementById('user-search').value.toLowerCase();
    const items = document.querySelectorAll('.list-user-row');
    items.forEach(item => {
        const name = item.innerText.toLowerCase();
        item.style.display = name.startsWith(term) ? 'flex' : 'none';
    });
}

// ৬. ফটো আপলোড (এটি ক্লায়েন্ট সাইড প্রিভিউয়ের জন্য)
function uploadPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const profilePic = document.getElementById('display-pic');
            if(profilePic) {
                profilePic.src = e.target.result;
                localStorage.setItem('userProfilePic', e.target.result);
                alert("প্রোফাইল ফটো আপডেট হয়েছে!");
            }
        };
        reader.readAsDataURL(file);
    }
}

// পেজ লোড হলে সব ডাটা এবং সেটিংস রান করা
window.addEventListener('DOMContentLoaded', () => {
    // ডাটাবেস থেকে তথ্য আনা
    loadProfileData();

    // আগের সেভ করা ছবি থাকলে দেখানো (অপশনাল)
    const savedPic = localStorage.getItem('userProfilePic');
    if (savedPic && document.getElementById('display-pic')) {
        // যদি ডাটাবেসের ছবি লোড না হয় তবে লোকালটা দেখাবে
        if(!document.getElementById('display-pic').getAttribute('src')) {
            document.getElementById('display-pic').src = savedPic;
        }
    }
    
    // স্ক্রল ফিক্স
    document.body.style.overflowY = "auto";
    document.documentElement.style.overflowY = "auto";
});