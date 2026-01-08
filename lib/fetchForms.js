export async function fetchForms() {
  const res = await fetch('https://dev.imgen3.dev1.co.in/api/forms');
  const json = await res.json();
  return json.data || [];
}
