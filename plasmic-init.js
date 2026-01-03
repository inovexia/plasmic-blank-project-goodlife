import { initPlasmicLoader } from '@plasmicapp/loader-nextjs';


export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: 'mQc8YBkhvPH6vABbdioLrq',
      token:
        'HIyVFqQ10HyKLIT9WhQgyjdyi23053KDt6jqNIlGTntApj6j1FtfgflORTVqeA7WlSczgqA1afaKlOLxqmQ',
    },
    {
      id: 'uMs74eyiqRaLCuDw5CrYJD',
      token:
        'cp2foma1MdcTCVVP0LID24gTy3dVbhcQ7czulGPfbQrlrM5en1szbJC3Cnhp8ZAXJaCUJmHAFqSWUyDymiebA',
    },
    {
      id: 'ntpcpEcLXuAagozZD2zkQJ',
      token:
        '3CGl8KyHYi09ysM4VAefsb1gsBKDcgOiRBSkry7f99Dyr5Qazp4HGg8j0KfEQnUIVFf2n0lyp0d2E6VfldqQ',
    },
  ],
  // Fetches the latest revisions, whether or not they were unpublished!
  // Disable for production to ensure you render only published changes.
  preview: true,
});