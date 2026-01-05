export async function loadPlasmicProjects() {
  const res = await fetch('https://your-backend.com/plasmic-projects', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to load Plasmic projects');
  }

  const data = await res.json();

  return data.map((p) => ({
    id: p.projectId,
    token: p.token,
  }));
}
