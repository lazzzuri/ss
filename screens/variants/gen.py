# Generates 6 hero design variants (first screen only) as standalone HTML for screenshots.
import os
OUT = os.path.dirname(os.path.abspath(__file__))
FS = "file:///home/user/ss/node_modules/@fontsource"
FONTS = "".join(f'<link rel="stylesheet" href="{FS}/{f}.css">' for f in [
  "onest/cyrillic-400","onest/latin-400","onest/cyrillic-500","onest/latin-500","onest/cyrillic-600","onest/latin-600",
  "unbounded/cyrillic-600","unbounded/latin-600","unbounded/cyrillic-700","unbounded/latin-700",
  "ibm-plex-mono/cyrillic-400","ibm-plex-mono/latin-400","ibm-plex-mono/cyrillic-500","ibm-plex-mono/latin-500"])

BASE = """
*,*::before,*::after{box-sizing:border-box}html,body{margin:0;height:100%}
body{font:400 16px/1.55 "Onest",system-ui,sans-serif;overflow:hidden}
.mono{font-family:"IBM Plex Mono",monospace,monospace;font-variant-numeric:tabular-nums}
.disp{font-family:"Unbounded",sans-serif}
.wrap{max-width:1200px;margin:0 auto;padding:0 16px;position:relative;z-index:2}
.hdr{display:flex;align-items:center;gap:18px;padding:10px 12px 10px 18px;border-radius:999px;margin-top:12px}
.logo{display:flex;align-items:center;gap:10px;font:700 15px/1 "Unbounded",sans-serif;white-space:nowrap}
.nav{display:flex;gap:4px;margin-left:8px}.nav a{padding:8px 12px;border-radius:999px;font-size:14.5px;text-decoration:none}
.hr{margin-left:auto;display:flex;gap:10px;align-items:center}
.lang{display:inline-flex;border-radius:999px;overflow:hidden;font:500 12.5px/1 "IBM Plex Mono",monospace,monospace}.lang span{padding:7px 10px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:12px 22px;border-radius:999px;font:600 15px/1 "Onest",sans-serif;text-decoration:none;white-space:nowrap;border:1px solid transparent}
.tag{font:500 12px/1 "IBM Plex Mono",monospace,monospace;letter-spacing:.14em;text-transform:uppercase}
"""

LOGO = """<svg width="26" height="26" viewBox="0 0 32 32"><rect x="3" y="3" width="26" height="26" rx="7" fill="url(#g)" stroke="currentColor" stroke-opacity=".8" stroke-width="1.4"/><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5fd0d8"/><stop offset="1" stop-color="#7c97ff" stop-opacity=".6"/></linearGradient></defs><path d="M16 3.8V28.2M3.8 13H28.2" stroke="currentColor" stroke-width="1.4"/><circle cx="25" cy="24" r="2.2" fill="#ffc94d"/></svg>"""

def header(cls="glass", cta="btn amber"):
    nav = "".join(f"<a>{x}</a>" for x in ["Послуги","Райони","Будинки","Ціни","Блог","Майстрам"])
    return f"""<div class="wrap"><header class="hdr {cls}"><span class="logo">{LOGO}ясне вікно</span><nav class="nav">{nav}</nav>
<div class="hr"><span class="lang"><span class="on">UA</span><span>RU</span></span><a class="{cta}">Розрахувати ціну</a></div></header></div>"""

def window_svg(stroke="#fff", fill="rgba(95,208,216,.18)", accent="#5fd0d8", w=96):
    return f"""<svg width="{w}" viewBox="0 0 120 120"><rect x="10" y="8" width="100" height="104" rx="3" fill="none" stroke="{stroke}" stroke-width="2"/>
<rect x="14" y="12" width="44" height="96" fill="{fill}" stroke="{stroke}" stroke-opacity=".7"/><rect x="62" y="12" width="44" height="96" fill="{fill}" stroke="{stroke}" stroke-opacity=".7"/>
<polyline points="62,12 106,60 62,108" fill="none" stroke="{accent}"/><polyline points="62,108 84,12 106,108" fill="none" stroke="{accent}" stroke-dasharray="3 2"/></svg>"""

H1 = "Заміна і ремонт вікон у Києві без черги на місяць"
LEAD = "Вкажіть розміри — і одразу побачите ціну. Ми передамо заявку майстру з вільним графіком, він зателефонує вам сам."

V = {}

# 1 — Night sky (current direction)
V["v1"] = None  # taken from the live site

# 2 — Morning glass (light, centered, quick-calc bar)
V["v2"] = ("""
body{color:#0f2233;background:#eaf2f8}
.bg{position:fixed;inset:0;background:radial-gradient(60% 60% at 15% 10%,#bfe3f2 0,transparent 60%),radial-gradient(50% 50% at 90% 20%,#ffe2c2 0,transparent 60%),radial-gradient(60% 60% at 60% 100%,#d7f0e6 0,transparent 60%),linear-gradient(180deg,#e8f1f8,#f7f2e9)}
.bg::after{content:"";position:absolute;inset:40px 120px 0;border:2px solid rgba(15,34,51,.06);border-bottom:0;border-radius:40px 40px 0 0;background:linear-gradient(90deg,transparent calc(50% - 1px),rgba(15,34,51,.06) calc(50% - 1px),rgba(15,34,51,.06) calc(50% + 1px),transparent calc(50% + 1px))}
.glass{background:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.85);backdrop-filter:blur(24px) saturate(150%);box-shadow:0 20px 50px -24px rgba(20,50,80,.35),inset 0 1px 0 #fff}
.nav a{color:#36506a}.lang{border:1px solid rgba(15,34,51,.15)}.lang .on{background:#0f2233;color:#fff}
.amber{background:#f2b705;color:#241a00}.dark{background:#0f2233;color:#fff}
.hero{position:relative;text-align:center;padding-top:70px;display:grid;justify-items:center;gap:22px}
.tag{color:#1d7f8c}
h1{margin:0;font:700 62px/1.04 "Unbounded",sans-serif;letter-spacing:-.02em;max-width:17ch}
.lead{font-size:19px;color:#3d566c;max-width:56ch;margin:0}
.bar{display:grid;grid-template-columns:1.4fr .8fr .8fr .7fr 1.4fr auto;gap:8px;align-items:stretch;padding:10px;border-radius:26px;width:min(1100px,100%);margin-top:14px;text-align:left}
.cell{padding:10px 14px;border-radius:16px;background:rgba(255,255,255,.6);border:1px solid rgba(15,34,51,.08);display:grid;gap:2px}
.cell small{font-size:12px;color:#5d7387}.cell b{font:500 17px/1.2 "IBM Plex Mono",monospace,monospace}
.cell.price{background:#0f2233;color:#fff;border:0}.cell.price small{color:#9fb7cc}.cell.price b{font:700 20px/1.2 "Unbounded",sans-serif}
.facts{display:flex;gap:10px;margin-top:6px}.facts span{padding:10px 16px;border-radius:999px;font-size:14px}
.facts b{font-weight:600}
""", header("glass", "btn dark") + f"""
<div class="bg"></div>
<section class="wrap hero">
<span class="tag">Київ · заміна і ремонт вікон</span>
<h1>{H1}</h1><p class="lead">{LEAD}</p>
<div class="bar glass">
 <div class="cell"><small>Тип вікна</small><b style="font-family:Onest">Двостулкове ▾</b></div>
 <div class="cell"><small>Ширина, см</small><b>130</b></div>
 <div class="cell"><small>Висота, см</small><b>140</b></div>
 <div class="cell"><small>Кількість</small><b>2</b></div>
 <div class="cell price"><small>Орієнтовно, з монтажем</small><b>24 900 – 31 800 ₴</b></div>
 <a class="btn amber" style="height:auto">Залишити заявку →</a>
</div>
<div class="facts"><span class="glass"><b>3–7 днів</b> до заміру</span><span class="glass"><b>Ціна одразу</b>, до виїзду</span><span class="glass"><b>0 ₴</b> для вас</span></div>
</section>""")

# 3 — The big window at sunset (hero is a 2x2 window)
V["v3"] = ("""
body{color:#fff;background:#2a0f3a}
.bg{position:fixed;inset:0;background:radial-gradient(30% 40% at 72% 62%,#ffd27a 0,#ff9a5a 30%,transparent 62%),linear-gradient(180deg,#241046 0%,#6b1f5c 45%,#d4574a 75%,#f39a4a 100%)}
.bg::after{content:"";position:absolute;left:0;right:0;bottom:0;height:180px;background:linear-gradient(180deg,transparent,rgba(20,6,30,.85));}
.glass{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);backdrop-filter:blur(18px) saturate(140%);box-shadow:inset 0 1px 0 rgba(255,255,255,.3)}
.nav a{color:rgba(255,255,255,.85)}.lang{border:1px solid rgba(255,255,255,.3)}.lang .on{background:rgba(255,255,255,.2)}
.amber{background:#ffc94d;color:#241a00}
.frame{position:relative;margin:26px auto 0;max-width:1200px;height:720px;border-radius:34px;padding:14px;background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.25));box-shadow:0 40px 90px -30px rgba(0,0,0,.6),inset 0 2px 0 #fff}
.panes{display:grid;grid-template-columns:1.35fr 1fr;grid-template-rows:1.35fr 1fr;gap:14px;height:100%}
.pane{border-radius:22px;padding:34px;position:relative;overflow:hidden}
.pane::before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.22) 0,transparent 30%,transparent 70%,rgba(255,255,255,.08) 100%);pointer-events:none}
.handle{position:absolute;left:calc(57.4% - 9px);top:46%;width:18px;height:70px;border-radius:9px;background:linear-gradient(180deg,#fff,#d9d4e4);box-shadow:0 6px 14px rgba(0,0,0,.35);z-index:3}
h1{margin:14px 0 16px;font:700 50px/1.05 "Unbounded",sans-serif;letter-spacing:-.015em}
.lead{margin:0;font-size:18px;color:rgba(255,255,255,.85);max-width:46ch}
.calc{display:grid;gap:12px}.row{display:flex;align-items:center;gap:14px}.row .v{font:500 15px/1.4 "IBM Plex Mono",monospace,monospace;color:#ffe9c6}
.price{font:700 30px/1.1 "Unbounded",sans-serif}.small{font-size:13px;color:rgba(255,255,255,.75)}
.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;height:100%;align-content:center}
.facts div{padding:16px;border-radius:16px;background:rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.18)}.facts b{display:block;font-size:20px}.facts span{font-size:13.5px;color:rgba(255,255,255,.8)}
.ctas{display:grid;align-content:center;gap:12px;height:100%}.ctas .btn{min-height:58px;font-size:17px}
.ghost{background:rgba(255,255,255,.14);color:#fff;border-color:rgba(255,255,255,.35)}
""", header("glass") + f"""
<div class="bg"></div>
<div class="wrap"><div class="frame"><div class="handle"></div><div class="panes">
 <div class="pane glass"><span class="tag" style="color:#ffd9a0">Київ · заміна і ремонт вікон</span><h1>{H1}</h1><p class="lead">{LEAD}</p></div>
 <div class="pane glass calc"><span class="tag" style="color:#ffd9a0">Ваш розрахунок</span>
  <div class="row">{window_svg('#fff','rgba(255,255,255,.18)','#ffd27a',84)}<div><div class="v">Вікно · 130 × 140 см · 2 шт</div><div class="v">Балкон · 200 × 210 см · 1 шт</div><div class="small">Стандарт · демонтаж · підвіконня</div></div></div>
  <div><div class="small">Орієнтовно</div><div class="price">46 800 – 59 900 ₴</div></div></div>
 <div class="pane glass"><div class="facts"><div><b>3–7 днів</b><span>до заміру</span></div><div><b>Ціна одразу</b><span>до виїзду майстра</span></div><div><b>0 ₴</b><span>для вас</span></div></div></div>
 <div class="pane glass"><div class="ctas"><a class="btn amber">Розрахувати ціну →</a><a class="btn ghost">Викликати майстра на ремонт</a></div></div>
</div></div></div>""")

# 4 — Rain on dark glass, giant type, service shortcuts
DROPS = ",".join(f"radial-gradient(circle at {x}% {y}%, rgba(255,255,255,.55) 0, rgba(255,255,255,.12) {r}px, transparent {r+1}px)" for x,y,r in [
 (8,18,3),(14,62,5),(22,30,2),(31,80,4),(37,12,3),(44,55,6),(52,26,2),(58,72,3),(63,40,4),(71,15,2),(77,66,5),(84,34,3),(90,82,2),(95,48,4),(5,88,3),(26,50,2),(48,90,3),(67,90,2),(88,10,3),(18,8,2)])
V["v4"] = ("""
body{color:#e9f6f8;background:#05080c}
.bg{position:fixed;inset:0;background:radial-gradient(40% 50% at 80% 30%,rgba(0,220,230,.28),transparent 60%),radial-gradient(40% 40% at 10% 90%,rgba(255,190,60,.18),transparent 60%),linear-gradient(180deg,#0b1218,#05080c)}
.glass{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(16px)}
.nav a{color:#9fb5bf}.lang{border:1px solid rgba(255,255,255,.15)}.lang .on{background:rgba(0,220,230,.2);color:#bff}
.amber{background:#ffc94d;color:#1d1500}
.sheet{position:relative;margin-top:22px;height:740px;border-radius:30px;padding:46px;display:grid;grid-template-columns:1.25fr .75fr;gap:30px;overflow:hidden;
 background:DROPS,linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(22px)}
.sheet::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(100deg,transparent 0 46px,rgba(255,255,255,.035) 46px 47px);pointer-events:none}
.big{font:700 150px/.86 "Unbounded",sans-serif;letter-spacing:-.04em;margin:18px 0 6px;color:#dffbff;text-shadow:0 0 30px rgba(0,220,230,.55),0 0 80px rgba(0,220,230,.25)}
.sub{font:600 40px/1.1 "Unbounded",sans-serif;margin:0 0 20px}
.lead{color:#a9c0c8;font-size:18px;max-width:50ch;margin:0 0 26px}
.tag{color:#46e3ec}
.side{display:grid;gap:14px;align-content:center}
.svc{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;padding:20px;border-radius:20px}
.svc i{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:rgba(0,220,230,.12);border:1px solid rgba(0,220,230,.35);font-style:normal;color:#46e3ec;font:500 16px "IBM Plex Mono",monospace}
.svc b{display:block;font-size:18px}.svc small{color:#8aa3ad}.svc .p{font:500 15px "IBM Plex Mono",monospace;color:#ffd27a;white-space:nowrap}
.ghost{background:rgba(255,255,255,.06);color:#e9f6f8;border-color:rgba(255,255,255,.2)}
""".replace("DROPS", DROPS), header("glass") + f"""
<div class="bg"></div>
<div class="wrap"><section class="sheet"><div>
 <span class="tag">Київ · заміна і ремонт вікон</span>
 <div class="big">ВІКНА</div><p class="sub">без черги на місяць</p>
 <p class="lead">{LEAD}</p>
 <div style="display:flex;gap:10px"><a class="btn amber">Розрахувати ціну</a><a class="btn ghost">Викликати майстра</a></div>
 <p class="mono" style="margin-top:34px;color:#7f99a3;font-size:13px">ЗАМІР 3–7 ДНІВ · ЦІНА ДО ВИЇЗДУ · 0 ₴ ДЛЯ ВАС</p>
</div><div class="side">
 <div class="svc glass"><i>01</i><div><b>Заміна вікон</b><small>з калькулятором ціни</small></div><span class="p">від 5 200 ₴/м²</span></div>
 <div class="svc glass"><i>02</i><div><b>Ремонт і регулювання</b><small>дме, не зачиняється</small></div><span class="p">від 250 ₴</span></div>
 <div class="svc glass"><i>03</i><div><b>Склопакети</b><small>тріснуте чи вибите скло</small></div><span class="p">від 2 800 ₴/м²</span></div>
 <div class="svc glass" style="border-color:rgba(255,140,110,.45)"><i style="color:#ff9b82;border-color:rgba(255,140,110,.45);background:rgba(255,140,110,.12)">!</i><div><b>Після обстрілу</b><small>першочергово</small></div><span class="p">→</span></div>
</div></section></div>""")

# 5 — Soft pastel mesh, minimal, centered pill input + floating glass tiles
V["v5"] = ("""
body{color:#1b2a2f;background:#f2efe9}
.bg{position:fixed;inset:0;background:radial-gradient(45% 55% at 20% 25%,#bfe9dc 0,transparent 60%),radial-gradient(40% 50% at 82% 30%,#ffd9c4 0,transparent 60%),radial-gradient(50% 50% at 50% 95%,#cfe2ff 0,transparent 60%),#f4f1ea}
.tile{position:fixed;border-radius:28px;background:rgba(255,255,255,.35);border:1px solid rgba(255,255,255,.8);backdrop-filter:blur(14px);box-shadow:0 30px 60px -30px rgba(30,60,70,.35),inset 0 1px 0 #fff}
.glass{background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.9);backdrop-filter:blur(20px) saturate(140%);box-shadow:0 18px 40px -24px rgba(30,60,70,.35),inset 0 1px 0 #fff}
.nav a{color:#4b5f66}.lang{border:1px solid rgba(27,42,47,.15)}.lang .on{background:#1b2a2f;color:#fff}
.amber{background:#1b2a2f;color:#fff}
.hero{position:relative;text-align:center;display:grid;justify-items:center;gap:20px;padding-top:96px}
.tag{color:#2f8a78}
h1{margin:0;font:600 66px/1.02 "Unbounded",sans-serif;letter-spacing:-.025em;max-width:15ch}
.lead{margin:0;color:#52656b;font-size:19px;max-width:52ch}
.pill{display:flex;align-items:center;gap:6px;padding:8px 8px 8px 24px;border-radius:999px;margin-top:14px;font-size:17px}
.pill .f{display:flex;align-items:baseline;gap:8px;padding:8px 14px;border-right:1px solid rgba(27,42,47,.1)}
.pill small{color:#7a8b90;font-size:13px}.pill b{font:500 20px "IBM Plex Mono",monospace}
.pill .go{background:#ffc94d;color:#241a00;margin-left:8px}
.chips{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;max-width:900px;margin-top:8px}.chips span{padding:9px 15px;border-radius:999px;font-size:14px}
""", header("glass", "btn amber") + f"""
<div class="bg"></div>
<div class="tile" style="width:220px;height:260px;left:70px;top:330px;transform:rotate(-8deg)"></div>
<div class="tile" style="width:150px;height:150px;right:120px;top:190px;transform:rotate(10deg)"></div>
<div class="tile" style="width:260px;height:200px;right:60px;top:560px;transform:rotate(-4deg)"></div>
<section class="wrap hero">
<span class="tag">Київ · заміна і ремонт вікон</span>
<h1>Вікна без черги на місяць</h1>
<p class="lead">{LEAD}</p>
<div class="pill glass"><span style="color:#52656b">Моє вікно</span>
 <span class="f"><small>ширина</small><b>130</b></span><span class="f"><small>висота</small><b>140</b></span><span class="f" style="border:0"><small>≈</small><b>12 600 ₴</b></span>
 <a class="btn go">Знайти майстра →</a></div>
<div class="chips">{''.join(f'<span class="glass">{x}</span>' for x in ['Оболонь','Троєщина','Позняки','Борщагівка','Виноградар','Печерськ','Лісовий','Теремки'])}</div>
</section>""")

# 6 — Kyiv at dusk: panel-block skyline with lit windows behind glass
import random
random.seed(7)
bld=[]; x=0
while x<1500:
    w=random.choice([70,90,110,130,150]); h=random.choice([160,200,240,280,330,380]); top=900-h
    bld.append(f'<rect x="{x}" y="{top}" width="{w}" height="{h}" fill="#0b1626"/>')
    for wy in range(top+14,900-10,20):
        for wx in range(x+8,x+w-10,16):
            if random.random()<0.22:
                c=random.choice(["#ffcf6b","#ffd98f","#ffe7b5","#9fd8ff"])
                bld.append(f'<rect x="{wx}" y="{wy}" width="8" height="10" fill="{c}" opacity="{random.choice([.6,.8,1])}"/>')
    x+=w+random.choice([4,8,14])
SKY='<svg class="city" viewBox="0 0 1500 900" preserveAspectRatio="xMidYMax slice">'+"".join(bld)+'</svg>'
V["v6"] = ("""
body{color:#f1f6fa;background:#0a1322}
.bg{position:fixed;inset:0;background:radial-gradient(60% 40% at 50% 100%,rgba(255,170,90,.55),transparent 70%),linear-gradient(180deg,#0e2140 0%,#2a3c66 45%,#a0627a 80%,#e39a6a 100%)}
.city{position:fixed;left:0;right:0;bottom:0;width:100%;height:62%}
.glass{background:rgba(10,20,36,.35);border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(20px) saturate(150%);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 30px 60px -30px rgba(0,0,0,.7)}
.nav a{color:#d5e0ea}.lang{border:1px solid rgba(255,255,255,.25)}.lang .on{background:rgba(255,255,255,.18)}
.amber{background:#ffc94d;color:#241a00}
.hero{display:grid;grid-template-columns:1.1fr .9fr;gap:24px;padding-top:44px;position:relative}
.copy{padding:40px;border-radius:28px;display:grid;gap:20px;align-content:start}
.tag{color:#ffd27a}
h1{margin:0;font:700 50px/1.06 "Unbounded",sans-serif;letter-spacing:-.015em}
.lead{margin:0;color:#d0dbe6;font-size:18px}
.stack{display:grid;gap:12px;align-content:start}
.card{display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center;padding:20px 22px;border-radius:22px}
.card b{display:block;font-size:18px}.card small{color:#b9c7d4}.card .p{font:500 15px "IBM Plex Mono",monospace;color:#ffd27a;white-space:nowrap}
.ghost{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.3)}
.facts{display:flex;gap:18px;color:#c9d6e2;font-size:14px}.facts b{color:#fff}
""", header("glass") + SKY + f"""
<div class="bg" style="z-index:-1"></div>
<section class="wrap hero"><div class="copy glass">
 <span class="tag">Київ · заміна і ремонт вікон</span><h1>{H1}</h1><p class="lead">{LEAD}</p>
 <div style="display:flex;gap:10px"><a class="btn amber">Розрахувати ціну</a><a class="btn ghost">Викликати майстра</a></div>
 <div class="facts"><span><b>3–7 днів</b> до заміру</span><span><b>Ціна</b> одразу</span><span><b>0 ₴</b> для вас</span></div>
</div><div class="stack">
 <div class="card glass">{window_svg('#fff','rgba(255,207,107,.2)','#ffd27a',56)}<div><b>Заміна вікон</b><small>калькулятор ціни онлайн</small></div><span class="p">від 5 200 ₴/м²</span></div>
 <div class="card glass">{window_svg('#fff','rgba(159,216,255,.2)','#9fd8ff',56)}<div><b>Ремонт і регулювання</b><small>дме, не зачиняється, ручка</small></div><span class="p">від 250 ₴</span></div>
 <div class="card glass">{window_svg('#fff','rgba(255,155,130,.22)','#ff9b82',56)}<div><b>Після обстрілу</b><small>першочергово, з порадами щодо «єВідновлення»</small></div><span class="p">→</span></div>
</div></section>""")

for k,v in V.items():
    if not v: continue
    css, body = v
    html = f"""<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">{FONTS}<style>{BASE}{css}</style></head><body>{body}</body></html>"""
    open(os.path.join(OUT, f"{k}.html"), "w", encoding="utf-8").write(html)
print("ok")
