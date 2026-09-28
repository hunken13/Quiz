// English questions. The correct answers are NOT here but in private/answer-key.js
// (and in the Supabase table question_keys). Types: mc = multiple choice, tf = true/false, estimate = estimate.

window.QUIZ = {
  "title": "From consumer credit institution to bank",
  "subtitle": "How well do you know capital and liquidity?",
  "questions": [
    {
      "id": "e1",
      "type": "mc",
      "text": "What is the most important difference between capital and liquidity?",
      "options": [
        "They are two words for the same thing",
        "Capital is the money in the account, liquidity is the profit",
        "Capital absorbs losses, liquidity lets us pay on time",
        "Liquidity only applies to the big banks"
      ]
    },
    {
      "id": "e2",
      "type": "mc",
      "text": "What risk weight does an ordinary unsecured consumer loan get?",
      "options": [
        "20%",
        "75%",
        "100%",
        "150%"
      ]
    },
    {
      "id": "e3",
      "type": "mc",
      "text": "Which of these lowers our capital ratio?",
      "options": [
        "We make a profit and keep it",
        "Customers pay on time",
        "We buy Swedish government securities",
        "We grow fast without bringing in new capital"
      ]
    },
    {
      "id": "e4",
      "type": "estimate",
      "text": "We lend out SEK 100m more in unsecured consumer loans. The risk weight is 75% and the requirement 16.5%. Roughly how much more capital do we need?",
      "unit": "SEK m"
    },
    {
      "id": "e5",
      "type": "tf",
      "text": "If we fall below the buffer requirements, we face restrictions, for example on dividends to the owners."
    },
    {
      "id": "e6",
      "type": "mc",
      "text": "What does the LCR measure?",
      "options": [
        "Whether liquid assets cover 30 days of stressed outflows",
        "Capital relative to the risk-weighted amount",
        "The share of customers who pay on time",
        "The interest rate on our deposits"
      ]
    },
    {
      "id": "e7",
      "type": "mc",
      "text": "Which of these assets counts in full in the liquidity buffer?",
      "options": [
        "Money in an account at another bank",
        "Our unsecured consumer loans",
        "Capitalised IT development",
        "Swedish treasury bills"
      ]
    },
    {
      "id": "e8",
      "type": "estimate",
      "text": "We have SEK 2,000m in deposits and assume 10% is withdrawn during a stressed month. Other outflows are SEK 30m and customers pay in SEK 50m. What is the minimum amount of liquid assets we need for an LCR of 100%?",
      "unit": "SEK m"
    }
  ]
};
