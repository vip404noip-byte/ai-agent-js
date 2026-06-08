import { z } from "zod";
import { toOpenAITool } from "../utils/func-tool.js";

export async function getCalculate({ expression }) {
  try {
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
      return { error: "表達式僅能包含數字與 + - * / () . 空白" };
    }

    const result = eval(expression);

    return {
      expression,
      result,
    };
  } catch (err) {
    return { error: `計算錯誤：${String(err)}` };
  }
}


export const calculatorTool = toOpenAITool({
  name: "get_calculate",
  description: "進行數學計算，輸入一個算式字串，回傳計算結果。",
  parameters: z.object({
    expression: z.string().describe('要計算的數學表達式（字串），例如 "10 + 5 * 2"'),
  }),
});