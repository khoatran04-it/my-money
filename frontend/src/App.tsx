import AppRouter from '@/routes/AppRouter';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </>
  );
}