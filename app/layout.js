import './globals.css';

export const metadata = {
  title: 'Fabbio Bot · Tu asistente ejecutivo en WhatsApp',
  description:
    'Fabbio Bot gestiona tus recordatorios, listas y pendientes directo en WhatsApp. Pensado para ejecutivos y gerentes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
