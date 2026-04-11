const githubUser = "mithurahman4635-eng"; 
const repoName = "BDBook-"; 

let psBalance = localStorage.getItem('psBalance') ? parseInt(localStorage.getItem('psBalance')) : 5000;
let myInventory = JSON.parse(localStorage.getItem('myInventory')) || [];
let activeFrameId = localStorage.getItem('activeFrameId') || "";

function goBack() { window.location.href = "newsfeed.html"; }

function updateBalanceUI() {
    const balanceElement = document.getElementById('ps-balance');
    if(balanceElement) balanceElement.innerText = psBalance;
}

// মিঠু ভাই, এই ফাংশনটিই ফ্রেমকে বক্সে আটকে রাখবে (Iframe Logic)
function createSafePreview(code) {
    return `<iframe srcdoc='<html><head><style>body{margin:0;display:flex;justify-content:center;align-items:center;overflow:hidden;background:transparent;height:100vh;}</style></head><body>${code.replace(/'/g, "&apos;")}</body></html>' 
            style="width:100%; height:100%; border:none; pointer-events:none;"></iframe>`;
}

// ১. গিটহাব থেকে ফাইল লোড করার মেইন ফাংশন
async function fetchFramesFromGithub(category) {
    const grid = document.getElementById('items-grid');
    grid.innerHTML = "<p style='text-align:center;'>লোড হচ্ছে মিঠু ভাই...</p>";

    let folderName = category === 'all' ? 'post' : category;
    if (category === 'my-event') { renderInventory(); return; }

    try {
        const response = await fetch(`https://api.github.com/repos/${githubUser}/${repoName}/contents/frames/${folderName}`);
        if (!response.ok) throw new Error("ফাইল পাওয়া যায়নি");
        
        let files = await response.json();
        const actualFiles = files.filter(f => !f.name.startsWith('.') && !f.name.toLowerCase().includes('ocean')).reverse();

        grid.innerHTML = ''; 
        
        for (let [index, file] of actualFiles.entries()) {
            const fileNameLower = file.name.toLowerCase();
            let previewContent = "";
            let itemType = fileNameLower.endsWith('.html') ? "code" : "media"; 
            
            const parts = file.name.split('.')[0].split('-');
            const displayName = parts[0].toUpperCase();
            const price = parts[1] || "500";
            const isOwned = myInventory.some(owned => owned.id === file.name);
            let newTag = (index === 0) ? `<div class="unique-new-tag">NEW</div>` : "";

            if (itemType === "code") {
                const res = await fetch(file.download_url);
                const code = await res.text();
                // এখানে ফ্রেমকে আইফ্রেমের ভেতর ঢোকানো হলো
                previewContent = createSafePreview(code);
            } else {
                previewContent = `<img src="${file.download_url}" style="width:100%; height:100%; object-fit:contain;">`;
            }

            grid.innerHTML += `
                <div class="item-card">
                    ${newTag}
                    <div class="preview-box">
                        <div class="frame-preview-container">${previewContent}</div>
                    </div>
                    <h4 style="margin: 8px 0;">${displayName}</h4>
                    ${isOwned ? 
                        `<button class="owned-tag" style="background:#4caf50; color:white; border:none; padding:8px; border-radius:5px; width:100%;">কেনা হয়েছে</button>` : 
                        `<button class="buy-btn" onclick="buyItem('${displayName}', '${file.download_url}', ${price}, '${file.name}', '${itemType}')">
                            <span style="color:#ffc107;">PS</span> ${price}
                        </button>`}
                </div>`;
        }
    } catch (error) {
        grid.innerHTML = `<p style='text-align:center; color:red;'>সমস্যা: ${error.message}</p>`;
    }
}

// ২. My Event রেন্ডার করার ফাংশন
async function renderInventory() {
    const grid = document.getElementById('items-grid');
    grid.innerHTML = "<p style='text-align:center;'>লোড হচ্ছে আপনার ইনভেন্টরি...</p>";
    
    if (myInventory.length === 0) {
        grid.innerHTML = "<p style='text-align:center;'>আপনার কাছে কিছু নেই!</p>";
        return;
    }

    grid.innerHTML = ''; 
    for (let item of myInventory) {
        const isActive = activeFrameId === item.id;
        const btnStyle = isActive ? "background:black; color:white;" : "background:#1877f2; color:white;";
        const btnText = isActive ? "SUCCESS" : "USE";

        let itemPreview = "";
        if (item.type === "code") {
            const res = await fetch(item.source);
            const code = await res.text();
            itemPreview = createSafePreview(code);
        } else {
            itemPreview = `<img src="${item.source}" style="width:100%; height:100%; object-fit:contain;">`;
        }

        grid.innerHTML += `
            <div class="item-card">
                <div class="preview-box">
                    <div class="frame-preview-container">${itemPreview}</div>
                </div>
                <h4 style="margin:5px 0;">${item.name}</h4>
                <button class="use-btn" style="border:none; padding:10px; border-radius:5px; width:100%; font-weight:bold; ${btnStyle}" 
                        onclick="useItem('${item.source}', '${item.type}', '${item.id}')">
                    ${btnText}
                </button>
            </div>`;
    }
}

// ৩. বাকি লজিকগুলো (Use, Buy, Tabs)
async function useItem(source, type, id) {
    let finalSource = source;
    if (type === "code") {
        const res = await fetch(source);
        finalSource = await res.text();
    }
    localStorage.setItem('activeFrameSource', finalSource);
    localStorage.setItem('activeFrameType', type);
    localStorage.setItem('activeFrameId', id);
    activeFrameId = id;
    alert("সফলভাবে সেট হয়েছে!");
    renderInventory(); 
}

// ৩. বাকি লজিকগুলো (Use, Buy, Tabs)
async function useItem(source, type, id) {
    let finalSource = source;
    if (type === "code") {
        const res = await fetch(source);
        finalSource = await res.text();
    }
    localStorage.setItem('activeFrameSource', finalSource);
    localStorage.setItem('activeFrameType', type);
    localStorage.setItem('activeFrameId', id);
    activeFrameId = id;
    
    alert("সফলভাবে সেট হয়েছে!");
    renderInventory(); 
    
    // মিঠু ভাই, এই লাইনটি যোগ হলো ডাটাবেসে সেভ করার জন্য
    syncShopWithDatabase(); 
}

function buyItem(name, source, price, id, type) {
    if (psBalance >= price) {
        psBalance -= price;
        myInventory.push({ id: id, name: name, source: source, type: type });
        localStorage.setItem('psBalance', psBalance);
        localStorage.setItem('myInventory', JSON.stringify(myInventory));
        updateBalanceUI();
        
        alert(name + " কেনা হয়েছে!");
        fetchFramesFromGithub('post'); 
        
        // এখানেও সিঙ্ক ফাংশনটি বসবে
        syncShopWithDatabase(); 
    } else { alert("পর্যাপ্ত PS নেই!"); }
}
function buyItem(name, source, price, id, type) {
    if (psBalance >= price) {
        psBalance -= price;
        myInventory.push({ id: id, name: name, source: source, type: type });
        localStorage.setItem('psBalance', psBalance);
        localStorage.setItem('myInventory', JSON.stringify(myInventory));
        updateBalanceUI();
        alert(name + " কেনা হয়েছে!");
        fetchFramesFromGithub('post'); 
    } else { alert("পর্যাপ্ত PS নেই!"); }
}

function switchTab(element, category) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    fetchFramesFromGithub(category);
}

window.onload = () => {
    updateBalanceUI();
    fetchFramesFromGithub('post');
};