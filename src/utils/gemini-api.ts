/**
 * Gemini API Integration for CPS Case Defense Analyzer
 * Provides AI-powered document analysis, defense strategy generation,
 * and legal assistance using Google's Gemini 2.5 Flash model
 */

import { getEnv } from './env';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Get Gemini API key from environment
 */
function getGeminiApiKey(): string {
  // Try localStorage first (for browser)
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('VITE_GEMINI_API_KEY');
    if (localKey) {
      return localKey;
    }
  }
  
  // Fallback to environment variable
  const apiKey = getEnv('VITE_GEMINI_API_KEY', '');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured. Please set up your API key in Settings.');
  }
  return apiKey;
}

/**
 * Content part interfaces
 */
export interface TextPart {
  text: string;
}

export interface InlineDataPart {
  inline_data: {
    mime_type: string;
    data: string; // base64 encoded
  };
}

export interface FileDataPart {
  file_data: {
    mime_type: string;
    file_uri: string;
  };
}

export type Part = TextPart | InlineDataPart | FileDataPart;

/**
 * Content interface (represents a turn in conversation)
 */
export interface Content {
  role: 'user' | 'model';
  parts: Part[];
}

/**
 * Generation configuration
 */
export interface GenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
}

/**
 * Safety settings
 */
export interface SafetySetting {
  category: string;
  threshold: string;
}

/**
 * Request body for generateContent
 */
export interface GenerateContentRequest {
  contents: Content[];
  generationConfig?: GenerationConfig;
  safetySettings?: SafetySetting[];
  systemInstruction?: Content;
}

/**
 * Response interfaces
 */
export interface Candidate {
  content: Content;
  finishReason?: string;
  index?: number;
  safetyRatings?: any[];
}

export interface GenerateContentResponse {
  candidates: Candidate[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  modelVersion?: string;
}

/**
 * Generate content using Gemini API (standard mode)
 */
export async function generateContent(
  request: GenerateContentRequest
): Promise<GenerateContentResponse> {
  try {
    const apiKey = getGeminiApiKey();
    const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * Stream content using Gemini API (streaming mode)
 */
export async function* streamGenerateContent(
  request: GenerateContentRequest
): AsyncGenerator<GenerateContentResponse> {
  try {
    const apiKey = getGeminiApiKey();
    const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:streamGenerateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() && line.startsWith('data: ')) {
          const jsonStr = line.substring(6);
          if (jsonStr.trim()) {
            try {
              const data = JSON.parse(jsonStr);
              yield data;
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming from Gemini API:', error);
    throw error;
  }
}

/**
 * Simple text generation helper
 */
export async function generateText(
  prompt: string,
  systemInstruction?: string,
  config?: GenerationConfig
): Promise<string> {
  const request: GenerateContentRequest = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: config,
  };

  if (systemInstruction) {
    request.systemInstruction = {
      role: 'user',
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await generateContent(request);
  const text = response.candidates[0]?.content?.parts[0];
  
  if (text && 'text' in text) {
    return text.text;
  }
  
  throw new Error('No text in response');
}

/**
 * CPS-specific: Analyze uploaded document
 */
export async function analyzeCPSDocument(
  documentText: string,
  documentType: string,
  violations: string[]
): Promise<string> {
  const systemInstruction = `You are a CPS case defense analyzer AI. You help parents analyze CPS documents to identify violations, understand their rights, and build defense strategies. Be detailed, specific, and cite legal principles when applicable.`;

  const prompt = `Analyze this CPS document and identify any violations, concerns, or issues that could help the parent's defense.

Document Type: ${documentType}

Document Content:
${documentText}

Known Violations in this case: ${violations.join(', ')}

Please provide:
1. **Summary**: Brief overview of the document
2. **Key Issues**: Important points parents should know
3. **Potential Violations**: Any CPS violations you can identify
4. **Rights Concerns**: Any rights that may have been violated
5. **Defense Opportunities**: How this document could help the defense
6. **Action Items**: What the parent should do next

Be thorough but concise. Focus on actionable insights.`;

  return await generateText(prompt, systemInstruction, {
    temperature: 0.7,
    maxOutputTokens: 2048,
  });
}

/**
 * CPS-specific: Generate defense strategy
 */
export async function generateDefenseStrategy(
  violations: string[],
  caseFacts: string,
  timeline: string
): Promise<string> {
  const systemInstruction = `You are a CPS case defense strategist AI. You help parents develop comprehensive defense strategies based on identified violations and case facts. Provide specific legal arguments, cite relevant case law when possible, and give actionable steps.`;

  const prompt = `Generate a comprehensive defense strategy for a CPS case with the following details:

Identified Violations:
${violations.map((v, i) => `${i + 1}. ${v}`).join('\n')}

Case Facts:
${caseFacts}

Timeline:
${timeline}

Please provide:
1. **Overall Strategy**: High-level approach to the defense
2. **Legal Arguments**: Specific constitutional and statutory arguments
3. **Case Law to Cite**: Relevant precedents (if you know them)
4. **Evidence to Gather**: What evidence would strengthen this case
5. **Motions to File**: What motions should be considered
6. **Procedural Steps**: What to do and when
7. **Key Points for Court**: What to emphasize in hearings

Be specific and actionable. This is for a parent representing themselves or working with an attorney.`;

  return await generateText(prompt, systemInstruction, {
    temperature: 0.8,
    maxOutputTokens: 3072,
  });
}

/**
 * CPS-specific: Analyze violations
 */
export async function analyzeViolations(
  violations: string[],
  documents: string[]
): Promise<string> {
  const systemInstruction = `You are a CPS violations analyst AI. You help parents understand how identified violations apply to their case and what legal remedies are available.`;

  const prompt = `Analyze the following CPS violations in the context of the case documents:

Violations Identified:
${violations.map((v, i) => `${i + 1}. ${v}`).join('\n')}

Available Documents:
${documents.map((d, i) => `${i + 1}. ${d}`).join('\n')}

For each violation, provide:
1. **Legal Basis**: What law or constitutional right was violated
2. **Severity**: How serious is this violation
3. **Remedies**: What can be done about it
4. **Evidence Needed**: What evidence proves this violation
5. **Case Law**: Relevant court decisions (if you know them)

Be thorough and provide actionable legal analysis.`;

  return await generateText(prompt, systemInstruction, {
    temperature: 0.7,
    maxOutputTokens: 2048,
  });
}

/**
 * CPS-specific: Generate motion template
 */
export async function generateMotion(
  motionType: string,
  violations: string[],
  facts: string
): Promise<string> {
  const systemInstruction = `You are a legal document drafting AI specializing in CPS cases. You help parents draft motions and legal documents. Provide proper legal formatting, citations, and persuasive arguments.`;

  const prompt = `Draft a ${motionType} for a CPS case with the following details:

Violations to Address:
${violations.map((v, i) => `${i + 1}. ${v}`).join('\n')}

Relevant Facts:
${facts}

Please draft a complete motion including:
1. **Caption**: Court heading and case information (use placeholders)
2. **Introduction**: What you're asking for and why
3. **Statement of Facts**: Relevant background
4. **Legal Argument**: Constitutional and statutory arguments
5. **Case Law Citations**: Relevant precedent
6. **Conclusion**: Summary of what you're requesting
7. **Prayer for Relief**: Specific requests to the court

Use proper legal formatting and persuasive language. Include [PLACEHOLDER] where specific information needs to be filled in.`;

  return await generateText(prompt, systemInstruction, {
    temperature: 0.7,
    maxOutputTokens: 4096,
  });
}

/**
 * CPS-specific: Answer legal question
 */
export async function answerLegalQuestion(
  question: string,
  caseContext: string
): Promise<string> {
  const systemInstruction = `You are a CPS legal assistance AI. You help parents understand their rights and legal options in CPS cases. Provide clear, accurate information while disclaiming that this is not legal advice and parents should consult an attorney.`;

  const prompt = `Question: ${question}

Case Context:
${caseContext}

Please provide a detailed answer that:
1. Directly answers the question
2. Explains relevant legal principles
3. Cites applicable laws or rights
4. Provides practical next steps
5. Includes important disclaimers

Remember to include: "DISCLAIMER: This is educational information only, not legal advice. Consult with a qualified attorney for advice specific to your situation."`;

  return await generateText(prompt, systemInstruction, {
    temperature: 0.7,
    maxOutputTokens: 1536,
  });
}

/**
 * CPS-specific: Summarize case law
 */
export async function summarizeCaseLaw(
  caseName: string,
  caseText: string,
  relevantViolations: string[]
): Promise<string> {
  const systemInstruction = `You are a legal research AI specializing in CPS cases. You help parents understand complex court opinions and how they apply to their case.`;

  const prompt = `Summarize this court case and explain how it applies to a CPS case:

Case Name: ${caseName}

Relevant Violations: ${relevantViolations.join(', ')}

Case Text (excerpt):
${caseText.substring(0, 4000)}

Please provide:
1. **Case Summary**: What happened in this case
2. **Court Holding**: What the court decided
3. **Legal Principle**: The key legal rule established
4. **How to Apply**: How this case helps in a CPS defense
5. **Key Quotes**: Important language to cite
6. **Limitations**: When this case doesn't apply

Make it understandable for non-lawyers while maintaining legal accuracy.`;

  return await generateText(prompt, systemInstruction, {
    temperature: 0.6,
    maxOutputTokens: 2048,
  });
}

/**
 * Multi-turn chat interface
 */
export class GeminiChat {
  private history: Content[] = [];
  private systemInstruction?: string;

  constructor(systemInstruction?: string) {
    this.systemInstruction = systemInstruction;
  }

  async sendMessage(message: string): Promise<string> {
    // Add user message to history
    this.history.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const request: GenerateContentRequest = {
      contents: this.history,
    };

    if (this.systemInstruction) {
      request.systemInstruction = {
        role: 'user',
        parts: [{ text: this.systemInstruction }],
      };
    }

    const response = await generateContent(request);
    const assistantMessage = response.candidates[0]?.content;

    if (assistantMessage) {
      // Add assistant response to history
      this.history.push(assistantMessage);
      
      const text = assistantMessage.parts[0];
      if (text && 'text' in text) {
        return text.text;
      }
    }

    throw new Error('No response from AI');
  }

  getHistory(): Content[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}

/**
 * Count tokens in text (approximate)
 */
export function estimateTokenCount(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}