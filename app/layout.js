import './globals.css';

export const metadata = {
  title: 'Bot Ejecutivos',
  description: 'Bot de recordatorios por WhatsApp para ejecutivos',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
