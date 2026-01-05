import { initPlasmicLoader } from '@plasmicapp/loader-nextjs';

//const projects = JSON.parse(process.env.PLASMIC_PROJECTS || '[]');

// With API we need to use this dynamic loop
// import { loadPlasmicProjects } from './lib/loadPlasmicProjects';
// const projects = await loadPlasmicProjects();

let projects = [];

try {
  projects = JSON.parse(process.env.PLASMIC_PROJECTS || '[]');
} catch (e) {
  console.error('❌ Invalid PLASMIC_PROJECTS JSON');
  projects = [];
}

export const PLASMIC = initPlasmicLoader({
  projects,
  preview: true,
});