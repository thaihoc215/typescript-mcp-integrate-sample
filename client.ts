import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";


// Function to extract server URL from config object
const getServerUrl = (config: any) => {
    if (!config?.server_name?.url) {
        throw new Error("Invalid configuration: URL not found");
    }
    return config.server_name.url;
};


// const zapierMcpUrl = "exmpale_mcp_url"; // Replace with the actual URL
async function main() {

    // Example config object (in a real scenario, this would be passed to the function)
    const config = {
        "server_name": {
            "url": "example_mcp_url", // Replace with your actual URL
            "headers": {},
            "timeout": 5,
            "sse_read_timeout": 300
        }
    };


    // Get server URL from configuration
    const zapierMcpUrl = getServerUrl(config);

    const transport = new SSEClientTransport(new URL(zapierMcpUrl));
    const client = new Client({
        name: "my-zapier-client",
        version: "1.0.0"
    });

    await client.connect(transport);
    const tools = await client.listTools();
    console.log("Available tools:", tools);

    // Log each tool's inputSchema in detail
    console.log("\n----- DETAILED INPUT SCHEMAS -----");
    tools.tools.forEach((tool, index) => {
        console.log(`\n[${index + 1}] ${tool.name}: ${tool.description}`);
        console.log("Input Schema:");
        console.log(JSON.stringify(tool.inputSchema, null, 2));
    });
}

main().catch(console.error);