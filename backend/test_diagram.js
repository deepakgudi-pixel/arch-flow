import { generateDiagramFromPrompt } from './src/lib/diagramGenerator.js';

async function test() {
  try {
    console.log("Testing YouTube system design generation...");
    const result = await generateDiagramFromPrompt({ description: "youtube system design" });
    console.log("RAW RESPONSE FROM AI:");
    console.log(result.rawResponse);
    console.log("NORMALIZED NODES:");
    console.log(JSON.stringify(result.nodes, null, 2));
    console.log("NORMALIZED EDGES:");
    console.log(JSON.stringify(result.edges, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
