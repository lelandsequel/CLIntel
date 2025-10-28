import { invokeLLM } from './server/_core/llm';

async function test() {
  console.log('Testing basic LLM call...');
  
  try {
    const response = await invokeLLM({
      messages: [
        { role: 'user', content: 'Say hello in one sentence.' }
      ]
    });
    
    console.log('SUCCESS:', response.choices[0].message.content);
  } catch (error) {
    console.error('FAILED:', error);
  }
}

test();
