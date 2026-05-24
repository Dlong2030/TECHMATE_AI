import { GoogleGenerativeAI, Content } from '@google/generative-ai'
import Anthropic from '@anthropic-ai/sdk'

// ─── Init clients ─────────────────────────────────────────────────────────────

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

// ─── Types ────────────────────────────────────────────────────────────────────

export type AIProvider = 'gemini' | 'claude'

export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

export interface StreamOptions {
    systemPrompt: string
    messages: ChatMessage[]
    provider?: AIProvider
    onChunk: (chunk: string) => void
    onDone: (fullText: string) => void
    onError: (error: Error) => void
}

// ─── Gemini streaming ─────────────────────────────────────────────────────────

const streamGemini = async (options: StreamOptions): Promise<void> => {
    const { systemPrompt, messages, onChunk, onDone, onError } = options

    try {
        const model = gemini.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemPrompt,
        })

        // Chuyển messages sang format của Gemini
        const history: Content[] = messages.slice(0, -1).map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }))

        const lastMessage = messages[messages.length - 1]

        const chat = model.startChat({ history })
        const result = await chat.sendMessageStream(lastMessage.content)

        let fullText = ''
        for await (const chunk of result.stream) {
            const text = chunk.text()
            fullText += text
            onChunk(text)
        }

        onDone(fullText)
    } catch (error) {
        onError(error as Error)
    }
}

// ─── Claude streaming ─────────────────────────────────────────────────────────

const streamClaude = async (options: StreamOptions): Promise<void> => {
    const { systemPrompt, messages, onChunk, onDone, onError } = options

    try {
        let fullText = ''

        const stream = anthropic.messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: systemPrompt,
            messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
        })

        stream.on('text', (text) => {
            fullText += text
            onChunk(text)
        })

        await stream.finalMessage()
        onDone(fullText)
    } catch (error) {
        onError(error as Error)
    }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const streamChat = async (options: StreamOptions): Promise<void> => {
    const provider = options.provider ?? 'gemini'

    if (provider === 'claude') {
        return streamClaude(options)
    }

    return streamGemini(options)
}