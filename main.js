import { client, DEFAULT_MODEL } from "./src/lib/openai.js";
import { calculatorTool, getCalculate } from "./src/tools/calculate.js";
import { spinner } from "./src/utils/spinner.js";
import { toOpenAITool } from "./src/utils/func-tool.js";

const AVAILABLE_TOOLS = {
  get_calculate: getCalculate,
};

// const tools = [toOpenAITool(calculatorTool)];
const tools = [calculatorTool];

const messages = [{ role: "user", content: "請問10+5 * 2？" }];

const askingSpinner = spinner("思考中...").start();

let response = await client.chat.completions.create({
  model: DEFAULT_MODEL,
  messages,
  tools,
  tool_choice: "auto",
});

askingSpinner.stop();

const message = response.choices[0].message;
messages.push(message);

if (message.tool_calls && message.tool_calls.length > 0) {
  for (const toolCall of message.tool_calls) {
    const fnName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments);
    console.log(`\n[呼叫 tool] ${fnName}(${JSON.stringify(args)})`);

    const fn = AVAILABLE_TOOLS[fnName];
    const result = await fn(args);

    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify(result),
    });
  }

  const replySpinner = spinner("思考中...").start();

  response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages,
  });

  replySpinner.stop();

  console.log(response.choices[0].message.content);
} else {
  console.log(message.content);
}