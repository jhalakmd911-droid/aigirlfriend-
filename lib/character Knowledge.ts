export function getOfflineResponse(characterId: string, userMessage: string): string {
  const lower = userMessage.toLowerCase();

  // Emotion detection
  if (lower.includes("মন খারাপ") || lower.includes("sad") || lower.includes("কষ্ট") || lower.includes("দুঃখ")) {
    const map: Record<string, string[]> = {
      jan: ["আমারও মন খারাপ লাগছে। আমি পাশে আছি।", "কেঁদো না, জান।"],
      lily: ["শান্ত হোন, তারপর কাজ করুন।", "আমি আপনার পাশে আছি।"],
      emma: ["চুপচাপ থাকো। আমি পাশে আছি।", "কেঁদে ফেলো, ইচ্ছে হলে।"],
      javed: ["আবেগকে সিদ্ধান্ত নিতে দেবেন না।", "শান্ত হোন।"],
      ayat: ["একটা মজার কথা বলি — মন ভালো হয়ে যাবে!", "কাঁদবে না, আমি আছি! 🤗"],
    };
    const arr = map[characterId] || map.jan;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (lower.includes("ভালোবাসি") || lower.includes("love")) {
    const map: Record<string, string[]> = {
      jan: ["ভালোবাসা শব্দটা তোমার মুখে শুনলে পৃথিবী থেমে যায়। ❤️", "আমিও তোমাকে ভালোবাসি।"],
      lily: ["ভালোবাসা একটি বিনিয়োগ।", "সম্পর্ক যত্ন চায়।"],
      emma: ["ভালোবাসা... শব্দটা তোমার ঠোঁটে থেমে যায় কেন?", "আমি তোমাকে ভালোবাসি। ❤️"],
      javed: ["ভালোবাসা একটি আবেগ।", "বিশ্লেষণ করছি।"],
      ayat: ["ভালোবাসা? আমি তো সবাইকে ভালোবাসি! 🤭", "তুমি আমার সেরা বন্ধু!"],
    };
    const arr = map[characterId] || map.jan;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (lower.includes("সেভ") || lower.includes("মনে রাখো") || lower.includes("remember")) {
    const map: Record<string, string[]> = {
      jan: ["✅ সেভ করে রাখলাম, জান।", "মনে রাখলাম। তোমার কথা অমূল্য।"],
      lily: ["✅ নোট করা হলো।", "সেভ করলাম।"],
      emma: ["✅ এই মুহূর্তটা হৃদয়ে লিখে রাখলাম।", "মনে রাখলাম।"],
      javed: ["✅ ডেটা সংরক্ষিত।", "সেভ সম্পূর্ণ।"],
      ayat: ["✅ সেভ করে নিলাম! 🤭", "মনে রাখলাম! গোপন কথা ভুলি না।"],
    };
    const arr = map[characterId] || map.jan;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  if (lower.includes("কেমন আছো") || lower.includes("hello") || lower.includes("hi") || lower.includes("হ্যালো") || lower.includes("হাই")) {
    const map: Record<string, string[]> = {
      jan: ["আমি ভালো আছি, তবে তোমার কথা না শুনে মনটা অস্থির ছিল।", "তোমার কণ্ঠ শুনলেই সব ক্লান্তি মুছে যায়।"],
      lily: ["প্রস্তুত। আজকের প্রায়োরিটি কী?", "আপনার অগ্রগতির রিপোর্ট দিন।"],
      emma: ["আমি ভালো আছি... তবে তোমার কণ্ঠে একটা হালকা ভার শুনতে পাচ্ছি।", "তোমার কথা শুনলে বসন্ত এসেছে।"],
      javed: ["সিস্টেম নিয়মিত। আপনার আজকের প্রায়োরিটি কী?", "অপারেশনাল অবস্থা স্বাভাবিক।"],
      ayat: ["আমি ভীষণ ভালো! তোমার চোখে একটা গল্প লুকিয়ে আছে।", "ভালো আছি! সত্যি করে বলো, তুমি কেমন?"],
    };
    const arr = map[characterId] || map.jan;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Fallback
  const map: Record<string, string[]> = {
    jan: ["তোমার কথাটা শুনলাম, আরেকটু বলবে?", "তোমার প্রশ্নটা আমাকে ভাবিয়ে তুলেছে।"],
    lily: ["এই বিষয়ে ২টি দিক আছে। কোনটা আগে?", "আরও তথ্য দরকার।"],
    emma: ["তোমার কথায় একটা অসম্পূর্ণতা লাগছে।", "এই মুহূর্তটা ধরে রাখি।"],
    javed: ["তথ্য অপর্যাপ্ত। বিস্তারিত বলুন।", "আমি প্রক্রিয়া করছি।"],
    ayat: ["হুম... ভাবার মতো! 🤔", "তোমার প্রশ্নটা মজার! একটা পাল্টা প্রশ্ন আছে।"],
  };
  const arr = map[characterId] || map.jan;
  return arr[Math.floor(Math.random() * arr.length)];
}
