export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formHandle, values } = req.body;

    if (!formHandle || !values) {
      return res.status(400).json({ error: 'Missing form data' });
    }

    const apiRes = await fetch(
      `https://imgen3.dev.developer1.website/!/forms/${formHandle}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(values),
      }
    );

    const text = await apiRes.text();

    // Some APIs return empty body on success
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({
        error: data?.message || 'Form submit failed',
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Lead submit error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
