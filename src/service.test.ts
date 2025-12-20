import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { answer } from './service';
import OpenAI from 'openai';

// Mock the OpenAI module
vi.mock('openai');

describe('answer', () => {
  let mockCreate: ReturnType<typeof vi.fn>;
  let mockOpenAI: any;

  beforeEach(() => {
    // Setup mock for each test
    mockCreate = vi.fn();
    mockOpenAI = {
      chat: {
        completions: {
          create: mockCreate
        }
      }
    };
    
    // Mock the OpenAI constructor
    vi.mocked(OpenAI).mockImplementation(() => mockOpenAI);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path Scenarios', () => {
    it('should return answer for a simple question', async () => {
      const expectedAnswer = 'The capital of France is Paris.';
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: expectedAnswer
            }
          }
        ]
      });

      const result = await answer('What is the capital of France?');

      expect(result).toBe(expectedAnswer);
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'What is the capital of France?' }]
      });
    });

    it('should handle complex multi-line questions', async () => {
      const complexQuestion = `Can you explain how quantum computing works?
Please include:
1. Basic principles
2. Key differences from classical computing
3. Current applications`;
      
      const expectedAnswer = 'Quantum computing utilizes quantum mechanics...';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: expectedAnswer } }]
      });

      const result = await answer(complexQuestion);

      expect(result).toBe(expectedAnswer);
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [{ role: 'user', content: complexQuestion }]
      });
    });

    it('should handle questions with special characters', async () => {
      const questionWithSpecialChars = 'What does "AI" stand for? How about @mentions & #hashtags?';
      const expectedAnswer = 'AI stands for Artificial Intelligence...';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: expectedAnswer } }]
      });

      const result = await answer(questionWithSpecialChars);

      expect(result).toBe(expectedAnswer);
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [{ role: 'user', content: questionWithSpecialChars }]
      });
    });

    it('should handle questions with unicode characters', async () => {
      const unicodeQuestion = '¿Cómo estás? 你好吗？ Как дела? 🤖';
      const expectedAnswer = 'Hello in multiple languages...';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: expectedAnswer } }]
      });

      const result = await answer(unicodeQuestion);

      expect(result).toBe(expectedAnswer);
    });

    it('should handle very long questions', async () => {
      const longQuestion = 'A'.repeat(10000); // 10K characters
      const expectedAnswer = 'Response to long question...';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: expectedAnswer } }]
      });

      const result = await answer(longQuestion);

      expect(result).toBe(expectedAnswer);
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [{ role: 'user', content: longQuestion }]
      });
    });

    it('should handle questions with code snippets', async () => {
      const questionWithCode = 'What does this code do: `const x = 5; return x * 2;`';
      const expectedAnswer = 'This code multiplies 5 by 2...';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: expectedAnswer } }]
      });

      const result = await answer(questionWithCode);

      expect(result).toBe(expectedAnswer);
    });

    it('should handle questions with JSON strings', async () => {
      const questionWithJson = 'Parse this JSON: {"name": "test", "value": 123}';
      const expectedAnswer = 'The JSON contains name and value fields...';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: expectedAnswer } }]
      });

      const result = await answer(questionWithJson);

      expect(result).toBe(expectedAnswer);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string question', async () => {
      const expectedAnswer = 'Please provide a question.';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: expectedAnswer } }]
      });

      const result = await answer('');

      expect(result).toBe(expectedAnswer);
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [{ role: 'user', content: '' }]
      });
    });

    it('should handle whitespace-only question', async () => {
      const whitespaceQuestion = '   \n\t  ';
      const expectedAnswer = 'Empty or invalid question.';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: expectedAnswer } }]
      });

      const result = await answer(whitespaceQuestion);

      expect(result).toBe(expectedAnswer);
    });

    it('should return empty string when response content is null', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }]
      });

      const result = await answer('What is AI?');

      expect(result).toBe('');
    });

    it('should return empty string when response content is undefined', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: undefined } }]
      });

      const result = await answer('What is AI?');

      expect(result).toBe('');
    });

    it('should handle response with empty content string', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: '' } }]
      });

      const result = await answer('What is AI?');

      expect(result).toBe('');
    });

    it('should handle single character question', async () => {
      const expectedAnswer = 'Could you provide more context?';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: expectedAnswer } }]
      });

      const result = await answer('?');

      expect(result).toBe(expectedAnswer);
    });

    it('should handle questions with only punctuation', async () => {
      const punctuationQuestion = '!@#$%^&*()';
      const expectedAnswer = 'Invalid input.';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: expectedAnswer } }]
      });

      const result = await answer(punctuationQuestion);

      expect(result).toBe(expectedAnswer);
    });

    it('should handle questions with HTML/XML tags', async () => {
      const htmlQuestion = '<script>alert("test")</script>What is XSS?';
      const expectedAnswer = 'XSS is a security vulnerability...';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: expectedAnswer } }]
      });

      const result = await answer(htmlQuestion);

      expect(result).toBe(expectedAnswer);
    });

    it('should handle questions with SQL injection attempts', async () => {
      const sqlQuestion = "'; DROP TABLE users; --";
      const expectedAnswer = 'SQL injection is a code injection technique...';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: expectedAnswer } }]
      });

      const result = await answer(sqlQuestion);

      expect(result).toBe(expectedAnswer);
    });

    it('should handle questions with newlines and tabs', async () => {
      const formattedQuestion = 'Line 1\nLine 2\n\tTabbed line';
      const expectedAnswer = 'Response to formatted question...';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: expectedAnswer } }]
      });

      const result = await answer(formattedQuestion);

      expect(result).toBe(expectedAnswer);
    });
  });

  describe('Error Handling', () => {
    it('should propagate error when OpenAI API call fails', async () => {
      const apiError = new Error('API Error: Rate limit exceeded');
      mockCreate.mockRejectedValue(apiError);

      await expect(answer('What is AI?')).rejects.toThrow('API Error: Rate limit exceeded');
    });

    it('should propagate network error', async () => {
      const networkError = new Error('Network error: ECONNREFUSED');
      mockCreate.mockRejectedValue(networkError);

      await expect(answer('What is AI?')).rejects.toThrow('Network error: ECONNREFUSED');
    });

    it('should propagate timeout error', async () => {
      const timeoutError = new Error('Request timeout');
      mockCreate.mockRejectedValue(timeoutError);

      await expect(answer('What is AI?')).rejects.toThrow('Request timeout');
    });

    it('should propagate authentication error', async () => {
      const authError = new Error('Invalid API key');
      mockCreate.mockRejectedValue(authError);

      await expect(answer('What is AI?')).rejects.toThrow('Invalid API key');
    });

    it('should handle malformed API response - missing choices', async () => {
      mockCreate.mockResolvedValue({
        choices: []
      });

      await expect(async () => {
        await answer('What is AI?');
      }).rejects.toThrow();
    });

    it('should handle malformed API response - missing message', async () => {
      mockCreate.mockResolvedValue({
        choices: [{}]
      });

      await expect(async () => {
        await answer('What is AI?');
      }).rejects.toThrow();
    });

    it('should handle API response with no choices array', async () => {
      mockCreate.mockResolvedValue({});

      await expect(async () => {
        await answer('What is AI?');
      }).rejects.toThrow();
    });

    it('should propagate OpenAI-specific errors', async () => {
      const openAIError = new Error('Invalid model specified');
      openAIError.name = 'OpenAIError';
      mockCreate.mockRejectedValue(openAIError);

      await expect(answer('What is AI?')).rejects.toThrow('Invalid model specified');
    });

    it('should handle rate limiting scenarios', async () => {
      const rateLimitError = new Error('Rate limit exceeded. Please try again later.');
      mockCreate.mockRejectedValue(rateLimitError);

      await expect(answer('What is AI?')).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle service unavailable error', async () => {
      const serviceError = new Error('Service temporarily unavailable');
      mockCreate.mockRejectedValue(serviceError);

      await expect(answer('What is AI?')).rejects.toThrow('Service temporarily unavailable');
    });
  });

  describe('Response Validation', () => {
    it('should handle response with very long content', async () => {
      const longResponse = 'A'.repeat(50000);
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: longResponse } }]
      });

      const result = await answer('Tell me everything about history');

      expect(result).toBe(longResponse);
      expect(result.length).toBe(50000);
    });

    it('should handle response with special formatting', async () => {
      const formattedResponse = '**Bold** *italic* `code` [link](url)';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: formattedResponse } }]
      });

      const result = await answer('Format this text');

      expect(result).toBe(formattedResponse);
    });

    it('should handle response with unicode emojis', async () => {
      const emojiResponse = 'Hello! 👋 Here is your answer 🎉';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: emojiResponse } }]
      });

      const result = await answer('Give me a friendly response');

      expect(result).toBe(emojiResponse);
    });

    it('should handle response with multiple paragraphs', async () => {
      const multiParagraphResponse = 'Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: multiParagraphResponse } }]
      });

      const result = await answer('Explain in detail');

      expect(result).toBe(multiParagraphResponse);
    });

    it('should handle response with code blocks', async () => {
      const codeBlockResponse = '```javascript\nconst x = 5;\nconsole.log(x);\n```';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: codeBlockResponse } }]
      });

      const result = await answer('Show me code example');

      expect(result).toBe(codeBlockResponse);
    });

    it('should handle response with lists', async () => {
      const listResponse = '1. First item\n2. Second item\n3. Third item';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: listResponse } }]
      });

      const result = await answer('Give me a list');

      expect(result).toBe(listResponse);
    });

    it('should handle response with tables', async () => {
      const tableResponse = '| Col1 | Col2 |\n|------|------|\n| A    | B    |';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: tableResponse } }]
      });

      const result = await answer('Show me a table');

      expect(result).toBe(tableResponse);
    });
  });

  describe('API Contract Validation', () => {
    it('should always use gpt-4 model', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'test' } }]
      });

      await answer('test question');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4'
        })
      );
    });

    it('should always set user role in messages', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'test' } }]
      });

      await answer('test question');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user' })
          ])
        })
      );
    });

    it('should pass question as message content', async () => {
      const question = 'specific test question';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'response' } }]
      });

      await answer(question);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ content: question })
          ])
        })
      );
    });

    it('should send exactly one message', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'response' } }]
      });

      await answer('test');

      const call = mockCreate.mock.calls[0][0];
      expect(call.messages).toHaveLength(1);
    });

    it('should not include additional parameters by default', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'response' } }]
      });

      await answer('test');

      const call = mockCreate.mock.calls[0][0];
      expect(call).toEqual({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test' }]
      });
    });
  });

  describe('Concurrency and Performance', () => {
    it('should handle multiple concurrent calls', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'response' } }]
      });

      const promises = [
        answer('Question 1'),
        answer('Question 2'),
        answer('Question 3'),
        answer('Question 4'),
        answer('Question 5')
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(mockCreate).toHaveBeenCalledTimes(5);
      results.forEach(result => expect(result).toBe('response'));
    });

    it('should handle sequential calls independently', async () => {
      const responses = ['Response 1', 'Response 2', 'Response 3'];
      
      for (let i = 0; i < responses.length; i++) {
        mockCreate.mockResolvedValueOnce({
          choices: [{ message: { content: responses[i] } }]
        });
      }

      const result1 = await answer('Question 1');
      const result2 = await answer('Question 2');
      const result3 = await answer('Question 3');

      expect(result1).toBe('Response 1');
      expect(result2).toBe('Response 2');
      expect(result3).toBe('Response 3');
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed success and failure in concurrent calls', async () => {
      mockCreate
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Success 1' } }] })
        .mockRejectedValueOnce(new Error('Failure'))
        .mockResolvedValueOnce({ choices: [{ message: { content: 'Success 2' } }] });

      const results = await Promise.allSettled([
        answer('Question 1'),
        answer('Question 2'),
        answer('Question 3')
      ]);

      expect(results[0].status).toBe('fulfilled');
      expect((results[0] as PromiseFulfilledResult<string>).value).toBe('Success 1');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');
      expect((results[2] as PromiseFulfilledResult<string>).value).toBe('Success 2');
    });
  });

  describe('Type Safety', () => {
    it('should accept string input', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'response' } }]
      });

      const question: string = 'test';
      const result = await answer(question);

      expect(typeof result).toBe('string');
    });

    it('should return string output', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'response' } }]
      });

      const result = await answer('test');

      expect(typeof result).toBe('string');
    });

    it('should return Promise<string>', async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: 'response' } }]
      });

      const resultPromise = answer('test');

      expect(resultPromise).toBeInstanceOf(Promise);
      const result = await resultPromise;
      expect(typeof result).toBe('string');
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with realistic customer support question', async () => {
      const customerQuestion = 'I forgot my password and cannot log in to my account. Can you help?';
      const supportAnswer = 'I can help you reset your password. Please visit...';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: supportAnswer } }]
      });

      const result = await answer(customerQuestion);

      expect(result).toBe(supportAnswer);
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [{ role: 'user', content: customerQuestion }]
      });
    });

    it('should work with technical troubleshooting question', async () => {
      const techQuestion = 'Error 500 when trying to upload files. Browser console shows CORS error.';
      const techAnswer = 'The CORS error indicates a cross-origin issue...';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: techAnswer } }]
      });

      const result = await answer(techQuestion);

      expect(result).toBe(techAnswer);
    });

    it('should work with billing inquiry', async () => {
      const billingQuestion = 'Why was I charged $49.99 when my subscription is $39.99?';
      const billingAnswer = 'Let me check your billing details...';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: billingAnswer } }]
      });

      const result = await answer(billingQuestion);

      expect(result).toBe(billingAnswer);
    });

    it('should work with feature request', async () => {
      const featureQuestion = 'Can you add dark mode to the mobile app?';
      const featureAnswer = 'Thank you for your suggestion! Dark mode is...';
      
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: featureAnswer } }]
      });

      const result = await answer(featureQuestion);

      expect(result).toBe(featureAnswer);
    });
  });
});