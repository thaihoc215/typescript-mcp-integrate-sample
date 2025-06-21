import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// Define interfaces for type safety
interface ServerConfig {
    url: string;
    headers?: Record<string, string>;
    timeout?: number;
    sse_read_timeout?: number;
}

interface Config {
    server_name: ServerConfig;
}

interface Tool {
    name: string;
    description: string;
    inputSchema: any; // You can define a more specific schema if available
}

interface ToolsResponse {
    tools: Tool[];
}

// Function to extract server URL from config object
const getServerUrl = (config: Config): string => {
    if (!config?.server_name?.url) {
        throw new Error("Invalid configuration: URL not found");
    }
    return config.server_name.url;
};

// Function to extract config parameters
const getConfig = (config: Config) => {
    if (!config?.server_name) {
        throw new Error("Invalid configuration: server_name not found");
    }
    return {
        url: config.server_name.url,
        headers: config.server_name.headers || {},
        timeout: (config.server_name.timeout || 5) * 1000, // Convert to milliseconds
        sseReadTimeout: (config.server_name.sse_read_timeout || 60) * 1000 // Convert to milliseconds
    };
};

// Create a promise that rejects after a timeout
const timeoutPromise = (ms: number): Promise<never> => {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Connection timed out after ${ms}ms`)), ms);
    });
};

async function main(): Promise<void> {
    // Example config object
    const config: Config = {
        "server_name": {
            "url": "https://example.com/mcp", // Replace with your actual URL
            "headers": {},
            "timeout": 5,
            "sse_read_timeout": 60
        }
    };

    // Get configuration parameters
    const { url, headers, timeout, sseReadTimeout } = getConfig(config);

    // I want to test the connection with a timeout to url
    

    try {
        const transport = new SSEClientTransport(new URL(url));
        const client = new Client({
            name: "test",
            version: ""
        });

        // Connect with timeout
        await Promise.race([
            client.connect(transport),
            timeoutPromise(timeout)
        ]);

        console.log("Connected successfully");

        // Use sseReadTimeout for subsequent operations
        const toolsPromise = client.listTools();
        const tools = await Promise.race([
            toolsPromise,
            timeoutPromise(sseReadTimeout)
        ]) as ToolsResponse;

        console.log("Available tools:", tools);

        // Log each tool's inputSchema in detail
        console.log("\n----- DETAILED INPUT SCHEMAS -----");
        tools.tools.forEach((tool: Tool, index: number) => {
            console.log(`\n[${index + 1}] ${tool.name}: ${tool.description}`);
            console.log("Input Schema:");
            console.log(JSON.stringify(tool.inputSchema, null, 2));
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Unknown error occurred");
        }
    }
}

main();