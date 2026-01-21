import { Message } from "./types";
import { api } from "@/lib/apiClient";

// Build conversation history for context
export const buildConversationHistory = (messages: Message[]): string => {
  return messages
    .slice(-6) // Keep last 6 messages for context
    .map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');
};

// Main AI request function - calls backend API which uses Gemini
export const sendChatMessage = async (
  message: string, 
  conversationHistory?: string
): Promise<string> => {
  try {
    // Call backend API (which uses Google Generative AI)
    const result = await api.chat(message, conversationHistory);
    
    if (result.success && result.response) {
      return result.response;
    }
    
    throw new Error('No response from API');
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Fallback: Try direct Gemini API call from frontend
    try {
      return await callGeminiDirectly(message, conversationHistory);
    } catch (directError) {
      console.error('Direct Gemini API also failed:', directError);
      return getFallbackResponse(message);
    }
  }
};

// Direct Gemini API call (fallback when backend is unavailable)
async function callGeminiDirectly(message: string, history?: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key') {
    throw new Error('Gemini API key not configured');
  }
  
  const systemPrompt = `You are CoderSphere's AI coding assistant. You help developers with:
- Programming questions and debugging
- Code explanations and best practices
- Algorithm and data structure guidance
- Web development (React, TypeScript, CSS, etc.)
- Competitive programming tips for LeetCode, Codeforces, CodeChef
- General software development advice

Keep responses concise, helpful, and focused on coding. Use code examples when relevant.
Format code blocks properly using markdown syntax.`;

  const prompt = `${systemPrompt}\n\n${history ? `Previous conversation:\n${history}\n\n` : ''}User: ${message}\n\nAssistant:`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('Gemini API error:', error);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }
  
  throw new Error('Invalid Gemini response');
}

// Smart fallback responses when all APIs fail
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your coding assistant. How can I help you today with programming, web development, or competitive coding?";
  }
  
  if (lowerMessage.includes('react')) {
    return `**React Best Practices:**

1. Use functional components with hooks
2. Manage state with \`useState\` for local state
3. Use \`useEffect\` for side effects
4. Consider \`useContext\` or Redux for global state
5. Memoize expensive calculations with \`useMemo\`

\`\`\`jsx
const MyComponent = () => {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
};
\`\`\`

What specific React question can I help with?`;
  }
  
  if (lowerMessage.includes('typescript') || lowerMessage.includes('type')) {
    return `**TypeScript Tips:**

1. Define interfaces for your data structures
2. Use \`type\` for unions and intersections
3. Leverage generics for reusable code
4. Enable strict mode in tsconfig

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  return fetch(\`/api/users/\${id}\`).then(r => r.json());
}
\`\`\`

What TypeScript concept would you like to explore?`;
  }
  
  if (lowerMessage.includes('leetcode') || lowerMessage.includes('codeforces') || lowerMessage.includes('competitive')) {
    return `**Competitive Programming Tips:**

1. **Data Structures**: Master arrays, trees, graphs, heaps, hash maps
2. **Algorithms**: Sorting, searching, DP, greedy, backtracking
3. **Practice Daily**: Solve at least one problem per day
4. **Learn Patterns**: Two pointers, sliding window, binary search

**Popular Problem Types:**
- Arrays & Strings
- Dynamic Programming
- Graph traversal (BFS/DFS)
- Binary Search variations

Which topic would you like to practice?`;
  }
  
  if (lowerMessage.includes('error') || lowerMessage.includes('bug') || lowerMessage.includes('fix')) {
    return `**Debugging Checklist:**

1. ✅ Check browser console for errors
2. ✅ Verify data types match expectations
3. ✅ Add console.log statements to trace data flow
4. ✅ Check for null/undefined values
5. ✅ Review recent code changes
6. ✅ Check network requests in DevTools

Can you share the specific error message you're seeing?`;
  }
  
  return `I'm here to help with programming! Here are some things I can assist with:

• **React/TypeScript** - Components, hooks, state management
• **Algorithms** - Data structures, complexity analysis
• **Competitive Programming** - LeetCode, Codeforces tips
• **Debugging** - Error resolution strategies
• **Best Practices** - Code quality, performance

What would you like to explore?`;
}

// Legacy export for backwards compatibility
export const mockAIRequest = sendChatMessage;
