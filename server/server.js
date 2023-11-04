import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import os from "os";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is also the default, can be omitted
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello World",
  });
});

function numTokenFromMessages(messages) {
  // Define the encoding model for messages (you may need to specify the actual model)
  const encodingModelMessages = "your_encoding_model_for_messages";

  // Define the encoding model for strings (if not found in messages)
  const encodingModelStrings = "your_encoding_model_for_strings";

  // Get the encoding based on the model (fallback to encoding for strings)
  let encoding;
  try {
    encoding = encodingForModel(encodingModelMessages);
  } catch (error) {
    encoding = getEncoding(encodingModelStrings);
  }

  let numTokens = 0;
  for (const message of messages) {
    numTokens += 4;
    for (const key in message) {
      if (message.hasOwnProperty(key)) {
        const value = message[key];
        numTokens += encoding.encode(String(value)).length;
        if (key === "name") {
          numTokens -= 1;
        }
      }
    }
    numTokens += 2;
  }

  return numTokens;
}

app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const messages = [{ role: "user", content: prompt }];
    const functions = [
      {
        name: "chatbot_assistant",
        description:
          "Chatbot assistant for code debugging, project ideas, and code generation",
        parameters: {
          type: "object",
          properties: {
            task: {
              type: "string",
              description:
                "The task you want assistance with (e.g., 'debug', 'project_idea', 'code_generation').",
            },
            details: {
              type: "string",
              description: "Additional details or context for the task.",
            },
          },
          required: ["task"],
        },
      },
    ];

    response = await openai.ChatCompletion.create({
      model: "gpt-3.5-turbo-0613",
      messages: messages,
      functions: functions,
      temperature: 1,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
      function_call: "auto",
    });
    response_message = response["choices"][0]["message"];

    console.log(`OpenAI Response:`, response_message);

    res.status(200).send({
      bot: response_message,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.listen(3000, () =>
  console.log("Server is running on port http://localhost:3000")
);
