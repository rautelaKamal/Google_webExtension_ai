const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const cohere = require("cohere-ai");  // Use the correct import
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

// Initialize Cohere
cohere.init(process.env.COHERE_API_KEY);  // Correctly initialize Cohere

app.use(cors());
app.use(bodyParser.json());

app.post("/api/context", async (req, res) => {
  const { selectedText } = req.body;
  if (!selectedText) return res.status(400).json({ error: "Text is required" });

  try {
    // Generate contextual explanation
    const response = await cohere.generate({
      model: "xlarge",  // Make sure to choose the correct model
      prompt: `Explain the contextual meaning of the following text: "${selectedText}"`,
      max_tokens: 150,
      temperature: 0.7,
    });

    const explanation = response.body.generations[0].text.trim();

    const newContext = await prisma.context.create({
      data: { selectedText, explanation },
    });

    res.json(newContext);
  } catch (error) {
    console.error("Error processing AI:", error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));