# Affichette A5 imprimable (vitrine et caisse) avec un QR code vers la page de commande de gâteaux.
#   npm run affichette   (pip install segno ; Chrome installé)
# Produit print/qr-commander.svg, print/affichette-a5.html et print/affichette-a5.pdf.
import json, pathlib, subprocess, segno

ROOT = pathlib.Path(__file__).resolve().parent.parent
site = json.loads((ROOT / "data/site.json").read_text(encoding="utf-8"))
url = site["url"] + "/fr/commander"
qr = segno.make(url, error="m")
qr.save(ROOT / "print/qr-commander.svg", scale=10, border=0, dark="#4A2C21", light=None)
logo = (ROOT / "public/logo.svg").read_text(encoding="utf-8")
fonts = (ROOT / "app/fonts").as_uri()

html = f"""<!doctype html><html lang="fr" translate="no"><head><meta charset="utf-8"><meta name="google" content="notranslate"><title>Affichette A5 – Commander un gâteau</title>
<style>
@font-face{{font-family:"Cormorant Garamond";src:url({fonts}/cormorant-garamond-latin-500-normal.woff2)}}
@font-face{{font-family:Cormorant;src:url({fonts}/cormorant-garamond-latin-500-normal.woff2)}}
@font-face{{font-family:Cormorant;font-style:italic;src:url({fonts}/cormorant-garamond-latin-500-italic.woff2)}}
@font-face{{font-family:Jost;font-weight:400;src:url({fonts}/jost-latin-400-normal.woff2)}}
@font-face{{font-family:Jost;font-weight:500;src:url({fonts}/jost-latin-500-normal.woff2)}}
@page{{size:148mm 210mm;margin:0}}
*{{box-sizing:border-box;margin:0}}
body{{width:148mm;height:210mm;background:#FBF6EC;color:#4A2C21;font-family:Jost,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.page{{position:relative;height:100%;padding:13mm 13mm 11mm;display:flex;flex-direction:column;align-items:center;text-align:center}}
.frame{{position:absolute;inset:6mm;border:0.3mm solid #B8975A}}
.logo svg{{width:104mm;height:auto}}
.rule{{width:16mm;height:0.3mm;background:#B8975A;margin:7mm auto}}
h1{{font-family:Cormorant,Georgia,serif;font-weight:500;font-size:31pt;line-height:1.02;letter-spacing:-0.01em}}
.sub{{margin-top:4mm;font-size:10.5pt;line-height:1.5;color:#6B4E3D;max-width:100mm}}
.qr{{margin-top:7mm;padding:4mm;background:#fff;border:0.3mm solid #E8DCC6}}
.qr img{{width:44mm;height:44mm;display:block}}
.scan{{margin-top:3.5mm;font-size:8pt;letter-spacing:0.22em;text-transform:uppercase;font-weight:500;color:#A93A55}}
.award{{margin-top:7mm;font-family:Cormorant,Georgia,serif;font-style:italic;font-size:13pt;color:#8A5A2B}}
.foot{{margin-top:auto;font-size:9pt;line-height:1.6;color:#4A2C21}}
.foot b{{font-weight:500;font-size:11pt;letter-spacing:0.04em}}
.closed{{color:#A93A55;font-weight:500}}
.en{{margin-top:2mm;font-size:7.5pt;color:#6B4E3D}}
</style></head><body><div class="page"><div class="frame"></div>
<div class="logo">{logo}</div>
<div class="rule"></div>
<h1>Commandez<br>votre gâteau</h1>
<p class="sub">Anniversaires, entremets, pièces montées, galettes des rois, plateaux pour les bureaux. 48 h à l'avance, retrait en boutique, paiement sur place.</p>
<div class="qr"><img src="qr-commander.svg" alt=""></div>
<p class="scan">Scannez pour commander</p>
<p class="award">Meilleur éclair au chocolat d'Île-de-France 2025</p>
<div class="foot"><b>01 45 78 14 10</b><br>60 rue de la Convention, 75015 Paris<br>Tous les jours dès 7 h · <span class="closed">fermé le mercredi</span>
<p class="en">Order your cake online: scan the code · English version on the website</p></div>
</div></body></html>"""
(ROOT / "print/affichette-a5.html").write_text(html, encoding="utf-8")
chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", f"--print-to-pdf={ROOT / 'print/affichette-a5.pdf'}", (ROOT / "print/affichette-a5.html").as_uri()], check=True, capture_output=True)
print("print/affichette-a5.pdf prêt :", url)
