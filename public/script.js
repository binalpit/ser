const BASE_PROMPT =
  "Write a powerful Christian sermon with emotional tone, full paragraphs, real-life examples, and closing prayer.";

const sermonPromptEl = document.getElementById("sermonPrompt");
const verseTopicEl = document.getElementById("verseTopic");
const lengthEl = document.getElementById("length");
const maxTokensEl = document.getElementById("maxTokens");
const temperatureEl = document.getElementById("temperature");
const maxTokensValueEl = document.getElementById("maxTokensValue");
const temperatureValueEl = document.getElementById("temperatureValue");
const fullPromptEl = document.getElementById("fullPrompt");
const htmlModeEl = document.getElementById("htmlMode");
const rebuildPromptBtn = document.getElementById("rebuildPrompt");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const outputEl = document.getElementById("output");
const loadingEl = document.getElementById("loading");
const errorBoxEl = document.getElementById("errorBox");

function buildPrompt() {
  const userPrompt = sermonPromptEl.value.trim();
  const verseTopic = verseTopicEl.value.trim();
  const length = lengthEl.value;
  const htmlDirective = htmlModeEl.checked
    ? "Return the sermon as clean semantic HTML with headings and paragraphs."
    : "Return the sermon as plain text.";

  const sections = [
    BASE_PROMPT,
    `Sermon length target: ${length}.`,
    verseTopic ? `Bible verse/topic focus: ${verseTopic}.` : "",
    userPrompt ? `Additional guidance: ${userPrompt}.` : "",
    htmlDirective,
  ].filter(Boolean);

  return sections.join("\n\n");
}

function syncSliderLabels() {
  maxTokensValueEl.textContent = maxTokensEl.value;
  temperatureValueEl.textContent = Number(temperatureEl.value).toFixed(1);
}

function refreshPromptEditor() {
  fullPromptEl.value = buildPrompt();
}

function setLoadingState(isLoading) {
  loadingEl.classList.toggle("hidden", !isLoading);
  generateBtn.disabled = isLoading;
  generateBtn.classList.toggle("opacity-60", isLoading);
  generateBtn.classList.toggle("cursor-not-allowed", isLoading);
}

function showError(message) {
  errorBoxEl.textContent = message;
  errorBoxEl.classList.remove("hidden");
}

function hideError() {
  errorBoxEl.classList.add("hidden");
  errorBoxEl.textContent = "";
}

function renderOutput(text, isHtml) {
  if (!text || !text.trim()) {
    outputEl.textContent = "No sermon content returned from model.";
    copyBtn.disabled = true;
    return;
  }

  if (isHtml) {
    outputEl.innerHTML = text;
  } else {
    outputEl.textContent = text;
  }
  copyBtn.disabled = false;
}

async function generateSermon() {
  hideError();
  setLoadingState(true);
  copyBtn.disabled = true;
  outputEl.textContent = "Generating sermon...";

  try {
    const response = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "TheBloke/Mistral-7B-Instruct-v0.2-AWQ",
        prompt: fullPromptEl.value.trim(),
        max_tokens: Number(maxTokensEl.value),
        temperature: Number(temperatureEl.value),
        htmlMode: htmlModeEl.checked,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.details || data?.error || "Request failed.");
    }

    const sermon = data?.sermon ?? "";
    renderOutput(sermon, htmlModeEl.checked);
  } catch (error) {
    outputEl.textContent = "Sermon generation failed.";
    showError(error instanceof Error ? error.message : String(error));
  } finally {
    setLoadingState(false);
  }
}

maxTokensEl.addEventListener("input", syncSliderLabels);
temperatureEl.addEventListener("input", syncSliderLabels);

[sermonPromptEl, verseTopicEl, lengthEl, htmlModeEl].forEach((el) => {
  el.addEventListener("input", refreshPromptEditor);
  el.addEventListener("change", refreshPromptEditor);
});

rebuildPromptBtn.addEventListener("click", refreshPromptEditor);
generateBtn.addEventListener("click", generateSermon);

copyBtn.addEventListener("click", async () => {
  const textToCopy = htmlModeEl.checked ? outputEl.innerHTML : outputEl.textContent;

  try {
    await navigator.clipboard.writeText(textToCopy || "");
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 1500);
  } catch (_error) {
    showError("Could not copy output. Please copy manually.");
  }
});

syncSliderLabels();
refreshPromptEditor();
