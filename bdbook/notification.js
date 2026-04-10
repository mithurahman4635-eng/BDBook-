// নোটিফিকেশন ক্লিক করলে যা হবে (পড়া হয়েছে মার্ক করা + অটোমেটিক নেভিগেশন)
function handleNotiClick(id) {
    let savedNotis = JSON.parse(localStorage.getItem('bdbook_notifications')) || [];
    const index = savedNotis.findIndex(n => n.id === id);
    
    if (index !== -1) {
        const clickedNoti = savedNotis[index];

        // ১. পড়া হয়েছে হিসেবে সেভ করা
        if (clickedNoti.unread) {
            savedNotis[index].unread = false;
            localStorage.setItem('bdbook_notifications', JSON.stringify(savedNotis));
            renderNotifications();
        }

        // ২. অটোমেটিক নেভিগেশন লজিক (মিঠু ভাইর চাহিদা অনুযায়ী)
        setTimeout(() => {
            if (clickedNoti.type === 'like' || clickedNoti.type === 'comment') {
                // লাইক বা কমেন্ট হলে ওই নির্দিষ্ট পোস্টে নিয়ে যাবে
                // এখানে আপনার পোস্টের আইডি অনুযায়ী লিঙ্ক হবে
                window.location.href = `post-details.html?id=${clickedNoti.postId || ''}`;
            } 
            else if (clickedNoti.type === 'friend' || clickedNoti.type === 'follow') {
                // ফলো বা ফ্রেন্ড রিকোয়েস্ট হলে ওই ইউজারের প্রোফাইলে নিয়ে যাবে
                window.location.href = `user-profile.html?userId=${clickedNoti.senderId || ''}`;
            }
        }, 300); // ৩০০ মিলি-সেকেন্ড দেরি যাতে ইউজার ক্লিক করার ইফেক্টটা দেখে
    }
}