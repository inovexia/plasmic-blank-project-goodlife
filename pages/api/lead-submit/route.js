export async function POST(req) {
  try {
    const { formHandle, values } = await req.json();

    if (!formHandle) {
      return new Response(JSON.stringify({ error: 'Missing form handle' }), {
        status: 400,
      });
    }

    const apiRes = await fetch(
      `https://dev.imgen3.dev1.co.in/!/forms/${formHandle}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      }
    );

    const text = await apiRes.text();

    return new Response(text, {
      status: apiRes.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Form submission failed' }), {
      status: 500,
    });
  }
}
