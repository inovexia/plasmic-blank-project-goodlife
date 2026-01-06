import {
  PlasmicRootProvider,
  PlasmicComponent,
} from '@plasmicapp/loader-nextjs';

export default function PlasmicRuntime({ loader, plasmicData, componentName }) {
  return (
    <PlasmicRootProvider loader={loader} prefetchedData={plasmicData}>
      <PlasmicComponent component={componentName} />
    </PlasmicRootProvider>
  );
}
