import '../components/plasmic-register';
import '@/styles/globals.css';
import UtmTracker from '../components/UtmTracker';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <UtmTracker />
      <Component {...pageProps} />
    </>
  );
}