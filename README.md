# BeanCraft Roast Log

A scroll-driven (scrollytelling) showcase of the **BeanCraft** coffee website.
Live site shown inside the mockups: https://beancraft-coffee.vercel.app/

CIT331 Web Technologies assignment.

## The idea
The page is told as a coffee roast. A drum-temperature panel (bottom-left) follows the scroll:

| Stage | Temperature | What happens |
|-------|-------------|--------------|
| Green | 20 °C | Hero intro: loader, falling bean (PNG), headline reveal |
| First crack | 196 °C | Laptop mockup enters, then the screen expands to full window |
| Development | 210 °C | Phone mockup swings in, then scales up into focus |
| Cooling | 24 °C | Contact form |

## Tech
- HTML5, CSS3 (flexbox, custom properties, backdrop-filter)
- JavaScript (vanilla) + GSAP and ScrollTrigger from cdnjs
- Each section is built by its own factory function in `js/main.js`

## Contact form security
- Client-side validation for name, email, message
- Input sanitising (control characters and `<` `>` removed, HTML/script patterns rejected)
- User text is only ever written with `textContent` (never `innerHTML`), so XSS is blocked
- Hidden honeypot field and a minimum-time check against bots
- Demo mode by default. To receive real emails, paste a Formspree URL into `FORM_ENDPOINT` in `js/main.js`

## Folder structure
```
index.html
css/style.css
js/main.js
assets/images/hero-bean.png
assets/images/favicon.png
```

## Run locally
Open the folder in VS Code and use Live Server on `index.html`.

## Accessibility and performance
- Semantic landmarks, labels, focus styles, `aria-live` form messages
- Respects `prefers-reduced-motion`
- Animations use transforms; custom cursor only on mouse devices
