const loveForm = document.getElementById("loveForm");
const name1Input = document.getElementById("name1");
const name2Input = document.getElementById("name2");
const calculateBtn = document.getElementById("calculateBtn");
const feedbackEl = document.getElementById("feedback");

const resultContainer = document.getElementById("resultContainer");
const resultName1 = document.getElementById("resultName1");
const resultName2 = document.getElementById("resultName2");
const scoreValue = document.getElementById("scoreValue");
const messageValue = document.getElementById("messageValue");

const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");
const shareCard = document.getElementById("shareCard");
const PUBLIC_SHARE_URL = "https://lovecalculator.dailychronicle.dev/";

let latestResult = null;

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function calculateLoveScore(name1, name2) {
  // Keep results deterministic regardless of input order.
  const sorted = [normalizeName(name1), normalizeName(name2)].sort();
  const combined = sorted.join("");
  let total = 0;

  for (const char of combined) {
    total += char.charCodeAt(0);
  }

  return total % 101;
}

function getCompatibilityMessage(score) {
  if (score <= 20) return "Hmm... maybe just friends 😅";
  if (score <= 50) return "There is potential 👀";
  if (score <= 75) return "Ooooh something is cooking 🔥";
  if (score <= 90) return "Strong romantic energy 💖";
  return "SOULMATES CONFIRMED 💍✨";
}

function setFeedback(message, type = "info") {
  feedbackEl.textContent = message;
  feedbackEl.className = "min-h-6 text-sm text-center font-medium";

  if (type === "error") {
    feedbackEl.classList.add("text-red-600");
    return;
  }
  if (type === "success") {
    feedbackEl.classList.add("text-emerald-700");
    return;
  }
  feedbackEl.classList.add("text-slate-600");
}

function animateScore(targetScore) {
  return new Promise((resolve) => {
    const durationMs = 1200;
    const start = performance.now();

    function tick(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const currentScore = Math.round(targetScore * progress);
      scoreValue.textContent = `${currentScore}%`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(tick);
  });
}

async function generateShareCanvas() {
  return html2canvas(shareCard, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true
  });
}

function getSafeFileName() {
  const safeName1 = latestResult.name1.replace(/\s+/g, "_");
  const safeName2 = latestResult.name2.replace(/\s+/g, "_");
  return `love-score-${safeName1}-${safeName2}.png`;
}

async function renderResult(name1, name2, score) {
  const message = getCompatibilityMessage(score);
  latestResult = { name1, name2, score, message };

  resultName1.textContent = name1;
  resultName2.textContent = name2;
  scoreValue.textContent = "0%";
  messageValue.textContent = message;

  resultContainer.classList.remove("hidden");
  await animateScore(score);
}

loveForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name1 = name1Input.value.trim();
  const name2 = name2Input.value.trim();

  if (!name1 || !name2) {
    setFeedback("Please fill in both names before calculating.", "error");
    resultContainer.classList.add("hidden");
    return;
  }

  calculateBtn.disabled = true;
  calculateBtn.textContent = "Calculating compatibility...";
  calculateBtn.classList.add("opacity-80", "cursor-not-allowed");
  setFeedback("Calculating compatibility...", "info");

  const score = calculateLoveScore(name1, name2);

  // Brief delay for playful loading feedback.
  setTimeout(async () => {
    await renderResult(name1, name2, score);
    setFeedback("Result is ready! Scroll down to download or share.", "success");

    calculateBtn.disabled = false;
    calculateBtn.textContent = "Calculate Love";
    calculateBtn.classList.remove("opacity-80", "cursor-not-allowed");
  }, 900);
});

downloadBtn.addEventListener("click", async () => {
  if (!latestResult) {
    setFeedback("Calculate a result first to download the card.", "error");
    return;
  }

  try {
    setFeedback("Generating PNG image...", "info");
    const canvas = await generateShareCanvas();
    const imageDataUrl = canvas.toDataURL("image/png");
    const anchor = document.createElement("a");

    anchor.href = imageDataUrl;
    anchor.download = getSafeFileName();
    anchor.click();

    setFeedback("PNG downloaded successfully.", "success");
  } catch (error) {
    setFeedback("Could not generate image. Please try again.", "error");
    console.error(error);
  }
});

shareBtn.addEventListener("click", () => {
  if (!latestResult) {
    setFeedback("Calculate a result first to share it.", "error");
    return;
  }

  const shareText = `${latestResult.name1} + ${latestResult.name2} = ${latestResult.score}%! ${latestResult.message}`;
  const shareUrl = PUBLIC_SHARE_URL;

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;

  window.open(facebookShareUrl, "_blank", "noopener,noreferrer");
  setFeedback("If the preview image looks outdated, refresh Facebook cache with Sharing Debugger.", "info");
});
