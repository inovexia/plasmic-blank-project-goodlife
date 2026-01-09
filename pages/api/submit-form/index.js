export async function POST(req) {
  const data = await req.json();

  const formPayload = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formPayload.append(key, value);
  });

  const res = await fetch(
    'https://imgen3.dev.developer1.website/!/forms/redstripe_metro_lead_form_2025',
    {
      method: 'POST',
      body: formPayload,
    }
  );

  return new Response(JSON.stringify({ success: res.ok }), {
    status: res.ok ? 200 : 500,
  });
}
