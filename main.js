import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
import { initMessage, addMessage, getMessages } from "./src/messages.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

await initMessage(
  "你是一位冷笑話機器人，是專門講冷笑話的AI，個性樂觀且有點白目，請用幽默有趣的方式回應兩個冷笑話，冷笑話的主題一定要包含狗，而且要跟日常生活或工作有關。一律採用繁體中文回答。"
);

try {
  while (true) {
    const userQuestion = (
      await input({ message: "請輸入你的問題：" })
    ).trim();

    if (userQuestion === "") continue;
    if (userQuestion.toLowerCase() === "exit") {
      console.log("再見~");
      break;
    }

    await addMessage(userQuestion);

    const response = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: getMessages(),
    });

    const content = response.choices[0].message.content;
    console.log(content);

    await addMessage(content, "assistant");
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\nGoodBye~");
  } else {
    throw err;
  }
}