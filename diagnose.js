const fs = require('fs');
const path = require('path');

console.log("🔍 প্রজেক্ট ডায়াগনস্টিক স্ক্যান শুরু হচ্ছে...\n");

let errors = 0;

// ১. চেক করা .env.local বা এপিআই কি আছে কি না
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log("✔ .env.local ফাইলটি পাওয়া গেছে।");
} else {
  console.log("❌ সমস্যা: .env.local ফাইলটি অনুপস্থিত! (এপিআই কি কনফিগার করা নেই)");
  errors++;
}

// ২. চেক করা চ্যাট এপিআই রাউট আছে কি না
const chatRoutePath = path.join(process.cwd(), 'app', 'api', 'chat', 'route.ts');
if (fs.existsSync(chatRoutePath)) {
  console.log("✔ চ্যাট এপিআই রাউট (app/api/chat/route.ts) পাওয়া গেছে।");
} else {
  console.log("❌ সমস্যা: চ্যাট এপিআই রাউট ফাইলটি অনুপস্থিত!");
  errors++;
}

// ৩. চেক করা package.json এবং node_modules ঠিক আছে কি না
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  console.log("✔ package.json ফাইলটি পাওয়া গেছে।");
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log("✔ node_modules ফোল্ডারটি ইন্সটল করা আছে।");
  } else {
    console.log("❌ সমস্যা: node_modules নেই! আপনাকে 'npm install' চালাতে হবে।");
    errors++;
  }
} else {
  console.log("❌ মারাত্মক সমস্যা: package.json ফাইলটি খুঁজে পাওয়া যায়নি!");
  errors++;
}

console.log("\n-----------------------------------");
if (errors === 0) {
  console.log("🎉 অভিনন্দন! প্রজেক্টের ফোল্ডার ও কনফিগারেশনে কোনো সমস্যা নেই।");
} else {
  console.log(`⚠️ মোট ${errors} টি সমস্যা পাওয়া গেছে। উপর Lined ত্রুটিগুলো ঠিক করে নিন।`);
}
