export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 640 }}>
      <h1>🤖 Bot de recordatorios por WhatsApp</h1>
      <p>
        Servicio backend para ejecutivos. La interacción ocurre por WhatsApp; este sitio
        solo expone los endpoints de API.
      </p>
      <ul>
        <li>
          <code>GET/POST /api/whatsapp/webhook</code> — webhook de WhatsApp Cloud API.
        </li>
        <li>
          <code>POST /api/cron/dispatch</code> — despacho de recordatorios y avisos
          (protegido con <code>CRON_SECRET</code>).
        </li>
      </ul>
    </main>
  );
}
