# Configuración rápida

Abre `config.js` y sustituye los valores vacíos por los datos oficiales del taller.

```js
window.BC_CONFIG = Object.freeze({
  businessName: "BcMotorsport",
  whatsapp: "34600111222",
  email: "citas@tudominio.com",
  instagram: "https://www.instagram.com/tu_cuenta/",
  tiktok: "https://www.tiktok.com/@tu_cuenta",
  address: "Tu dirección completa",
  hours: "L-V 09:00–18:00",
  privacyContact: "privacidad@tudominio.com"
});
```

- `whatsapp`: solo números, incluido el prefijo internacional, sin `+`, espacios ni guiones.
- Las redes sociales deben usar `https://`.
- Si hay WhatsApp, el formulario lo usa primero. Si no, usa email.
- Si ambos están vacíos, genera una copia `.txt` local de la solicitud.
