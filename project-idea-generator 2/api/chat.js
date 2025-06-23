const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = 'asst_ZCRDjxbIxjEy5Ydm6lAEtWba';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, threadId: clientThreadId } = req.body;
    let threadId = clientThreadId;

    // Create a new thread if one doesn't exist
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
    }

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // Poll for the run to complete
    let runStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    } while (runStatus.status !== 'completed');

    // Get the latest messages from the thread
    const messages = await openai.beta.threads.messages.list(threadId);
    const assistantReply = messages.data
      .filter(msg => msg.role === 'assistant')
      .pop();

    res.status(200).json({ 
        reply: assistantReply.content[0].text.value, 
        threadId: threadId 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}; 