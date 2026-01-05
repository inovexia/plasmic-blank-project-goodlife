export default function handler(req, res) {
  res.status(200).json({
    quiz: 'Quiz Name',
    questions: [
      {
        question: 'How far is Billy Bishop from CN Tower?',
        choices: [
          {
            'choice 1': [
              {
                choice: '1.7 Km',
                isCorrect: true,
                feedback:
                  "Correct! Billy Bishop is only 1.7 Km away from Toronto's signature landmark.",
              },
            ],
            'choice 2': [
              {
                choice: '5 Km',
                isCorrect: false,
                feedback:
                  "Close! Billy Bishop is only 1.7 Km away from Toronto's signature landmark.",
              },
            ],
            'choice 3': [
              {
                choice: '17 Km',
                isCorrect: false,
                feedback:
                  "Close! Billy Bishop is only 1.7 Km away from Toronto's signature landmark.",
              },
            ],
          },
        ],
      },
      {
        question: 'How many cities does Billy Bishop fly to?',
        choices: [
          {
            'choice 1': [
              {
                choice: '9 Cities',
                isCorrect: false,
                feedback:
                  'Close! Billy Bishop flies to over 20 cities in Canada and the US.',
              },
            ],
            'choice 2': [
              {
                choice: '15 Cities',
                isCorrect: false,
                feedback:
                  'Close! Billy Bishop flies to over 20 cities in Canada and the US.',
              },
            ],
            'choice 3': [
              {
                choice: '20 Cities',
                isCorrect: true,
                feedback:
                  'Correct! Billy Bishop flies to over 20 cities in Canada and the US.',
              },
            ],
          },
        ],
      },
      {
        question: 'How many jobs does Billy Bishop support?',
        choices: [
          {
            'choice 1': [
              {
                choice: '500 Jobs',
                isCorrect: false,
                feedback:
                  'Close! Billy Bishop supports over 2,000 jobs adding more everyday!',
              },
            ],
            'choice 2': [
              {
                choice: '1000 Jobs',
                isCorrect: false,
                feedback:
                  'Close! Billy Bishop supports over 2,000 jobs adding more everyday!',
              },
            ],
            'choice 3': [
              {
                choice: '2000 Jobs',
                isCorrect: true,
                feedback:
                  'Correct! Billy Bishop supports over 2,000 jobs adding more everyday!',
              },
            ],
          },
        ],
      },
    ],
  });
}
