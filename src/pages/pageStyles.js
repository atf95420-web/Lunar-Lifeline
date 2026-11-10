export const pageCss = `
.pg{min-height:100vh;background:#000 center/cover;color:#cfe8ff;font-family:'Segoe UI',Tahoma,sans-serif;padding:20px;position:relative;direction:ltr;overflow:hidden}
.pg *{box-sizing:border-box}
.pg-shade{position:absolute;inset:0;background:#000c}
.pg>*:not(.pg-shade){position:relative}
.pg>.pg-art{position:absolute;right:0;top:0;bottom:0;width:55%;background-size:cover;background-position:center;opacity:.25;mix-blend-mode:screen;pointer-events:none;-webkit-mask-image:linear-gradient(270deg,#000 0%,transparent 100%);mask-image:linear-gradient(270deg,#000 0%,transparent 100%)}
.pg-wrap{max-width:1200px;margin:0 auto}
.pg-head{display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid #1e90ff88;padding-bottom:12px;margin-bottom:16px}
.pg-head h2{margin:0;letter-spacing:3px;color:#00d4ff;font-size:clamp(16px,3vw,28px)}
.pg-back{background:#04122a;border:1px solid #00d4ff;color:#fff;padding:8px 18px;cursor:pointer;letter-spacing:2px;font-family:inherit}
.pg-back:hover{background:#0a4a8a}
.pg-sub{margin:0 0 18px;color:#9cc8ff;font-size:14px;letter-spacing:1px}
.pg-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.pg-card{border:1px solid #1e90ff88;background:#030a1aee;padding:18px;border-radius:6px;box-shadow:0 0 18px #1e90ff22}
.pg-card h3{margin:0 0 8px;color:#fff;letter-spacing:2px;font-size:17px}
.pg-card p{font-size:14px;color:#9cc8ff;line-height:1.6;margin:8px 0}
.pg-link{display:flex;flex-direction:column;min-height:170px;text-decoration:none;transition:transform .15s,border-color .15s}
.pg-link:hover{transform:translateY(-3px);border-color:#00d4ff}
.pg-link span{color:#00d4ff;font-size:12px;word-break:break-all}
.pg-tag{display:inline-block;align-self:flex-start;margin:2px 0 8px;padding:2px 8px;border:1px solid #00d4ff88;color:#00d4ff;font-size:10px;letter-spacing:2px;font-style:normal}
.pg-open{margin-top:auto;padding-top:12px;font-size:12px;letter-spacing:3px;color:#fff}
.pg-why{margin-top:22px;border-left:3px solid #00d4ff;background:#030a1aee;padding:14px 18px;font-size:14px;line-height:1.7;color:#cfe8ff}
.pg-why b{color:#00d4ff;letter-spacing:2px}
@media(max-width:1000px){.pg-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.pg-grid{grid-template-columns:1fr}}
`;