import { Toaster } from 'sonner';

const AppToaster = () => {
  return (
    <Toaster 
      position="bottom-right"  // Miejsce: Prawy dolny róg
      theme="dark"             // Motyw: Ciemny
      richColors               // Kolory: Włączone (zielony/czerwony)
      closeButton              // Przycisk zamykania: Tak
      expand={false}           // Rozwijanie: Nie (pojedyncze dymki są czytelniejsze)
      
      // Globalne style dla wszystkich toastów
      toastOptions={{
        className: 'my-toast-class',
        style: {
          background: 'rgba(30, 30, 30, 0.95)', // Półprzezroczyste tło
          border: '1px solid rgba(255, 255, 255, 0.1)', // Delikatna ramka
          color: '#fff',
          backdropFilter: 'blur(8px)', // Efekt rozmycia tła (Glassmorphism)
          fontSize: '14px',
        },
      }}
    />
  );
};

export default AppToaster;