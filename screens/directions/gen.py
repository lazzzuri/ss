# Six distinct homepage design directions (hero + header), responsive, for comparison boards.
import os
OUT = os.path.dirname(os.path.abspath(__file__))
F1 = "file:///home/user/ss/node_modules/@fontsource"
F2 = "file:///tmp/claude-0/-home-user-ss/14f4b0f8-710d-54d2-8dbc-5c690bb55d32/scratchpad/fonts/node_modules/@fontsource"
def fonts(*names):
    out = []
    for n in names:
        fam, w = n.split(":")
        base = F1 if fam in ("onest", "unbounded", "ibm-plex-mono") else F2
        for sub in ("cyrillic", "latin"):
            out.append(f'<link rel="stylesheet" href="{base}/{fam}/{sub}-{w}.css">')
    return "".join(out)

PHONE = "067 000 00 00"
BASE = """*,*::before,*::after{box-sizing:border-box}html,body{margin:0}body{min-height:100vh;overflow:hidden}
a{color:inherit;text-decoration:none}.wrap{max-width:1200px;margin:0 auto;padding:0 18px}
.dsk{display:initial}.mob{display:none}@media(max-width:700px){.dsk{display:none!important}.mob{display:initial}}"""

def phone_icon(c="currentColor", s=22):
    return f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'

def win(kind, c="currentColor", a=None, s=48, sw=2.2):
    a = a or c
    P = {
      "single": f'<rect x="12" y="6" width="24" height="36" rx="1.5"/><path d="M15 9h18v30H15z" opacity=".5"/><path d="M15 9l18 15-18 15" stroke="{a}"/>',
      "double": f'<rect x="6" y="6" width="36" height="36" rx="1.5"/><path d="M24 6v36"/><path d="M27 9l12 15-12 15" stroke="{a}"/>',
      "triple": f'<rect x="3" y="8" width="42" height="32" rx="1.5"/><path d="M17 8v32M31 8v32"/><path d="M6 11l8 13-8 13M42 11l-8 13 8 13" stroke="{a}"/>',
      "balcony": f'<rect x="5" y="4" width="16" height="40" rx="1.5"/><rect x="21" y="4" width="22" height="24" rx="1.5"/><path d="M24 30h16v12H24" stroke-dasharray="3 3"/><path d="M8 7l10 17-10 17" stroke="{a}"/>',
      "glass": f'<rect x="6" y="10" width="28" height="32" rx="1.5"/><rect x="14" y="5" width="28" height="32" rx="1.5"/><path d="M19 12l6-5M19 19l12-10" stroke="{a}"/>',
      "repair": f'<path d="M30 8a8 8 0 0 0-10.5 10.5L7 31l6 6 12.5-12.5A8 8 0 0 0 36 14l-5 5-5-1-1-5z"/><circle cx="11" cy="33" r="1.4" fill="{a}" stroke="{a}"/>',
      "shield": f'<path d="M24 5l15 6v11c0 10-7 16-15 19-8-3-15-9-15-19V11z"/><path d="M24 16v9M24 30v1" stroke="{a}"/>',
      "house": f'<path d="M6 22L24 7l18 15M10 19v22h28V19"/><rect x="19" y="27" width="10" height="9" stroke="{a}"/><path d="M24 27v9M19 31.5h10" stroke="{a}"/>',
      "therm": f'<path d="M20 28V9a4 4 0 1 1 8 0v19a8 8 0 1 1-8 0z"/><path d="M24 18v14" stroke="{a}"/>',
    }[kind]
    return f'<svg width="{s}" height="{s}" viewBox="0 0 48 48" fill="none" stroke="{c}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{P}</svg>'

LOGO_GLYPH = lambda c1="#5fd0d8", c2="#7c97ff", st="#fff": f'<svg width="30" height="30" viewBox="0 0 32 32"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient></defs><rect x="3" y="3" width="26" height="26" rx="7" fill="url(#lg)" stroke="{st}" stroke-width="1.4"/><path d="M16 3.8V28.2M3.8 13H28.2" stroke="{st}" stroke-width="1.4"/><circle cx="25" cy="24" r="2.2" fill="#ffc94d"/></svg>'

D = {}

# ---------------------------------------------------------------- 1. СКЛО
D["1"] = ("Скло", fonts("unbounded:700","onest:400","onest:500","onest:600","ibm-plex-mono:500"), """
body{color:#f1f6fa;font:400 16px/1.55 Onest,sans-serif;background:#071222}
.bg{position:fixed;inset:0;background:radial-gradient(70% 60% at 0% 0%,rgba(95,208,216,.35),transparent 60%),radial-gradient(60% 60% at 100% 30%,rgba(124,151,255,.32),transparent 60%),radial-gradient(50% 40% at 50% 100%,rgba(255,201,77,.2),transparent 70%),linear-gradient(180deg,#113454,#0a1b2e 45%,#050d18)}
.bg::after{content:"";position:absolute;inset:16px;border:1px solid rgba(255,255,255,.06);border-radius:26px;background:linear-gradient(90deg,transparent calc(50% - .5px),rgba(255,255,255,.06) calc(50% - .5px),rgba(255,255,255,.06) calc(50% + .5px),transparent calc(50% + .5px))}
.g{background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(22px) saturate(160%);box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 24px 60px -24px rgba(0,0,0,.7)}
.hd{display:flex;align-items:center;gap:14px;margin-top:12px;padding:9px 10px 9px 16px;border-radius:999px;position:relative;z-index:2}
.logo{display:flex;align-items:center;gap:10px;font:700 14px Unbounded}.nav{display:flex;gap:18px;margin-left:16px;color:#cfdbe6;font-size:14.5px}
.r{margin-left:auto;display:flex;gap:10px;align-items:center}.lang{font:500 12px "IBM Plex Mono";border:1px solid rgba(255,255,255,.2);border-radius:999px;overflow:hidden;display:flex}.lang span{padding:7px 10px}.lang .on{background:rgba(255,255,255,.16)}
.amb{background:#ffc94d;color:#241a00;border-radius:999px;padding:12px 20px;font-weight:600;display:inline-flex;gap:8px;align-items:center;white-space:nowrap}
.hero{position:relative;z-index:2;display:grid;grid-template-columns:1.05fr .95fr;gap:24px;margin-top:28px}
.copy{border-radius:28px;padding:38px;display:grid;gap:20px;align-content:start}
.tag{font:500 12px "IBM Plex Mono";letter-spacing:.14em;text-transform:uppercase;color:#5fd0d8}
h1{margin:0;font:700 46px/1.07 Unbounded;letter-spacing:-.01em}.lead{margin:0;color:#cfdbe6;font-size:18px}
.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.facts div{padding:12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}.facts b{display:block}.facts span{color:#9cb1c4;font-size:13px}
.calc{border-radius:28px;padding:24px;display:grid;gap:14px;align-content:start}
.calc h3{margin:0;font-weight:600}.row{display:grid;grid-template-columns:86px 1fr;gap:12px;align-items:center;padding:10px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
.fields{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.fld{display:grid;gap:4px}.fld small{font-size:11.5px;color:#9cb1c4}.fld b{font:500 15px "IBM Plex Mono";padding:9px 10px;border-radius:10px;background:rgba(3,12,22,.45);border:1px solid rgba(255,255,255,.14)}
.seg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.seg span{text-align:center;padding:9px;border-radius:12px;border:1px solid rgba(255,255,255,.14);font-size:13.5px}.seg .on{border-color:#5fd0d8;background:rgba(95,208,216,.12)}
.tot{border-radius:16px;overflow:hidden;background:rgba(3,12,22,.35);border:1px solid rgba(255,255,255,.14)}
.tape{height:18px;background:#ffc94d repeating-linear-gradient(90deg,#241a00 0 1px,transparent 1px 8px);background-size:100% 7px;background-repeat:no-repeat}
.tot div{padding:12px 14px}.tot small{color:#9cb1c4}.tot b{display:block;font:700 26px Unbounded}
@media(max-width:700px){.hero{grid-template-columns:1fr;margin-top:16px}.copy{padding:22px;gap:16px}h1{font-size:31px}.lead{font-size:16px}.facts{grid-template-columns:1fr 1fr 1fr}.facts div{padding:10px}.facts b{font-size:14px}.facts span{font-size:11.5px}.calc{padding:16px}.hd{padding-left:12px}}
""", f"""<div class="bg"></div><div class="wrap">
<header class="hd g"><span class="logo">{LOGO_GLYPH()}ясне вікно</span><nav class="nav dsk"><a>Послуги</a><a>Райони</a><a>Будинки</a><a>Ціни</a><a>Блог</a><a>Майстрам</a></nav>
<div class="r"><span class="lang"><span class="on">UA</span><span>RU</span></span><a class="amb dsk">Розрахувати ціну</a><span class="mob" style="font-size:22px;padding:0 8px">☰</span></div></header>
<section class="hero"><div class="copy g"><span class="tag">Київ · заміна і ремонт вікон</span>
<h1>Заміна і ремонт вікон у Києві без черги на місяць</h1>
<p class="lead">Вкажіть розміри — одразу побачите ціну. Передамо заявку майстру з вільним графіком, він зателефонує сам.</p>
<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="amb">Розрахувати ціну</a><a class="amb" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2)">Викликати майстра</a></div>
<div class="facts"><div><b>3–7 днів</b><span>до заміру</span></div><div><b>Ціна одразу</b><span>до виїзду</span></div><div><b>0 ₴</b><span>для вас</span></div></div></div>
<div class="calc g"><h3>Розрахунок вартості</h3>
<div class="row">{win("double","#f1f6fa","#5fd0d8",80,1.6)}<div class="fields"><div class="fld"><small>Ширина</small><b>130</b></div><div class="fld"><small>Висота</small><b>140</b></div><div class="fld"><small>Кількість</small><b>2</b></div></div></div>
<div class="row">{win("balcony","#f1f6fa","#5fd0d8",80,1.6)}<div class="fields"><div class="fld"><small>Ширина</small><b>200</b></div><div class="fld"><small>Висота</small><b>210</b></div><div class="fld"><small>Кількість</small><b>1</b></div></div></div>
<div class="seg"><span>Економ</span><span class="on">Стандарт</span><span>Енерго</span></div>
<div class="tot"><div class="tape"></div><div><small>Орієнтовно, з монтажем</small><b>46 800 – 59 900 ₴</b></div></div>
<a class="amb" style="justify-self:start">Залишити заявку →</a></div></section></div>""")

# ---------------------------------------------------------------- 2. КРЕСЛЕННЯ
D["2"] = ("Креслення", fonts("fira-sans-condensed:700","fira-sans-condensed:800","fira-sans:400","fira-sans:500","ibm-plex-mono:400","ibm-plex-mono:500"), """
body{color:#1b2333;font:400 16px/1.55 "Fira Sans",sans-serif;background:#f3efe4;
background-image:linear-gradient(rgba(31,79,160,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(31,79,160,.10) 1px,transparent 1px),linear-gradient(rgba(31,79,160,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(31,79,160,.05) 1px,transparent 1px);background-size:120px 120px,120px 120px,24px 24px,24px 24px}
.mono{font-family:"IBM Plex Mono",monospace}
.strip{display:flex;align-items:center;border-bottom:1px solid #1b2333;font:400 12.5px "IBM Plex Mono";letter-spacing:.08em;background:#f3efe4}
.strip .t{padding:10px 18px;flex:1}.strip .l{display:flex}.strip .l span{padding:10px 14px;border-left:1px solid #1b2333}.strip .on{background:#dfe6f2;color:#1f4fa0;font-weight:500}
.hd{display:flex;align-items:center;gap:16px;padding:12px 18px;border-bottom:3px double #1b2333;background:#f3efe4}
.stamp{width:40px;height:40px;border-radius:50%;border:2px solid #1f4fa0;display:grid;place-items:center;color:#1f4fa0}
.logo{display:flex;align-items:center;gap:10px;font:800 22px "Fira Sans Condensed"}.nav{display:flex;gap:22px;margin-left:24px;font:500 15px "Fira Sans"}
.req{margin-left:auto;border:1.5px solid #1b2333;padding:9px 12px;font:700 16px "Fira Sans Condensed";display:flex;gap:10px;align-items:center}.req i{font-style:normal;border:1.5px solid #1b2333;padding:0 6px;font:500 13px "IBM Plex Mono"}
.hero{display:grid;grid-template-columns:.95fr 1.05fr;min-height:780px}
.left{padding:34px 34px 30px 18px;border-right:1px solid #1b2333;display:grid;gap:18px;align-content:start}
.sheet{font:400 13px "IBM Plex Mono";letter-spacing:.1em;color:#4a5568}
h1{margin:0;font:800 54px/1 "Fira Sans Condensed";letter-spacing:-.01em}h1 em{font-style:normal;color:#1f4fa0;display:block}
.lead{margin:0;font-size:18px;color:#39445a;max-width:46ch}
.lbl{font:400 12px "IBM Plex Mono";letter-spacing:.12em;color:#4a5568}
.boxes{display:flex;flex-wrap:wrap}.boxes span{border:1.5px solid #1b2333;padding:8px 13px;font:700 17px "Fira Sans Condensed";margin:0 -1.5px -1.5px 0;background:#f3efe4}
.cta{display:inline-grid;gap:2px;background:#1f4fa0;color:#fff;padding:14px 22px;box-shadow:6px 6px 0 #1b2333;justify-self:start}.cta b{font:700 22px "Fira Sans Condensed"}.cta span{font:500 15px "IBM Plex Mono";letter-spacing:.1em}
.lnk{font:700 19px "Fira Sans Condensed";border-bottom:2px solid #1b2333;justify-self:start}
.inp{display:flex;border:1.5px solid #1b2333;background:#fbf9f3}.inp span{flex:1;padding:12px;color:#7b8496;font:400 15px "IBM Plex Mono"}.inp b{border-left:1.5px solid #1b2333;padding:12px 16px;font:700 17px "Fira Sans Condensed";background:#e8e1cf}
.right{position:relative;padding:22px}
.dwg-t{display:flex;justify-content:space-between;font:400 11.5px "IBM Plex Mono";letter-spacing:.1em;color:#4a5568;border-bottom:1px solid #1b2333;padding-bottom:8px}
.note{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;font-size:13.5px;color:#39445a;max-width:520px;margin-top:6px}
.note i{font-style:normal;width:22px;height:22px;border:1.5px solid #1f4fa0;border-radius:50%;display:grid;place-items:center;font:500 12px "IBM Plex Mono";color:#1f4fa0}
.titleblock{position:absolute;left:22px;right:22px;bottom:22px;display:grid;grid-template-columns:2fr 1fr 1fr 1.2fr;border:1.5px solid #1b2333;background:#f3efe4}
.titleblock div{padding:8px 10px;border-left:1px solid #1b2333;display:grid;gap:2px}.titleblock div:first-child{border-left:0}.titleblock small{font:400 10.5px "IBM Plex Mono";letter-spacing:.08em;color:#4a5568}.titleblock b{font:700 16px "Fira Sans Condensed"}
@media(max-width:700px){.hero{grid-template-columns:1fr}.left{border:0;padding:26px 18px}h1{font-size:42px}.nav{display:none}.right{display:none}.strip .t{font-size:11px}}
""", f"""<div class="strip"><span class="t">СЕРВІС ПІДБОРУ МАЙСТРІВ · КИЇВ</span><span class="l"><span class="on">UA</span><span>RU</span></span></div>
<header class="hd"><span class="logo"><span class="stamp">{win("double","#1f4fa0","#1f4fa0",24,2.6)}</span>Ясне вікно</span><nav class="nav dsk"><a>Послуги</a><a>Райони</a><a>Ціни</a><a>Блог</a><a>Майстрам</a></nav><span class="req">Заявка <i>0</i></span></header>
<section class="hero"><div class="left">
<span class="sheet">— АРКУШ 01 / 06 · ЗАГАЛЬНИЙ ВИГЛЯД</span>
<h1>Заміна і ремонт вікон<em>у Києві без черги</em></h1>
<p class="lead">Вкажіть розміри прорізу — отримаєте орієнтовний кошторис. Заявку передамо майстру з вільним графіком.</p>
<span class="lbl">ТИП РОБІТ</span><div class="boxes"><span>Заміна</span><span>Ремонт</span><span>Склопакети</span><span>Балкон</span><span>Після обстрілу</span></div>
<a class="cta"><b>Розрахувати за розмірами</b><span>ЗАМІР ЗА 3–7 ДНІВ</span></a>
<a class="lnk">Ціни на вікна ↓</a>
<span class="lbl">ШВИДКИЙ РОЗРАХУНОК</span><div class="inp"><span>1300 × 1400 мм, 2 шт</span><b>Порахувати</b></div>
</div><div class="right dsk">
<div class="dwg-t"><span>ВІКНО ДВОСТУЛКОВЕ · ПОВОРОТНО-ВІДКИДНЕ</span><span>РОЗМІРИ — ММ</span></div>
<svg width="100%" height="470" viewBox="0 0 600 470" fill="none" stroke="#1b2333" stroke-width="1.6">
<rect x="150" y="40" width="300" height="330"/><rect x="160" y="50" width="135" height="310" stroke-width="1"/><rect x="305" y="50" width="135" height="310" stroke-width="1"/>
<path d="M305 50 L440 205 L305 360" stroke="#1f4fa0" stroke-width="1.2"/><path d="M305 360 L372 50 L440 360" stroke="#1f4fa0" stroke-width="1" stroke-dasharray="5 4"/>
<rect x="282" y="190" width="8" height="34" fill="#1b2333"/>
<path d="M150 400 H450 M150 392 V408 M450 392 V408" stroke-width="1"/><text x="300" y="424" fill="#1b2333" stroke="none" font-family="IBM Plex Mono" font-size="14" text-anchor="middle">1300</text>
<path d="M110 40 V370 M102 40 H118 M102 370 H118" stroke-width="1"/><text x="96" y="210" fill="#1b2333" stroke="none" font-family="IBM Plex Mono" font-size="14" text-anchor="middle" transform="rotate(-90 96 210)">1400</text>
<circle cx="500" cy="80" r="13" stroke="#1f4fa0"/><text x="500" y="85" fill="#1f4fa0" stroke="none" font-family="IBM Plex Mono" font-size="13" text-anchor="middle">1</text><path d="M487 84 L440 110" stroke="#1f4fa0" stroke-width="1"/>
<circle cx="520" cy="200" r="13" stroke="#1f4fa0"/><text x="520" y="205" fill="#1f4fa0" stroke="none" font-family="IBM Plex Mono" font-size="13" text-anchor="middle">2</text><path d="M507 202 L420 230" stroke="#1f4fa0" stroke-width="1"/>
<circle cx="500" cy="330" r="13" stroke="#1f4fa0"/><text x="500" y="335" fill="#1f4fa0" stroke="none" font-family="IBM Plex Mono" font-size="13" text-anchor="middle">3</text><path d="M487 333 L452 360" stroke="#1f4fa0" stroke-width="1"/>
</svg>
<div class="note"><i>1</i><span>Профіль 5 камер, монтажна ширина 70 мм</span><i>2</i><span>Двокамерний склопакет 4-16-4-16-4</span><i>3</i><span>Монтаж на піну з паро- і гідроізоляційними стрічками</span></div>
<div class="titleblock"><div><small>НАЙМЕНУВАННЯ</small><b>Вікно двостулкове</b></div><div><small>ПРОФІЛЬ</small><b>Стандарт</b></div><div><small>М</small><b>1:20</b></div><div><small>ЦІНА, ОРІЄНТОВНО</small><b>від 13 600 ₴</b></div></div>
</div></section>""")

# ---------------------------------------------------------------- 3. РУЛЕТКА
TAPE = "".join(f'<path d="M{i*8} 0V{14 if i%10==0 else 9 if i%5==0 else 6}" stroke="#121212" stroke-width="1"/>' + (f'<text x="{i*8+3}" y="26" font-family="Oswald" font-size="11" fill="#121212">{i}</text>' if i%10==0 and i>0 else '') for i in range(0, 200))
TAPESVG = f'<svg width="1600" height="30" viewBox="0 0 1600 30">{TAPE}</svg>'
D["3"] = ("Рулетка", fonts("oswald:600","oswald:700","onest:400","onest:500","onest:600"), """
body{color:#121212;font:400 16px/1.5 Onest,sans-serif;background:#ffcc1f}
.top{background:#121212;color:#ffcc1f;display:flex;align-items:center;gap:16px;padding:12px 18px}
.logo{display:flex;align-items:center;gap:10px;font:700 22px Oswald;text-transform:uppercase;letter-spacing:.02em}
.nav{display:flex;gap:22px;margin-left:24px;font:600 15px Oswald;text-transform:uppercase;letter-spacing:.04em;color:#fff}
.ph{margin-left:auto;font:600 18px Oswald;letter-spacing:.04em;color:#fff}.lang{display:flex;font:600 14px Oswald}.lang span{padding:6px 10px;border:1.5px solid #ffcc1f}.lang .on{background:#ffcc1f;color:#121212}
.tape{background:#ffd84d;border-bottom:2px solid #121212;overflow:hidden;height:32px}
.hero{display:grid;grid-template-columns:1.15fr .85fr;gap:30px;padding:34px 0}
.k{font:600 15px Oswald;text-transform:uppercase;letter-spacing:.12em;display:inline-block;background:#121212;color:#ffcc1f;padding:6px 10px}
h1{margin:16px 0 14px;font:700 86px/.92 Oswald;text-transform:uppercase;letter-spacing:-.01em}
.lead{margin:0;font-size:19px;max-width:44ch}
.list{display:grid;grid-template-columns:1fr 1fr;gap:10px 22px;margin:22px 0}.list span{border-left:6px solid #121212;padding-left:10px;font:700 20px Oswald;text-transform:uppercase}
.call{display:flex;gap:14px;align-items:center;background:#121212;color:#fff;padding:14px 18px}.call i{width:46px;height:46px;background:#ffcc1f;display:grid;place-items:center}.call small{display:block;color:#ffcc1f;font:600 13px Oswald;letter-spacing:.1em;text-transform:uppercase}.call b{font:700 30px Oswald;letter-spacing:.02em}
.out{display:block;text-align:center;border:3px solid #121212;padding:12px;font:700 20px Oswald;text-transform:uppercase;margin-top:10px}
.card{background:#121212;color:#fff;padding:22px;align-self:start;display:grid;gap:14px;box-shadow:10px 10px 0 rgba(0,0,0,.25)}
.card h3{margin:0;font:700 26px Oswald;text-transform:uppercase;color:#ffcc1f}
.fl{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}.fl div{border:2px solid #ffcc1f;padding:8px 10px}.fl small{display:block;font:600 12px Oswald;letter-spacing:.08em;color:#ffcc1f;text-transform:uppercase}.fl b{font:700 26px Oswald}
.price{font:700 40px Oswald;color:#ffcc1f}
.btn{background:#ffcc1f;color:#121212;text-align:center;padding:14px;font:700 20px Oswald;text-transform:uppercase}
@media(max-width:700px){.hero{grid-template-columns:1fr;padding:22px 0;gap:22px}h1{font-size:56px}.nav,.ph{display:none}.lang{margin-left:auto}.list{grid-template-columns:1fr 1fr}.list span{font-size:17px}.call b{font-size:26px}}
""", f"""<header class="top"><span class="logo">{win("double","#ffcc1f","#fff",30,2.6)}Ясне вікно</span><nav class="nav dsk"><a>Послуги</a><a>Райони</a><a>Ціни</a><a>Блог</a></nav><span class="ph dsk">{PHONE}</span><span class="lang"><span class="on">UA</span><span>RU</span></span></header>
<div class="tape">{TAPESVG}</div>
<div class="wrap"><section class="hero"><div>
<span class="k">Київ · заміна і ремонт вікон</span>
<h1>Майстер на замір за 3–7 днів</h1>
<p class="lead">Вкажіть розміри — ціну побачите одразу. Заявку отримає майстер з вільним графіком, а не розсилка по всіх.</p>
<div class="list"><span>Заміна вікон</span><span>Ремонт</span><span>Склопакети</span><span>Балкони</span></div>
<a class="call"><i>{phone_icon("#121212",24)}</i><span><small>Подзвонити диспетчеру</small><b>{PHONE}</b></span></a>
<a class="out">Розрахувати ціну ↓</a>
</div><div class="card"><h3>Рахуємо вікно</h3>
<div class="fl"><div><small>Ширина</small><b>130</b></div><div><small>Висота</small><b>140</b></div><div><small>Штук</small><b>2</b></div></div>
<div><small style="font:600 13px Oswald;letter-spacing:.1em;color:#bbb;text-transform:uppercase">Орієнтовно з монтажем</small><div class="price">24 900 – 31 800 ₴</div></div>
<a class="btn">Залишити заявку →</a></div></section></div>""")

# ---------------------------------------------------------------- 4. ПЛАКАТ
D["4"] = ("Плакат", fonts("rubik:800","rubik:900","onest:400","onest:500","onest:600"), """
body{color:#111;font:400 16px/1.5 Onest,sans-serif;background:#efe8dc}
.hd{display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:3px solid #111}
.logo{display:flex;align-items:center;gap:10px;font:800 20px Rubik;letter-spacing:-.01em}.logo small{display:block;font:500 12px Onest;color:#555;letter-spacing:0}
.ring{width:42px;height:42px;border-radius:50%;border:3px solid #111;display:grid;place-items:center}
.nav{display:flex;gap:22px;margin-left:24px;font:600 15px Onest}.r{margin-left:auto;display:flex;gap:0}.r span{border:2px solid #111;padding:7px 10px;font:800 14px Rubik}.r .on{background:#111;color:#efe8dc}.req{background:#e3261b;color:#fff;font:800 16px Rubik;padding:10px 16px;margin-left:10px}
.hero{position:relative;display:grid;grid-template-columns:1fr 1fr;min-height:780px;overflow:hidden}
.circle{position:absolute;width:640px;height:640px;border-radius:50%;background:#e3261b;right:-120px;top:20px;display:grid;place-items:center;color:#efe8dc}
.circle .n{font:900 200px/.8 Rubik;letter-spacing:-.04em}.circle .s{font:800 26px Rubik;text-align:center;margin-top:-10px}
.lens{position:absolute;width:210px;height:210px;border-radius:50%;background:#efe8dc;border:6px solid #111;display:grid;place-items:center;right:420px;top:80px}
.copy{position:relative;z-index:2;padding:56px 18px 110px;display:grid;gap:20px;align-content:start}
.mk{display:flex;gap:10px;align-items:center;font:600 15px Onest}.mk::before{content:"";width:12px;height:12px;background:#e3261b}
h1{margin:0;font:900 84px/.92 Rubik;letter-spacing:-.035em}
.big{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center}.big b{font:900 88px/.9 Rubik;letter-spacing:-.04em}.big p{margin:0;font-size:16.5px}
.red{display:flex;align-items:center;gap:14px;background:#e3261b;color:#fff;padding:14px 18px}.red i{width:46px;height:46px;border-radius:50%;background:#fff;display:grid;place-items:center}.red small{display:block;font:600 14px Onest}.red b{font:900 30px Rubik;letter-spacing:-.01em}
.blk{display:flex;justify-content:space-between;align-items:center;background:#111;color:#fff;padding:16px 18px;font:800 20px Rubik}.blk span{color:#e3261b}.band{position:absolute;left:0;right:0;bottom:0;background:#111;color:#efe8dc;display:flex;gap:34px;padding:20px 28px;font:900 34px Rubik;letter-spacing:-.01em;white-space:nowrap;z-index:3}.band i{font-style:normal;color:#e3261b}
@media(max-width:700px){.hero{grid-template-columns:1fr;min-height:0}.circle{width:380px;height:380px;right:-110px;top:-60px}.circle .n{font-size:110px}.circle .s{font-size:16px}.lens{width:140px;height:140px;left:18px;right:auto;top:60px;border-width:5px}
.copy{padding-top:330px}h1{font-size:54px}.big b{font-size:62px}.nav{display:none}.req{padding:8px 12px}.logo small{display:none}}
""", f"""<header class="hd"><span class="logo"><span class="ring">{win("double","#111","#e3261b",26,2.8)}</span><span>Ясне вікно<small>Київ · вікна без черги</small></span></span><nav class="nav dsk"><a>Послуги</a><a>Райони</a><a>Ціни</a><a>Блог</a></nav><span class="r"><span class="on">UA</span><span>RU</span></span><a class="req">Заявка</a></header>
<section class="hero"><div class="circle"><div style="display:grid;justify-items:center;transform:translateX(-30px)"><span class="n">3–7</span><span class="s">днів<br>до заміру</span></div></div>
<div class="lens">{win("triple","#111","#e3261b",120,2)}</div>
<div class="copy"><span class="mk">Київ · заміна і ремонт вікон</span>
<h1>Вікна без черги на місяць</h1>
<div class="big"><b>0 ₴</b><p>для вас: майстер платить нам за заявку. <b style="font:700 16.5px Onest">Ціна одразу</b> — ще до виїзду.</p></div>
<a class="red"><i>{phone_icon("#e3261b",24)}</i><span><small>Подзвонити диспетчеру</small><b>{PHONE}</b></span></a>
<a class="blk">Розрахувати ціну <span>→</span></a></div><div></div><div class="band dsk">ЗАМІНА <i>●</i> РЕМОНТ <i>●</i> СКЛОПАКЕТИ <i>●</i> БАЛКОНИ <i>●</i> ПІСЛЯ ОБСТРІЛУ</div></section>""")

# ---------------------------------------------------------------- 5. МАРКЕТ
CARDS = [("double","#e3f3ee","Заміна вікон","від 5 200 ₴/м²"),("repair","#fff1df","Ремонт і регулювання","від 250 ₴"),("glass","#e6efff","Заміна склопакета","від 2 800 ₴/м²"),("balcony","#f3e8ff","Балкон під ключ","за розрахунком")]
D["5"] = ("Маркет", fonts("manrope:500","manrope:600","manrope:700","manrope:800"), """
body{color:#121a22;font:500 16px/1.5 Manrope,sans-serif;background:#f3f5f7}
.hdw{background:#fff;border-bottom:1px solid #e3e8ee}.hd{display:flex;align-items:center;gap:14px;padding:12px 18px;max-width:1200px;margin:0 auto}
.logo{display:flex;align-items:center;gap:10px;font:800 19px Manrope}.logo small{display:block;font:500 12px Manrope;color:#6a7682}
.cat{display:flex;align-items:center;gap:8px;background:#e7f4f0;color:#0f8a72;padding:9px 14px;border-radius:12px;font-weight:700;font-size:14.5px;margin-left:16px}
.nav{display:flex;gap:20px;font:600 14.5px Manrope;color:#3b4652;margin-left:8px}
.r{margin-left:auto;display:flex;gap:10px;align-items:center}.lang{display:flex;background:#eef1f4;border-radius:10px;padding:3px}.lang span{padding:6px 9px;border-radius:8px;font:700 13px Manrope;color:#6a7682}.lang .on{background:#121a22;color:#fff}
.req{background:#121a22;color:#fff;border-radius:12px;padding:10px 14px;font-weight:700;display:flex;gap:8px;align-items:center}.req i{font-style:normal;background:#fff;color:#121a22;border-radius:6px;padding:0 6px;font-size:13px}
.top{background:#fff;padding:30px 0 26px;border-bottom:1px solid #e3e8ee}
.hero{display:grid;grid-template-columns:1.25fr .75fr;gap:28px}
h1{margin:0 0 10px;font:800 46px/1.08 Manrope;letter-spacing:-.025em}h1 span{color:#0f8a72}
.lead{margin:0 0 18px;color:#4b5763;font-size:17px;max-width:56ch}
.search{display:flex;align-items:center;gap:10px;border:2px solid #121a22;border-radius:16px;padding:6px 6px 6px 16px;max-width:640px}.search span{flex:1;color:#8a95a0}.search b{background:#121a22;color:#fff;border-radius:11px;padding:11px 18px}
.hint{margin-top:10px;font-size:13.5px;color:#6a7682}.hint u{text-decoration:none;background:#eef1f4;border-radius:8px;padding:3px 8px;margin-left:6px;color:#3b4652}
.side{background:#f7f9fa;border:1px solid #e3e8ee;border-radius:20px;padding:18px;display:grid;gap:12px;align-content:start}
.tel{display:flex;gap:12px;align-items:center;background:#0f8a72;color:#fff;border-radius:16px;padding:14px 16px;box-shadow:0 12px 24px -12px rgba(15,138,114,.6)}.tel i{width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.18);display:grid;place-items:center}.tel small{display:block;font-size:13px;opacity:.85}.tel b{font:800 24px Manrope}
.side p{margin:0;font-size:13.5px;color:#4b5763}
.sec{padding:22px 0}.sh{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px}.sh h2{margin:0;font:800 22px Manrope}.sh a{color:#0f8a72;font-weight:700;font-size:14.5px}
.chips{display:flex;gap:8px;flex-wrap:nowrap;overflow:hidden;margin-bottom:16px}.chips span{background:#fff;border:1px solid #e3e8ee;border-radius:12px;padding:8px 13px;font-weight:700;font-size:14px;white-space:nowrap}.chips b{color:#0f8a72;margin-left:4px}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.c{background:#fff;border:1px solid #e3e8ee;border-radius:18px;overflow:hidden;display:grid}
.c .ill{height:150px;display:grid;place-items:center}.c .b{padding:14px;display:grid;gap:10px}.c h3{margin:0;font:700 16.5px Manrope}.c .p{display:flex;justify-content:space-between;align-items:center;border-top:1px dashed #e3e8ee;padding-top:10px}.c .p b{font:800 18px Manrope}.c .p i{font-style:normal;border:1.5px solid #0f8a72;color:#0f8a72;border-radius:10px;width:34px;height:34px;display:grid;place-items:center;font-weight:800}
@media(max-width:700px){.hero{grid-template-columns:1fr}.nav,.cat{display:none}h1{font-size:33px}.cards{grid-template-columns:1fr 1fr}.c .ill{height:110px}.logo small{display:none}.side{order:2;padding:0;border:0;background:none}.side p{display:none}.top{padding:22px 0 18px}}
""", f"""<div class="hdw"><header class="hd"><span class="logo">{LOGO_GLYPH("#0f8a72","#47c0a6","#fff")}<span>Ясне вікно<small>Вікна у Києві · ціни онлайн</small></span></span><span class="cat dsk">☷ Послуги і ціни</span><nav class="nav dsk"><a>Райони</a><a>Блог</a><a>Майстрам</a></nav><span class="r"><span class="lang"><span class="on">UA</span><span>RU</span></span><a class="req">Заявка <i>0</i></a></span></header></div>
<div class="top"><div class="wrap hero"><div>
<h1>Вікна в Києві — <span>з цінами одразу</span></h1>
<p class="lead">Заміна, ремонт, склопакети і балкони. Порахуйте вартість онлайн — заявку отримає один майстер з вільним графіком.</p>
<div class="search"><span>Наприклад: двостулкове 130 × 140</span><b>Порахувати</b></div>
<div class="hint dsk">Часто шукають:<u>регулювання</u><u>склопакет після вибуху</u><u>балкон під ключ</u></div>
</div><div class="side"><a class="tel"><i>{phone_icon("#fff",22)}</i><span><small>Диспетчер, щодня 8:00–21:00</small><b>{PHONE}</b></span></a><p>Відповімо, підкажемо майстра у вашому районі. Для вас безкоштовно.</p></div></div></div>
<div class="wrap sec"><div class="sh"><h2>Послуги з цінами</h2><a>Усі ціни →</a></div>
<div class="chips"><span>Заміна <b>8</b></span><span>Ремонт <b>6</b></span><span>Склопакети <b>3</b></span><span>Балкони <b>4</b></span><span>Після обстрілу <b>2</b></span><span>Приватний будинок <b>5</b></span></div>
<div class="cards">{''.join(f'<div class="c"><div class="ill" style="background:{bg}">{win(k,"#121a22","#0f8a72",72,2)}</div><div class="b"><h3>{t}</h3><div class="p"><b>{p}</b><i>+</i></div></div></div>' for k,bg,t,p in CARDS)}</div></div>""")

# ---------------------------------------------------------------- 6. ПІКТОГРАМИ
TILES = [("single","Одностулкове"),("double","Двостулкове"),("triple","Тристулкове"),("balcony","Балкон"),("glass","Склопакет"),("repair","Ремонт"),("house","Будинок"),("therm","Енергозбер."),("shield","Після обстрілу")]
D["6"] = ("Піктограми", fonts("rubik:800","rubik:900","manrope:500","manrope:700","manrope:800"), """
body{color:#fff;font:500 16px/1.5 Manrope,sans-serif;background:#2c43e8}
.bgc{position:fixed;inset:0;background:radial-gradient(60% 50% at 90% 0%,#4e63ff 0,transparent 60%),radial-gradient(40% 40% at 0% 100%,#1f33c9 0,transparent 60%),#2c43e8}
.bgc::after{content:"";position:absolute;width:900px;height:900px;border-radius:50%;border:60px solid rgba(255,255,255,.05);right:-300px;top:200px}
.hd{position:relative;z-index:2;display:flex;align-items:center;gap:14px;background:#fff;color:#14205e;border-radius:999px;padding:8px 8px 8px 12px;margin-top:14px}
.logo{display:flex;align-items:center;gap:10px;font:800 18px Manrope}.logo small{display:block;font:500 12px Manrope;color:#5d6797}
.nav{display:flex;gap:20px;font:700 14.5px Manrope;margin-left:18px}
.r{margin-left:auto;display:flex;gap:6px;align-items:center}.r .l{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font:800 13px Manrope;background:#eef0ff;color:#2c43e8}.r .on{background:#2c43e8;color:#fff}
.req{background:#2c43e8;color:#fff;border-radius:999px;padding:10px 16px;font-weight:800;display:flex;gap:8px;align-items:center}
.hero{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:34px}
.k{display:block;font:700 15px Manrope;opacity:.9}
h1{margin:12px 0 14px;font:900 64px/.98 Rubik;letter-spacing:-.025em;max-width:7.6em}
.lead{margin:0 0 20px;font-size:18px;color:#dfe3ff;max-width:46ch}.lead b{color:#fff}
.badge{position:absolute;border-radius:50%;display:grid;place-items:center;text-align:center;font:800 13px/1.05 Manrope;transform:rotate(-10deg)}
.b1{width:120px;height:120px;background:#fff;color:#2c43e8;border:3px dashed #2c43e8;outline:6px solid #fff;right:-74px;top:-24px;z-index:3}.b1 b{font:900 30px Rubik;display:block}
.b2{width:104px;height:104px;background:#ff9f2e;color:#1b1600;border:3px dashed rgba(0,0,0,.35);outline:5px solid #ff9f2e;right:-46px;top:118px;transform:rotate(8deg);z-index:3}.b2 b{font:900 30px Rubik;display:block}
.search{display:flex;align-items:center;gap:10px;background:#fff;color:#7a83b3;border-radius:999px;padding:7px 7px 7px 18px;max-width:560px}.search span{flex:1}.search b{background:#14205e;color:#fff;border-radius:999px;padding:12px 20px}
.call{display:flex;gap:14px;align-items:center;background:#ff9f2e;color:#1b1600;border-radius:999px;padding:10px 26px 10px 10px;margin-top:12px;max-width:560px}.call i{width:52px;height:52px;border-radius:50%;background:#14205e;display:grid;place-items:center}.call small{display:block;font-size:14px;font-weight:700}.call b{font:900 28px Rubik}
.panel{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:30px;padding:18px;align-self:start}
.panel h3{margin:4px 6px 14px;font:800 16px Manrope;opacity:.9}
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.t{background:#fff;color:#14205e;border-radius:22px;padding:16px 8px 12px;display:grid;justify-items:center;gap:8px;font:800 14px Manrope;text-align:center;box-shadow:0 10px 0 -4px rgba(10,20,80,.25)}
@media(max-width:700px){.hero{grid-template-columns:minmax(0,1fr);margin-top:20px}.hero>div{min-width:0}.nav{display:none}h1{font-size:44px;max-width:8.6em}.logo small{display:none}.badge{position:static;display:inline-grid;margin:0 10px 14px 6px;vertical-align:top}.b1{width:92px;height:92px;outline-width:4px}.b1 b{font-size:22px}.b2{width:92px;height:92px;outline-width:4px}.b2 b{font-size:22px}.search,.call{max-width:100%}.panel{overflow:hidden}
.panel{background:none;border:0;padding:0}.tiles{grid-template-columns:repeat(9,108px);overflow:hidden}.call b{font-size:24px}.req span{display:none}}
""", f"""<div class="bgc"></div><div class="wrap"><header class="hd"><span class="logo">{LOGO_GLYPH("#2c43e8","#6f7fff","#fff")}<span>Ясне вікно<small>Київ · вікна без черги</small></span></span><nav class="nav dsk"><a>Послуги</a><a>Райони</a><a>Ціни</a><a>Блог</a></nav><span class="r"><span class="l on">UA</span><span class="l">RU</span><a class="req">▤ <span>Заявка</span></a></span></header>
<section class="hero"><div style="position:relative">
<div class="badge b1"><span>замір за<b>3–7</b>днів</span></div><div class="badge b2"><span>для вас<b>0 ₴</b></span></div>
<span class="k">Київ · заміна і ремонт вікон</span>
<h1>Вікна без черги на місяць</h1>
<p class="lead"><b>Порахуйте ціну за хвилину.</b> Майстер з вільним графіком зателефонує сам — у вашому районі.</p>
<div class="search"><span>Ширина × висота, см…</span><b>Порахувати</b></div>
<a class="call"><i>{phone_icon("#fff",24)}</i><span><small>Подзвонити диспетчеру</small><b>{PHONE}</b></span></a>
</div><div class="panel"><h3>Оберіть вікно або послугу</h3><div class="tiles">{''.join(f'<div class="t">{win(k,"#2c43e8","#ff9f2e",54,2.4)}<span>{n}</span></div>' for k,n in TILES)}</div></div></section></div>""")

for k,(name,fl,css,body) in D.items():
    html=f'<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{k} {name}</title>{fl}<style>{BASE}{css}</style></head><body>{body}</body></html>'
    open(os.path.join(OUT,f"d{k}.html"),"w",encoding="utf-8").write(html)
open(os.path.join(OUT,"names.txt"),"w",encoding="utf-8").write("\n".join(f"{k}|{v[0]}" for k,v in D.items()))
print("ok")
