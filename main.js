import { input } from "@inquirer/prompts";
import { searchCity } from "./src/lib/qdrant.js";
import { spinner } from "./src/utils/spinner.js";

try {
  while (true) {
    const query = (
      await input({ message: "請輸入要搜尋的城市內容：" })
    ).trim();

    if (query === "") continue;
    if (query.toLowerCase() === "exit") {
      console.log("再會~");
      break;
    }

    const spin = spinner("搜尋中...").start();
    const results = await searchCity(query, 3);
    spin.stop();

    for (const [i, r] of results.entries()) {
      console.log(`- 城市：${r.name}（score: ${r.score.toFixed(4)}）`);
      console.log(`  介紹：${r.content}\n`);
      console.log(`   分數：${r.score.toFixed(3)}`);
    }
    console.log();
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n再會~");
  } else {
    throw err;
  }
}