export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { answers } = req.body;

  // Example: calculate score
  const score = answers.filter((a) => a.isCorrect).length;

  // Fake DB ID
  const resultId = Date.now();

  res.status(200).json({
    id: resultId,
    score,
    total: answers.length,
  });
}
