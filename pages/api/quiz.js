export default function handler(req, res) {
  res.status(200).json([
    {
      question: 'How far is Billy Bishop from CN Tower?',
      options: ['1.7 Km', '5 Km', '17 Km'],
      correctIndex: 0,
      correctFeedback:
        "Correct! Billy Bishop is only 1.7 Km away from Toronto's signature landmark.",
      incorrectFeedback:
        "Close! Billy Bishop is only 1.7 Km away from Toronto's signature landmark.",
    },
    {
      question: 'How many cities does Billy Bishop fly to?',
      options: ['9 Cities', '15 Cities', '20 Cities'],
      correctIndex: 2,
      correctFeedback:
        'Correct! Billy Bishop flies to over 20 cities in Canada and the US.',
      incorrectFeedback:
        'Close! Billy Bishop flies to over 20 cities in Canada and the US.',
    },
    {
      question: 'How many jobs does Billy Bishop support?',
      options: ['500 Jobs', '1000 Jobs', '2000 Jobs'],
      correctIndex: 2,
      correctFeedback:
        'Correct! Billy Bishop supports over 2,000 jobs adding more every day!',
      incorrectFeedback:
        'Close! Billy Bishop supports over 2,000 jobs adding more every day!',
    },
  ]);
}
