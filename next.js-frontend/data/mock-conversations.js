/**
 * Mock conversation dataset for Insight Flow.
 *
 * Each entry simulates one full request/response pair the way the real
 * FastAPI chat_service endpoint is expected to return it. The shape
 * (question, answer, timestamp) is intentionally the contract that
 * services/mock-chat-service.js and the future real service both honor,
 * so the UI layer never has to change when the backend is swapped in.
 *
 * @typedef {Object} MockConversation
 * @property {string} id
 * @property {string} question
 * @property {string} answer
 * @property {string} timestamp - ISO 8601 string
 */

/** @type {MockConversation[]} */
export const mockConversations = [
    {
        id: "conv-1",
        question: "Show total sales by month",
        answer:
            "Total sales for the last 6 months: Jan $84,200, Feb $91,450, Mar $102,300, Apr $97,800, May $110,600, Jun $118,900. Sales have grown steadily, up about 41% from January to June.",
        timestamp: "2026-06-01T09:15:00.000Z",
    },
    {
        id: "conv-2",
        question: "Which category generated the highest revenue?",
        answer:
            "Electronics generated the highest revenue at $312,400, accounting for 34% of total sales, followed by Home & Kitchen at $198,750.",
        timestamp: "2026-06-02T10:22:00.000Z",
    },
    {
        id: "conv-3",
        question: "Top 10 customers",
        answer:
            "The top 10 customers by lifetime spend range from $8,450 to $22,100. The highest spender is customer #4821, with $22,100 across 34 orders.",
        timestamp: "2026-06-03T11:05:00.000Z",
    },
    {
        id: "conv-4",
        question: "Monthly revenue trend",
        answer:
            "Revenue has trended upward for 5 consecutive months, from $84,200 in January to $118,900 in June, with no month showing a decline.",
        timestamp: "2026-06-04T08:40:00.000Z",
    },
    {
        id: "conv-5",
        question: "Sales by gender",
        answer:
            "Female customers account for 54% of total sales ($328,600), male customers account for 41% ($249,300), and 5% is unspecified.",
        timestamp: "2026-06-05T14:12:00.000Z",
    },
    {
        id: "conv-6",
        question: "Highest selling category",
        answer:
            "Electronics is the highest selling category by unit volume, with 4,820 units sold this quarter, ahead of Apparel at 3,910 units.",
        timestamp: "2026-06-06T13:30:00.000Z",
    },
    {
        id: "conv-7",
        question: "Revenue by age group",
        answer:
            "The 25-34 age group drives the most revenue at $215,000 (28%), followed by 35-44 at $189,400 (24%). Customers under 18 contribute under 2%.",
        timestamp: "2026-06-07T09:50:00.000Z",
    },
    {
        id: "conv-8",
        question: "Average transaction value",
        answer:
            "The average transaction value across all orders this quarter is $68.40, up from $61.20 last quarter.",
        timestamp: "2026-06-08T16:05:00.000Z",
    },
    {
        id: "conv-9",
        question: "Quarterly sales",
        answer:
            "Q1 sales totaled $277,950 and Q2 sales totaled $327,300, a quarter-over-quarter increase of about 18%.",
        timestamp: "2026-06-09T10:18:00.000Z",
    },
    {
        id: "conv-10",
        question: "Revenue by weekday",
        answer:
            "Saturday generates the most revenue at $98,200 (17% of weekly total), while Tuesday is the lowest at $61,400.",
        timestamp: "2026-06-10T12:44:00.000Z",
    },
    {
        id: "conv-11",
        question: "Customer spending pattern",
        answer:
            "Most customers place 1-2 orders per quarter, but the top 15% of customers order 5+ times and account for 47% of total revenue.",
        timestamp: "2026-06-11T15:27:00.000Z",
    },
    {
        id: "conv-12",
        question: "Revenue comparison",
        answer:
            "Comparing this quarter to last: revenue is up 18% ($327,300 vs $277,950), driven mainly by growth in the Electronics category.",
        timestamp: "2026-06-12T09:02:00.000Z",
    },
]