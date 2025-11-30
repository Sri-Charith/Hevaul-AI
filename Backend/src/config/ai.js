// OpenAI/Azure AI configuration
// Example for OpenAI:
// import OpenAI from 'openai'
// 
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })
// 
// export default openai

// Example for Azure OpenAI:
// import { OpenAIClient, AzureKeyCredential } from '@azure/openai'
// 
// const client = new OpenAIClient(
//   process.env.AZURE_OPENAI_ENDPOINT,
//   new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
// )
// 
// export default client

export default {
  // AI configuration will be set up here
  provider: process.env.AI_PROVIDER || 'openai',
  apiKey: process.env.AI_API_KEY,
  endpoint: process.env.AI_ENDPOINT,
}

