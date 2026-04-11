document.addEventListener("DOMContentLoaded", async () => {
    // ১. ইউআরএল থেকে ইমেইল খুঁজবে, না পেলে লোকাল স্টোরেজ থেকে নেবে
    const urlParams = new URLSearchParams(window.location.search);
    const userEmail = urlParams.get('email') || localStorage.getItem('userEmail');
    
    if (userEmail) {
        try {
            const response = await fetch(`/api/get-profile?email=${userEmail}`);
            const data = await response.json();
            
            if (data && data.name) {
                // প্রোফাইল ছবি সেট করা
                if (data.profilePic) {
                    document.getElementById('profile-img').src = data.profilePic;
                }
                // প্রোফাইল নাম সেট করা (যাতে 'Pori' বা সঠিক নাম দেখায়)
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

// --- আপনার ইনপুট, স্টাইল এবং মডাল ফিচারগুলো এখানে থাকবে (পরিবর্তন করার প্রয়োজন নেই) ---
// (আপনার দেওয়া handleInput, applyNewStyle, openModal ফাংশনগুলো আগের মতোই কাজ করবে)

// ৮. পোস্ট পাবলিশ করা (সংশোধিত ও ফিক্সড)
async function publishPost() {
    const editor = document.getElementById('post-editor');
    // মিঠু ভাই, স্টাইলসহ টেক্সট ডাটাবেসে পাঠাতে innerHTML ব্যবহার করুন
    const text = editor.innerHTML.trim(); 
    
    const mediaInput = document.getElementById('media-input');
    const mediaFile = mediaInput.files ? mediaInput.files[0] : null;
    
    // বর্তমান ইউজারের ইমেইল নিশ্চিত করা
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') || localStorage.getItem('userEmail'); 

    if (!email) {
        alert("ইউজার ইমেইল পাওয়া যায়নি! দয়া করে লগইন করে আবার আসুন।");
        return;
    }

    const formData = new FormData();
    formData.append('email', email); // এই ইমেইলটি সার্ভারকে বলবে পোস্টটি কার
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
            alert("✅ পোস্ট সফল হয়েছে, মিঠু ভাই!");
            // নিউজফিডে যাওয়ার সময় ইমেইলটি সাথে রাখুন যাতে প্রোফাইল ঠিক থাকে
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