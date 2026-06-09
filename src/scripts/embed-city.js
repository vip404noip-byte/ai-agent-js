import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
import { client } from "../lib/openai.js";
import {
  qdrant,
  CITY_COLLECTION,
  EMBEDDING_DIM,
  EMBEDDING_MODEL,
} from "../lib/qdrant.js";


const BATCH_SIZE = 100;
const cities = [
  {
    id: 1,
    name: "台北",
    content:
      "台北市是台灣的首都與政治中心，位於台灣北部，以台北101、故宮博物院、士林夜市、總統府等景點聞名，是金融、科技與文化匯聚的國際都市。",
  },
  {
    id: 2,
    name: "新北",
    content:
      "新北市環繞台北市，是台灣人口最多的城市，擁有淡水老街、九份、十分瀑布、野柳地質公園等景點，結合山城、海岸與河景，是北部重要的生活圈與通勤城市。",
  },
  {
    id: 3,
    name: "基隆",
    content:
      "基隆市是北台灣的重要港口城市，以基隆港、旭丘廟口夜市聞名，氣候多雨，被稱為「雨都」，擁有獨特的港灣景緻與海鮮美食。",
  },
  {
    id: 4,
    name: "桃園",
    content:
      "桃園市位於台北西南方，是台灣的國際門戶之一，桃園國際機場所在。工業與科技園區密集，亦有大溪老街、小烏來天空步道、石門水庫等觀光景點。",
  },
  {
    id: 5,
    name: "新竹",
    content:
      "新竹市因強風聞名，被稱為「風城」，是科技產業的重要據點，擁有新竹科學園區。市區有新竹城隍廟及周邊小吃，如米粉、貢丸等，是結合科技與傳統文化的城市。",
  },
  {
    id: 6,
    name: "新竹縣",
    content:
      "新竹縣環繞新竹市，包含竹北、關西、湖口等地，以客家文化與山林景觀著稱。內灣老街、北埔老街是知名景點，結合老街風情與鐵道文化。",
  },
  {
    id: 7,
    name: "宜蘭",
    content:
      "宜蘭縣位於台灣東北部，擁有山海兼具的自然景觀與豐富的溫泉資源，如礁溪溫泉、蘇澳冷泉、羅東夜市及太平山國家森林遊樂區，是北台灣重要的旅遊城市。",
  },
  {
    id: 8,
    name: "台中",
    content:
      "台中市位於台灣中部，氣候穩定，被認為是適合居住的城市。知名景點包括逢甲夜市、台中國家歌劇院、草悟道等，是工業與服務業發達的都市。",
  },
  {
    id: 9,
    name: "彰化",
    content:
      "彰化縣位於台灣中部，以八卦山大佛、鹿港老街等景點聞名，是傳統工藝與宗教信仰的重要地區。鹿港保留許多老街與廟宇，充滿歷史風情。",
  },
  {
    id: 10,
    name: "南投",
    content:
      "南投縣是台灣唯一不臨海的縣市，擁有日月潭、合歡山、清境農場、溪頭等著名山林與湖泊景點，是喜歡自然、健行與山景旅遊者的熱門選擇。",
  },
  {
    id: 11,
    name: "雲林",
    content:
      "雲林縣位於台灣中部偏西南，是農業大縣，擁有北港朝天宮等信仰中心，以及傳統產業與農村景觀。口湖、四湖等沿海地區也以漁業與濕地著稱。",
  },
  {
    id: 12,
    name: "嘉義市",
    content:
      "嘉義市是中南部的小城市，以嘉義火雞肉飯等美食聞名，也是前往阿里山的重要交通與補給中心。市區生活步調相對悠閒，具有濃厚地方特色。",
  },
  {
    id: 13,
    name: "嘉義縣",
    content:
      "嘉義縣涵蓋阿里山等著名景點，擁有森林鐵道、雲海、日出與神木等自然景觀。沿海地區如東石也以蚵仔與海鮮聞名，是兼具山海景色的縣份。",
  },
  {
    id: 14,
    name: "台南",
    content:
      "台南市是台灣最古老的城市之一，保有許多歷史古蹟，如安平古堡、赤崁樓等，以各式傳統小吃聞名，被稱為「美食之都」，充滿文化與懷舊氛圍。",
  },
  {
    id: 15,
    name: "高雄",
    content:
      "高雄市位於台灣南部，是重要的港口與工業城市。擁有高雄港、愛河、駁二藝術特區、西子灣等景點，近年積極發展觀光與文創，城市景觀逐漸轉型。",
  },
  {
    id: 16,
    name: "屏東",
    content:
      "屏東縣位於台灣最南端，擁有墾丁國家公園、國立海洋生物博物館等景點，以熱帶海岸風光、潛水與海灘活動聞名，是熱門的海邊旅遊目的地。",
  },
  {
    id: 17,
    name: "台東",
    content:
      "台東縣位於台灣東南部，以原住民文化與自然景觀著稱，擁有池上、關山、三仙台等景點，並有綠島、蘭嶼等離島，是適合慢活與放鬆的旅遊地區。",
  },
  {
    id: 18,
    name: "花蓮",
    content:
      "花蓮縣位於台灣東部，以太魯閣國家公園、七星潭等自然景觀著稱，擁有壯麗的峽谷與海岸線，是熱門的山海旅遊城市，節奏相對悠閒。",
  },
  {
    id: 19,
    name: "澎湖",
    content:
      "澎湖縣由多座島嶼組成，是台灣著名的離島旅遊地，以玄武岩地形、跨海大橋、海上活動及澎湖花火節聞名，擁有獨特的海島風情。",
  },
  {
    id: 20,
    name: "金門",
    content:
      "金門縣位於台灣本島西方，是具有戰地歷史背景的離島，保有許多碉堡、砲台與傳統聚落，以高粱酒、風獅爺等文化特色著稱。",
  },
  {
    id: 21,
    name: "連江",
    content:
      "連江縣包含馬祖等離島，位於台灣北方海域，是早期重要的軍事前線。以藍眼淚海景、傳統聚落與戰地風情聞名，兼具自然與人文景觀。",
  },
  {
    id: 22,
    name: "新竹市（示例，可視需要保留或刪除）",
    content:
      "此筆資料可作為測試或保留空間使用，實際系統可依需求替換為其他城市或行政區，亦可直接刪除，避免干擾正式查詢結果。",
  },
];

async function recreateCollection() {
  const exists = await qdrant.collectionExists(CITY_COLLECTION);
  if (exists.exists) {
    await qdrant.deleteCollection(CITY_COLLECTION);
  }
  await qdrant.createCollection(CITY_COLLECTION, {
    vectors: { size: EMBEDDING_DIM, distance: "Cosine" },
  });
}

async function embedBatch(texts) {
  const res = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

async function main() {

  await recreateCollection();
  console.log(`已建立 collection: ${CITY_COLLECTION}`);

  const texts = cities.map((c) => c.content);
  const vectors = await embedBatch(texts);

  const points = cities.map((city, idx) => ({
    id: city.id ?? idx + 1,
    vector: vectors[idx],
    payload: {
      name: city.name,
      content: city.content,
    },
  }));
    await qdrant.upsert(CITY_COLLECTION, { wait: true, points });
  }

main().catch((err) => {
  console.error(err);
  process.exit(1);
});