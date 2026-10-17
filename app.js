
"use strict";

const $ = (id) => document.getElementById(id);

let currentSlidesText = "";

// 預設設定
const defaults = {
  word: "計畫",
  level: "中級",
  focus: "動詞用法：計畫＋動作",
  duration: "30 分鐘",
  known: "今天、明天、週末、去、買、衣服、朋友、學校、旅行",
  example: "我計畫明年去日本旅行。",
  needs: "使用簡單清楚的繁體中文，提供教師提問、學生回答、替換練習、錯誤辨識與生活情境應用。"
};

// 取得表單資料
function getSettings() {
  return {
    word: $("word").value.trim() || "目標生詞",
    level: $("level").value,
    focus: $("focus").value,
    duration: $("duration").value,
    known: $("known").value.trim() || "尚未提供",
    example: $("example").value.trim() || "請設計合適的例句",
    needs: $("needs").value.trim() || "提供清楚的教學引導"
  };
}

// 第一部分：生成結構性提示詞
function generatePrompt() {
  const s = getSettings();

  const prompt = `你是一位專業的華語教師、語法分析者與教學簡報設計者。

請為${s.level}華語學習者設計「${s.word}」的語法點教學材料。

【一、基本設定】
目標生詞：${s.word}
學生程度：${s.level}
主要教學用法：${s.focus}
教學時間：${s.duration}
學生已學詞語：${s.known}
參考例句：${s.example}
其他需求：${s.needs}

【二、語法點定義與分析】
1. 解釋什麼是語法點。
2. 分析「${s.word}」的詞性、句法功能及常見搭配。
3. 說明本次教學的核心語法點。
4. 如果該詞有不同詞性，請分別說明，不要混淆。

【三、語法結構與教學引導】
1. 提供正確的句型公式及語序。
2. 說明句型中每個成分的功能。
3. 提供至少三個自然、正確的例句。
4. 設計情境導入、例句觀察、結構歸納及理解檢核。
5. 預測學習者常見錯誤並提供修正方法。

【四、語法結構 Slides】
請規劃逐張投影片，每張均須包含：
- 投影片標題
- 投影片呈現的文字
- 句型或例句
- 教師引導語
- 學生可能回答
- 圖片或版面建議

建議順序：情境導入、句型呈現、結構拆解、例句比較、引導操練、理解檢核。

【五、語意與教學引導】
1. 用簡單中文解釋「${s.word}」的意思。
2. 說明適用情境與容易混淆的表達方式。
3. 提供生活化情境。
4. 設計至少三個教師提問及參考答案。
5. 確認學生理解詞義，而非只背誦句型。

【六、用法、例句與教學活動】
1. 整理核心用法、句型公式及常見搭配。
2. 提供至少五個符合${s.level}程度的例句及句意。
3. 設計替換練習、填空題、錯誤辨識題及口語活動。
4. 優先使用已學詞語：${s.known}
5. 提供答案與生活情境應用任務。

【七、整合與檢查】
1. 整合成完整教學流程。
2. 確認句型、語意及例句正確自然。
3. 確保投影片與前述分析一致。
4. 控制新詞數量。
5. 使用繁體中文、清楚標題及適當表格。
6. 若句型不適用，請明確指出並修正。
7. 所有內容都要具體可用，不可只提供理論。

請依照以上七個部分依序完整產出。`;

  $("promptOutput").value = prompt;
  $("promptStatus").textContent =
    "結構性提示詞已生成，可以複製、下載或帶入投影片區。";
}

// 第二部分：恢復預設
function resetForm() {
  Object.entries(defaults).forEach(([id, value]) => {
    $(id).value = value;
  });

  $("promptOutput").value = "";
  $("slidePrompt").value = "";
  $("slidesOutput").innerHTML =
    '<p class="placeholder">投影片引導稿將顯示在這裡。</p>';

  $("promptStatus").textContent = "已恢復預設設定。";
  $("slideStatus").textContent = "";
  currentSlidesText = "";
}

// 通用複製功能
async function copyText(text, statusElement, emptyMessage) {
  if (!text.trim()) {
    statusElement.textContent = emptyMessage;
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();

    const success = document.execCommand("copy");
    temp.remove();

    if (!success) {
      statusElement.textContent = "複製失敗，請手動選取文字。";
      return;
    }
  }

  statusElement.textContent = "已複製到剪貼簿。";
}

// 通用 TXT 下載功能
function downloadText(text, filename, statusElement) {
  if (!text.trim()) {
    statusElement.textContent = "目前沒有可下載的內容。";
    return;
  }

  const blob = new Blob(
    ["\uFEFF", text],
    { type: "text/plain;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
  statusElement.textContent = "檔案已開始下載。";
}

// 第三部分：將結構性提示詞帶入投影片區
function sendToSlides() {
  const prompt = $("promptOutput").value.trim();

  if (!prompt) {
    $("promptStatus").textContent = "請先生成結構性提示詞。";
    return;
  }

  $("slidePrompt").value = prompt;
  $("slideStatus").textContent =
    "已帶入提示詞，現在可以生成投影片引導。";

  $("slidePrompt").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

// 從提示詞擷取目標詞
function detectWord(prompt) {
  const quoted = prompt.match(/[「『"]([^」』"]{1,20})[」』"]/);

  if (quoted) {
    return quoted[1];
  }

  const inputWord = $("word").value.trim();
  return inputWord || "目標生詞";
}

// HTML 安全處理
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return map[char];
  });
}

// 第四部分：依照提示詞建立投影片引導內容
function buildSlideData(prompt) {
  const word = detectWord(prompt);
  const settings = getSettings();

  return [
    {
      title: "情境導入",
      content:
        `透過生活情境介紹「${word}」。\n` +
        "先展示情境圖片，再請學生觀察人物的行為。",
      teacher:
        `教師提問：「你知道『${word}』是什麼意思嗎？」`,
      student:
        "學生根據圖片或生活經驗回答。",
      visual:
        "使用一張清楚的生活情境圖片，搭配簡短問題。"
    },
    {
      title: "語意理解",
      content:
        `說明「${word}」在本課中的意思。\n` +
        `參考情境：${settings.example}`,
      teacher:
        "教師引導學生說明句子的意思，並比較不同情境。",
      student:
        "學生用自己的話解釋目標詞，並舉出相關情境。",
      visual:
        "使用圖片、關鍵詞與簡短解釋呈現詞義。"
    },
    {
      title: "語法結構",
      content:
        `本課目標：${settings.focus}\n` +
        `參考例句：${settings.example}\n` +
        "教師需根據目標詞的實際詞性，確認正確句型與語序。",
      teacher:
        "教師帶領學生找出句子中的目標詞及其他句子成分。",
      student:
        "學生標示句子成分，並說明各成分的功能。",
      visual:
        "使用句型框、箭頭或不同色塊呈現語序。"
    },
    {
      title: "例句觀察",
      content:
        `例句一：${settings.example}\n` +
        `例句二：請依「${word}」的正確句法，再設計一個不同情境的例句。\n` +
        "比較句型、語意及詞語搭配。",
      teacher:
        "教師請學生找出兩個例句的共同點及不同之處。",
      student:
        "學生圈出目標詞，並解釋句子的意思。",
      visual:
        "每頁呈現兩至三個例句，凸顯目標詞與句型。"
    },
    {
      title: "引導操練",
      content:
        `學生已學詞語：${settings.known}\n` +
        "設計替換練習，讓學生替換時間、人物或動作。",
      teacher:
        "教師先示範一題，再提供詞語選項讓學生練習。",
      student:
        "學生完成口頭造句、填空或句型替換。",
      visual:
        "使用詞語卡、句型框及替換欄位。"
    },
    {
      title: "錯誤辨識與理解檢核",
      content:
        "設計一題正誤判斷及一題句子修正題。\n" +
        "答案必須根據目標詞的實際語法確認。",
      teacher:
        "教師提問：「哪一句正確？你能說明原因嗎？」",
      student:
        "學生選擇答案、修正錯誤句，並說明理由。",
      visual:
        "將正確句與錯誤句並列，凸顯需要修正的地方。"
    },
    {
      title: "生活應用與總結",
      content:
        `請學生在生活情境中使用「${word}」。\n` +
        "安排兩人對話或個人短講，最後進行出口檢核。",
      teacher:
        "教師提供情境任務，觀察學生能否獨立運用句型。",
      student:
        "學生完成短對話，或說出自己的例句。",
      visual:
        "呈現任務說明、對話情境及簡單評量標準。"
    }
  ];
}

// 產生投影片文字版
function slidesToText(word, slides) {
  return `目標詞：${word}\n\n` +
    slides.map((slide, index) => {
      return [
        `第 ${index + 1} 張：${slide.title}`,
        `投影片內容：\n${slide.content}`,
        `教師引導語：\n${slide.teacher}`,
        `學生可能回答／任務：\n${slide.student}`,
        `視覺設計建議：\n${slide.visual}`
      ].join("\n\n");
    }).join("\n\n" + "-".repeat(36) + "\n\n") +
    "\n\n提醒：請再次確認所有句型與例句的語法正確性。";
}

// 第五部分：顯示投影片引導
function generateSlides() {
  const prompt = $("slidePrompt").value.trim();

  if (!prompt) {
    $("slideStatus").textContent = "請先輸入提示詞。";
    return;
  }

  const word = detectWord(prompt);
  const slides = buildSlideData(prompt);

  currentSlidesText = slidesToText(word, slides);

  $("slidesOutput").innerHTML = slides.map((slide, index) => `
    <article class="slide-card">
      <span class="slide-number">SLIDE ${String(index + 1).padStart(2, "0")}</span>
      <h3>${escapeHTML(slide.title)}</h3>

      <h4>投影片內容</h4>
      <p>${escapeHTML(slide.content)}</p>

      <h4>教師引導語</h4>
      <p>${escapeHTML(slide.teacher)}</p>

      <h4>學生可能回答／任務</h4>
      <p>${escapeHTML(slide.student)}</p>

      <h4>視覺設計建議</h4>
      <p>${escapeHTML(slide.visual)}</p>
    </article>
  `).join("");

  $("slideStatus").textContent =
    `已產生 ${slides.length} 張投影片引導稿。請檢查語法與例句。`;

  $("slidesOutput").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

// 填入範例提示詞
function fillSlideExample() {
  $("slidePrompt").value =
    "請針對「計畫」這個詞，設計中級華語教學投影片。" +
    "請包含語法點分析、語法結構、語意說明、例句、教師引導、" +
    "學生回答、替換操練、錯誤辨識與生活情境應用。" +
    "每張投影片都要提供標題、畫面內容、教師引導語及視覺設計建議。";

  $("slideStatus").textContent = "已填入範例提示詞。";
}

// 綁定按鈕事件
$("generatePrompt").addEventListener("click", generatePrompt);
$("resetForm").addEventListener("click", resetForm);

$("copyPrompt").addEventListener("click", () => {
  copyText(
    $("promptOutput").value,
    $("promptStatus"),
    "請先生成結構性提示詞。"
  );
});

$("downloadPrompt").addEventListener("click", () => {
  downloadText(
    $("promptOutput").value,
    "華語語法點結構性提示詞.txt",
    $("promptStatus")
  );
});

$("sendToSlides").addEventListener("click", sendToSlides);
$("generateSlides").addEventListener("click", generateSlides);
$("fillExample").addEventListener("click", fillSlideExample);

$("copySlides").addEventListener("click", () => {
  copyText(
    currentSlidesText,
    $("slideStatus"),
    "請先生成投影片引導稿。"
  );
});

$("downloadSlides").addEventListener("click", () => {
  downloadText(
    currentSlidesText,
    "華語語法點投影片引導稿.txt",
    $("slideStatus")
  );
});

// 開啟網站時自動生成預設結構性提示詞
generatePrompt();
