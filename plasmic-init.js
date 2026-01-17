import { initPlasmicLoader } from '@plasmicapp/loader-nextjs';

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: process.env.NEXT_PUBLIC_PLM_PROJECT_ID,
      token: process.env.NEXT_PUBLIC_PLM_TOKEN,
      sitekeyv2: process.env.NEXT_PUBLIC_GCAPTCHA_SITEKEY_V2,
      sitekeyv3: process.env.NEXT_PUBLIC_GCAPTCHA_SITEKEY_V3,
    },
  ],
});


// export const PLASMIC = initPlasmicLoader({
//   projects: [
//     {
//       id: 'mQc8YBkhvPH6vABbdioLrq',
//       token:
//         'HIyVFqQ10HyKLIT9WhQgyjdyi23053KDt6jqNIlGTntApj6j1FtfgflORTVqeA7WlSczgqA1afaKlOLxqmQ',
//     },
//     {
//       id: 'uMs74eyiqRaLCuDw5CrYJD',
//       token:
//         'cp2foma1MdcTCVVP0LID24gTy3dVbhcQ7czulGPfbQrlrM5en1szbJC3Cnhp8ZAXJaCUJmHAFqSWUyDymiebA',
//     },
//     {
//       id: 'ntpcpEcLXuAagozZD2zkQJ',
//       token:
//         '3CGl8KyHYi09ysM4VAefsb1gsBKDcgOiRBSkry7f99Dyr5Qazp4HGg8j0KfEQnUIVFf2n0lyp0d2E6VfldqQ',
//     },
//   ],
//   preview: true,
// });