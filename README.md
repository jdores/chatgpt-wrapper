## Cloudflare worker to frontend chatgpt and other LLMs via Cloudflare AI GW

This is a Cloudflare worker that presents a frontend for chatgpt and other LLMs.
The worker interacts with the LLMs using Cloudflare AI gateway, for enhanced visibility and control.

### Installation instructions

1. Create an AI gateway
2. Enable "Authenticated Gateway". When doing this an API token will be created. Save it
3. Create an additional API token scope for Workers AI with Read permissions. Save it
4. Go to https://platform.openai.com/ and create an API key to interact with ChatGPT
5. In your worker project set the following variables as secrets:
- ACCOUNT_ID : your Cloudflare account id
- GATEWAY_NAME : the name of your Cloudflare AI gateway
- AI_GATEWAY_TOKEN : the API token that was generated when enabling "Authenticated Gateway"
- WORKERSAI_TOKEN : the API token created in step 3
- OPENAI_TOKEN : the API token created in step 4
6. Before deploying this worker, edit the wrangler.jsonc file with the custom domain the worker should use
7. For now, the models that can be used are hard coded in the src/index.js file
8. Create a Cloudflare Access Policy restricting access to the worker custom domain, so that only authorized people can access the ai chat tool.