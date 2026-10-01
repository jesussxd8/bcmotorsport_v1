# BcMotorsport — versión limpia para GitHub Pages

Esta carpeta es una versión **100% estática** preparada para GitHub Pages. Se han eliminado Next.js, Cloudflare Workers, D1, Drizzle, autenticación de Sites, dependencias de Node, builds duplicados, originales pesados y archivos de desarrollo que GitHub Pages no puede ejecutar.

## Qué sigue funcionando

- Web responsive ES/EN.
- Preloader cinematográfico sincronizado con la carga, animaciones GSAP/ScrollTrigger, ticker continuo, parallax y microinteracciones en tarjetas/botones.
- Las animaciones respetan `prefers-reduced-motion` y se pueden pausar desde el control de movimiento.
- Comparadores antes/después.
- Galería, búsqueda, filtros, lightbox, zoom, teclado y enlaces compartibles.
- Vídeo del hero.
- Selector de tratamientos y formulario de cita.
- Mapa bajo demanda.
- Formulario estático con salida por WhatsApp o email.

## Configurar contacto

Edita `config.js`. Para que el formulario abra un canal de envío, rellena al menos uno:

```js
whatsapp: "34600111222",
email: "citas@tudominio.com",
```

También puedes completar `instagram`, `tiktok`, `address`, `hours` y `privacyContact`.

Si no configuras WhatsApp ni email, el formulario **no falla**: descarga una copia local de la solicitud para que el visitante pueda enviarla manualmente.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube **el contenido de esta carpeta a la raíz** del repositorio, de forma que `index.html` quede en la raíz.
3. Usa la rama `main`.
4. En GitHub abre **Settings → Pages**.
5. En **Build and deployment → Source**, selecciona **GitHub Actions**.
6. Haz un push a `main` o abre **Actions → Deploy GitHub Pages → Run workflow**.
7. Cuando termine, GitHub mostrará la URL pública.

El workflow ya está incluido en `.github/workflows/pages.yml`, por lo que no necesitas instalar Node ni compilar nada.

## Nota importante sobre reservas

GitHub Pages es hosting estático: no ejecuta bases de datos ni código de servidor. Por eso esta versión no incluye el antiguo panel privado, login con ChatGPT, D1 ni seguimiento de solicitudes. El formulario prepara el contacto en WhatsApp/email de forma transparente y no afirma guardar una reserva en un servidor.
