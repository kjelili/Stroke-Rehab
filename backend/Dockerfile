# Neuro-Recover backend (MedGemma-style API). Runs on Node; use with GPU/CPU local LLM or Gemini API.
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY src ./src

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "src/server.js"]
