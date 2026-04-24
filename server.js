const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const VLLM_API_URL = "http://localhost:8000/v1/completions";
const DEFAULT_MODEL = "TheBloke/Mistral-7B-Instruct-v0.2-AWQ";

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

app.post("/generate", async (req, res) => {
  const { prompt, max_tokens, temperature, model, htmlMode } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const payload = {
    model: typeof model === "string" && model.trim() ? model : DEFAULT_MODEL,
    prompt: prompt.trim(),
    max_tokens: Number(max_tokens) || 1000,
    temperature: Number(temperature) || 0.7,
  };

  try {
    const response = await fetch(VLLM_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "vLLM request failed.",
        details: errorText,
      });
    }

    const data = await response.json();
    const sermon = data?.choices?.[0]?.text ?? "";

    return res.json({
      sermon,
      htmlMode: Boolean(htmlMode),
      raw: data,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Could not reach local vLLM server.",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`Sermon generator running at http://localhost:${PORT}`);
});
