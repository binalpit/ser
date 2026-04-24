# Christian Sermon Generator (Local vLLM)

A simple full-stack web app to generate Christian sermons using a local vLLM API.

## Stack

- Frontend: HTML, Tailwind CSS, Vanilla JavaScript
- Backend: Node.js with Express
- LLM API: `http://localhost:8000/v1/completions`

## Features

- Prompt inputs for sermon guidance and Bible verse/topic
- Sermon length selector (Short, Medium, Long)
- Sliders for `max_tokens` and `temperature`
- Editable full prompt builder with base prompt
- HTML Output Mode toggle
- Loading spinner and styled sermon output
- Copy button for generated text/HTML

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   node server.js
   ```

3. Open:

   [http://localhost:3000](http://localhost:3000)

## Notes

- Ensure your local vLLM server is running on `http://localhost:8000`.
- The backend endpoint `/generate` forwards requests to vLLM using this model:
  `TheBloke/Mistral-7B-Instruct-v0.2-AWQ`.
