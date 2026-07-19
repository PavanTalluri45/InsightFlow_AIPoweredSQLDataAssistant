import { mockConversations } from "@/data/mock-conversations"

/**
 * mock-chat-service.js
 *
 * Stands in for the real backend (python-backend/app/services/chat_service.py).
 * The UI only ever calls `mockChatService.ask(question)` and awaits an
 * { answer, timestamp } object back — it has no idea whether that came
 * from this mock or a live FastAPI call. When the backend is ready,
 * this is the only file that needs to change: swap the body of ask()
 * for a fetch() to the FastAPI endpoint and keep the same return shape.
 */

const MIN_DELAY_MS = 500
const MAX_DELAY_MS = 800
const FALLBACK_ANSWER = "I'm a mock service. This question doesn't exist yet."
const MATCH_THRESHOLD = 0.4

function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim()
}

function wordOverlapScore(a, b) {
    const wordsA = new Set(normalize(a).split(/\s+/).filter(Boolean))
    const wordsB = new Set(normalize(b).split(/\s+/).filter(Boolean))
    if (wordsA.size === 0 || wordsB.size === 0) return 0

    let shared = 0
    for (const word of wordsA) {
        if (wordsB.has(word)) shared += 1
    }
    return shared / Math.max(wordsA.size, wordsB.size)
}

function findBestMatch(question) {
    const normalizedQuestion = normalize(question)

    const exactMatch = mockConversations.find(
        (entry) => normalize(entry.question) === normalizedQuestion
    )
    if (exactMatch) return exactMatch

    let best = null
    let bestScore = 0
    for (const entry of mockConversations) {
        const score = wordOverlapScore(question, entry.question)
        if (score > bestScore) {
            bestScore = score
            best = entry
        }
    }

    return bestScore >= MATCH_THRESHOLD ? best : null
}

function randomDelay() {
    return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
}

export const mockChatService = {
    /**
     * @param {string} question
     * @returns {Promise<{ answer: string, timestamp: string }>}
     */
    ask(question) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const match = findBestMatch(question)
                resolve({
                    answer: match ? match.answer : FALLBACK_ANSWER,
                    timestamp: new Date().toISOString(),
                })
            }, randomDelay())
        })
    },
}