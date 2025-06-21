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

    const { url, timeout } = getConfig(config);

    await testConnectionWithTimeout(url, timeout);
    
    // // Test the connection before trying to use the client
    // const isConnected = await testConnectionWithTimeout(url, timeout);
    
    // if (isConnected) {
    //     console.log("Proceeding with MCP client connection...");
    //     // Continue with the rest of your code...
    // } else {
    //     console.error("Cannot connect to the server. Please check the URL or network connection.");
    // }
}

const testConnectionWithTimeout = async (url: string, timeoutMs: number): Promise<void> => {
    console.log(`Testing connection to ${url} with ${timeoutMs}ms timeout...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (response.status !== 200) {
            throw new Error(`Server error: ${response.status}`);
        }
        console.log(`Connection to MCP server successful! Status: ${response.status}`);
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};
// Function to test connection to URL with timeout
const testConnectionWithTimeout2 = async (url: string, timeoutMs: number): Promise<boolean> => {
    console.log(`Testing connection to ${url} with ${timeoutMs}ms timeout...`);
    
    // Create a controller to abort the fetch request if it takes too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
        // Attempt to connect to the URL
        const response = await fetch(url, { 
            method: 'HEAD',  // HEAD method just gets headers, not the full response
            signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        console.log(`Connection successful! Status: ${response.status}`);
        return true;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof DOMException && error.name === 'AbortError') {
            console.error(`Connection timed out after ${timeoutMs}ms`);
        } else {
            console.error(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        return false;
    }
};

main();