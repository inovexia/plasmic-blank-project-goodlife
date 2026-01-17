export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' });
  }

  const { token, version = 'v2' } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Missing token' });
  }

  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      }
    );

    const data = await response.json();
    console.log('RECAPTCHA RESPONSE:', data);

    // v3 needs score check
    if (version === 'v3') {
      if (data.success && data.score >= 0.5) {
        return res.status(200).json({ success: true, score: data.score });
      }
      return res.status(200).json({
        success: false,
        score: data.score,
        error: data['error-codes'],
      });
    }

    // v2
    if (data.success) {
      return res.status(200).json({ success: true });
    }

    return res.status(200).json({
      success: false,
      error: data['error-codes'],
    });
  } catch (err) {
    console.error('Captcha verify error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
