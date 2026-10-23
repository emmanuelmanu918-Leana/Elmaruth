/* =====================================================
   CONFIGURATION : modifiez uniquement cet objet.
   ===================================================== */
const WEDDING_CONFIG = {
  dateISO: "2027-05-21T19:00:00",          // date et heure de début (heure locale)
  dateEnd: "2027-05-22T06:00:00",
  dateLong: "Vendredi 21 mai 2027",
  ville: "Kinshasa",
  lieuNom: "Salle des fêtes La Palmeraie",
  lieuAdresse: "177, Avenue Kabalo, Commune de Lingwala, Kinshasa",
  mapEmbedUrl: "https://www.google.com/maps?q=Salle+des+f%C3%AAtes+La+Palmeraie+Kinshasa&output=embed", // carte intégrée (sans clé API)
  mapQuery: "Salle des fêtes La Palmeraie Kinshasa",      // utilisé pour l'itinéraire
  rsvp: {
    mode: "whatsapp",                       // "whatsapp", "email" ou "endpoint" (ex. Formspree)
    whatsapp: "243986849252",               // 0986849252 au format international (sans + ni espaces)
    email: "contact@exemple.com",
    endpoint: ""                            // https://formspree.io/f/xxxx
  },
  histoire: [
    { date: "[date]", titre: "La rencontre", texte: "[Racontez ici votre première rencontre.]" },
    { date: "[date]", titre: "Le premier rendez-vous", texte: "[Un souvenir de votre premier rendez-vous.]" },
    { date: "[date]", titre: "La demande en mariage", texte: "[Et il a posé la question…]" }
  ],
  photos: [   // placez les fichiers dans /photos
    { src: "photos/photo-1.jpg", alt: "Emmanuel et Ruth souriants, côte à côte" },
    { src: "photos/photo-2.jpg", alt: "Ruth et Emmanuel se tenant la main" },
    { src: "photos/photo-3.jpg", alt: "Portrait du couple en tenue élégante" },
    { src: "photos/photo-4.jpg", alt: "Le couple riant lors d'une promenade" }
  ],
  programme: [
    { h: "19h00", t: "Accueil des invités", i: "i1" },
    { h: "20h00", t: "Cérémonie", i: "i2" },
    { h: "21h00", t: "Séance photos", i: "i3" },
    { h: "22h00", t: "Repas", i: "i1" },
    { h: "23h30", t: "Soirée dansante", i: "i2" },
    { h: "À l'aube", t: "Remerciements", i: "i3" }
  ],
  infosPratiques: ["Parking : [à préciser]", "Hébergement : [hôtels à proximité]", "Contact le jour J : [téléphone]"],
  dressText: "Tons crème, terracotta, brun et beige.",
  couleurs: [{ n: "Crème", c: "#F7F1E8" }, { n: "Terracotta", c: "#C4674A" }, { n: "Brun", c: "#4A2F23" }],
  cadeaux: {
    texte: "Votre présence est notre plus beau cadeau. Si vous souhaitez nous gâter, voici de quoi faire.",
    liens: [ /* { label: "Participer à la cagnotte", url: "https://..." } */ ],
    iban: ""                                // ex. "CD00 0000 0000 …" (laisser vide pour masquer)
  }
};

/* ===== Outils ===== */
const $ = (s, r = document) => r.querySelector(s);
const C = WEDDING_CONFIG;
document.documentElement.classList.add("js");
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = s => String(s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));

/* ===== Textes simples (data-c) ===== */
document.querySelectorAll("[data-c]").forEach(el => { const v = C[el.dataset.c]; if (v) el.textContent = v; });

/* ===== Sections générées ===== */
$("#timeline").innerHTML = C.histoire.map(e => `<li><time>${esc(e.date)}</time><h3>${esc(e.titre)}</h3><p>${esc(e.texte)}</p></li>`).join("");
$("#gallery").innerHTML = C.photos.map(p => `<figure><img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" decoding="async" onerror="this.remove()"></figure>`).join("");
$("#prog").innerHTML = C.programme.map(p => `<article class="card"><span class="ico ${p.i}"></span><div><div class="t">${esc(p.h)}</div><h3>${esc(p.t)}</h3></div></article>`).join("");
$("#practical").innerHTML = C.infosPratiques.map(i => `<li>${esc(i)}</li>`).join("");
$("#swatches").innerHTML = C.couleurs.map(c => `<li><i style="background:${esc(c.c)}"></i>${esc(c.n)}</li>`).join("");
$("#giftText").textContent = C.cadeaux.texte;
$("#giftLinks").innerHTML = C.cadeaux.liens.map(l => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("") +
  (C.cadeaux.iban ? `<button class="btn btn-ghost" id="ibanBtn" type="button">Copier l'IBAN</button>` : "");
const ib = $("#ibanBtn");
if (ib) ib.onclick = () => navigator.clipboard.writeText(C.cadeaux.iban).then(() => ib.textContent = "IBAN copié ✓");

/* ===== Carte & itinéraire (chargement différé) ===== */
$("#routeBtn").href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(C.mapQuery);
if (C.mapEmbedUrl) {
  new IntersectionObserver((e, o) => {
    if (e[0].isIntersecting) { $("#map").innerHTML = `<iframe src="${esc(C.mapEmbedUrl)}" title="Carte du lieu" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`; o.disconnect(); }
  }, { rootMargin: "300px" }).observe($("#map"));
} else $("#map").hidden = true;

/* ===== Fichier calendrier .ics ===== */
$("#icsBtn").onclick = () => {
  const f = d => d.replace(/[-:]/g, "");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mariage//FR", "BEGIN:VEVENT",
    "UID:mariage-emmanuel-ruth-2027@invitation", "DTSTAMP:" + f(new Date().toISOString().slice(0, 19)) + "Z",
    "DTSTART:" + f(C.dateISO), "DTEND:" + f(C.dateEnd),
    "SUMMARY:Mariage d'Emmanuel & Ruth", "LOCATION:" + C.lieuNom + ", " + C.lieuAdresse.replace(/,/g, "\\,"),
    "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "mariage-emmanuel-ruth.ics"; a.click();
};

/* ===== Compte à rebours ===== */
const cd = {}; document.querySelectorAll("[data-u]").forEach(e => cd[e.dataset.u] = e);
function tick() {
  let s = Math.max(0, Math.floor((new Date(C.dateISO) - Date.now()) / 1000));
  const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
  for (const k in v) cd[k].textContent = String(v[k]).padStart(2, "0");
}
tick(); setInterval(tick, 1000);

/* ===== Apparition de la frise au scroll ===== */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .2 });
document.querySelectorAll(".timeline li").forEach(li => io.observe(li));

/* ===== Bouton flottant (après le 1er écran, masqué sur la section RSVP) ===== */
const fab = $("#fab"); let past = false, inRsvp = false;
const upd = () => fab.classList.toggle("show", past && !inRsvp);
new IntersectionObserver(e => { past = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; upd(); }).observe($("#sentinel"));
new IntersectionObserver(e => { inRsvp = e[0].isIntersecting; upd(); }).observe($("#rsvp"));

/* ===== Enveloppe ===== */
const env = $("#envelope");
function closeEnv() { env.classList.add("done"); store.set("invitation-ouverte", "1"); setTimeout(() => env.hidden = true, 600); document.body.style.overflow = ""; }
if (store.get("invitation-ouverte")) env.hidden = true;
else {
  env.hidden = false; document.body.style.overflow = "hidden";
  $("#openBtn").onclick = () => { env.classList.add("open"); setTimeout(closeEnv, reduced ? 0 : 1500); };
  $("#skipBtn").onclick = closeEnv;
  $("#openBtn").focus();
}

/* ===== RSVP ===== */
$("#rsvpForm").addEventListener("submit", async ev => {
  ev.preventDefault();
  const f = ev.target, d = Object.fromEntries(new FormData(f)), err = $("#formErr");
  if (!d.nom.trim()) { err.textContent = "Merci d'indiquer votre nom."; f.nom.focus(); return; }
  err.textContent = "";
  const msg = `RSVP mariage Emmanuel & Ruth\nNom : ${d.nom}\nPrésence : ${d.presence}\nPersonnes : ${d.nb}\nRégime : ${d.regime || "-"}\nMessage : ${d.message || "-"}`;
  const R = C.rsvp;
  try {
    if (R.mode === "endpoint" && R.endpoint) {
      const r = await fetch(R.endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) });
      if (!r.ok) throw 0;
    } else if (R.mode === "email") location.href = `mailto:${R.email}?subject=${encodeURIComponent("RSVP – " + d.nom)}&body=${encodeURIComponent(msg)}`;
    else window.open(`https://wa.me/${R.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  } catch (e) { err.textContent = "L'envoi a échoué. Vérifiez votre connexion et réessayez."; return; }
  f.hidden = true; $("#rsvpOk").hidden = false; $("#rsvpOk").scrollIntoView({ block: "center" });
});
