import { initPlasmicLoader } from '@plasmicapp/loader-nextjs';

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: 'mQc8YBkhvPH6vABbdioLrq', // ID of a project you are using
      token:
        'HIyVFqQ10HyKLIT9WhQgyjdyi23053KDt6jqNIlGTntApj6j1FtfgflORTVqeA7WlSczgqA1afaKlOLxqmQ', // API token for that project
    },
  ],
  // Fetches the latest revisions, whether or not they were unpublished!
  // Disable for production to ensure you render only published changes.
  preview: true,
});