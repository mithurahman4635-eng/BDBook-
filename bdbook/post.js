// ১. আইডি চেনার মাস্টার লজিক
const urlParams = new URLSearchParams(window.location.search);
let userEmail = urlParams.get('email'); // প্রথমে লিংকে খুঁজবে

if (!userEmail) {
    userEmail = localStorage.getItem('userEmail'); // লিংকে না পেলে মেমোরিতে খুঁজবে
} else {
    localStorage.setItem('userEmail', userEmail); // লিংকে পেলে সেটা মেমোরিতেও সেভ করে রাখবে
}

// যদি মেমোরিতেও না থাকে, তবেই লগইন পেজে পাঠাবে (মিঠু রহমান ধরবে না)
if (!userEmail) {
    alert("আপনার সেশন শেষ! আবার লগইন করুন।");
    window.location.href = "login.html";
}
document.addEventListener("DOMContentLoaded", async () => {
    // ১. ইউআরএল থেকে ইমেইল খুঁজবে, না পেলে লোকাল স্টোরেজ থেকে নেবে
    const urlParams = new URLSearchParams(window.location.search);
    let userEmail = urlParams.get('email');

    // যদি URL এ ইমেইল না থাকে, তবে লোকাল স্টোরেজ থেকে চেক করবে
    if (!userEmail) {
        userEmail = localStorage.getItem('userEmail');
    } else {
        // যদি URL এ পায়, তবে সেটা স্টোরেজে সেভ করে রাখবে যাতে হারিয়ে না যায়
        localStorage.setItem('userEmail', userEmail);
    }
    
    if (userEmail) {
        try {
            const response = await fetch(`/api/get-profile?email=${userEmail}`);
            const data = await response.json();
            
            if (data && data.name) {
                // প্রোফাইল ছবি সেট করা (আপনার Pori আইডির ছবি আসবে)
                const profileImg = document.getElementById('profile-img');
                if (profileImg && data.profilePic) {
                    profileImg.src = data.profilePic;
                }
                
                // প্রোফাইল নাম সেট করা (Mithu Rahman এর জায়গায় Pori আসবে)
                const nameHeader = document.querySelector('.user-meta h4');
                if (nameHeader) {
                    nameHeader.innerHTML = `${data.name} <span id="dynamic-tags" class="tags-inline"></span>`;
                }
            }
        } catch (err) {
            console.log("প্রোফাইল লোড করা যায়নি", err);
        }
    }
});

// --- আপনার অন্যান্য ফিচার (handleInput, applyNewStyle, openModal) সব ঠিক আছে ---

// ৮. পোস্ট পাবলিশ করা (ফেসবুক লজিক - সবার পোস্ট নিউজফিডে যাবে)
async function publishPost() {
    const editor = document.getElementById('post-editor');
    const text = editor.innerHTML.trim(); 
    
    const mediaInput = document.getElementById('media-input');
    const mediaFile = mediaInput.files ? mediaInput.files[0] : null;
    
    // বর্তমান ইউজারের ইমেইল (URL অথবা Storage থেকে)
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') || localStorage.getItem('userEmail'); 

    if (!email) {
        alert("কোনো আইডি লগইন করা নেই! আবার লগইন করুন।");
        return;
    }

    const formData = new FormData();
    formData.append('email', email); // সার্ভার এই ইমেইল দেখে 'Pori' কে খুঁজে নেবে
    formData.append('text', text);
    if (mediaFile) {
        formData.append('mediaFile', mediaFile);
    }

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
            alert("✅ পোস্ট সফল হয়েছে!");
            // নিউজফিডে যাওয়ার সময় নিজের আইডি (Email) সাথে নিয়ে যাবে
            window.location.href = `newsfeed.html?email=${email}`; 
        } else {
            alert("ভুল হয়েছে: " + result.message);
        }
    } catch (err) {
        console.error("Error:", err);
        alert("সার্ভার কানেকশন এরর!");
    } finally {
        btn.innerText = "Post";
        btn.disabled = false;
    }
}