npm init -y

npm install @modelcontextprotocol/sdk dotenv

npm install -D @types/node typescript

npx tsc ; Compile the TypeScript code to JavaScript:
node dist/client.js

Since your project uses ES modules (import/export syntax), you need to specify a loader for TypeScript. Run the following command:
npx ts-node --loader ts-node/esm client.ts