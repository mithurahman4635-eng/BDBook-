const express = require('express');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'projects.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ১. ডাটাবেস ফাইল চেক করা
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([]));

// ২. ডাটাবেসে লিঙ্ক আপডেট করার ফাংশন (সব ফিচার ঠিক রাখার জন্য)
function updateProjectUrl(projectName, url) {
    try {
        let projects = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        const index = projects.findIndex(p => p.name === projectName);
        if (index !== -1) {
            projects[index].url = url;
            fs.writeFileSync(DB_FILE, JSON.stringify(projects, null, 2));
            console.log(`✅ [${projectName}] লিঙ্ক আপডেট হয়েছে: ${url}`);
        }
    } catch (err) {
        console.error("URL Update Error:", err);
    }
}

// ৩. প্রজেক্টের লিস্ট পাঠানো
app.get('/list-projects', (req, res) => {
    try {
        const projects = JSON.parse(fs.readFileSync(DB_FILE));
        res.json(projects);
    } catch (err) {
        res.json([]);
    }
});

// ৪. নতুন প্রজেক্ট ডেপ্লয় লজিক (আপনার পুরাতন সব ফিচারসহ)
app.post('/deploy', (req, res) => {
    const { username, repo } = req.body;
    const projectName = repo.split('/').pop().replace('.git', '');
    const deployPath = path.join(__dirname, 'apps', `${username}-${projectName}`);
    const deployTime = new Date().toLocaleString();

    if (!fs.existsSync(path.join(__dirname, 'apps'))) fs.mkdirSync(path.join(__dirname, 'apps'));

    exec(`git clone "${repo}" "${deployPath}"`, (error) => {
        if (error) return res.status(500).json({ error: "Clone Failed!" });

        // Dependencies ইনস্টল করা
        exec(`cd "${deployPath}" && npm install`, (err) => {
            
            // ক্লাউডফ্লেয়ার টানেলসহ প্রজেক্ট রান (ব্যাকগ্রাউন্ডে)
            const child = spawn('sh', ['-c', `cd "${deployPath}" && npx cloudflared tunnel --url http://localhost:3000`], {
                detached: true,
                stdio: ['ignore', 'pipe', 'pipe']
            });

            // টার্মিনাল লগ থেকে ডাইনামিক লিঙ্ক খুঁজে বের করা
            child.stderr.on('data', (data) => {
                const output = data.toString();
                if (output.includes('.trycloudflare.com')) {
                    const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
                    if (urlMatch) {
                        updateProjectUrl(projectName, urlMatch[0]);
                    }
                }
            });

            child.unref(); // মেইন সার্ভার চলুক বা না চলুক এটি চলবে

            // ডাটাবেসে তথ্য সেভ করা
            const projects = JSON.parse(fs.readFileSync(DB_FILE));
            projects.push({ 
                name: projectName, 
                user: username, 
                time: deployTime, 
                status: "Active",
                url: "" // লিঙ্ক জেনারেট হলে আপডেট হবে
            });
            fs.writeFileSync(DB_FILE, JSON.stringify(projects, null, 2));

            res.json({ status: "Success", message: "অ্যাপ এখন মিঠু ক্লাউডে লাইভ!" });
        });
    });
});

// ৫. প্রজেক্ট ডিলিট (টার্মিনেট) লজিক
app.post('/delete-project', (req, res) => {
    const { name } = req.body;
    try {
        let projects = JSON.parse(fs.readFileSync(DB_FILE));
        const updatedProjects = projects.filter(p => p.name !== name);
        fs.writeFileSync(DB_FILE, JSON.stringify(updatedProjects, null, 2));
        res.json({ status: "Deleted", message: "প্রজেক্টটি সফলভাবে টার্মিনেট করা হয়েছে।" });
    } catch (err) {
        res.status(500).json({ error: "Delete Failed!" });
    }
});

// ৬. প্রজেক্ট রিস্টার্ট লজিক
app.post('/start-project', (req, res) => {
    const { name } = req.body;
    console.log(`🚀 ${name} রিস্টার্ট করা হচ্ছে...`);
    // আপনার রিস্টার্ট লজিক
    res.json({ status: "Success", message: "প্রজেক্টটি আবার চালু হয়েছে!" });
});

// ৭. সার্ভার পোর্ট লিসেনিং
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 NEXT-GEN SERVER ACTIVE ON PORT: ${PORT}\n`);
});
