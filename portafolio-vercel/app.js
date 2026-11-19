/* Portafolio MUN: interacción
   Para publicar el video de la presentación, pega aquí el enlace (YouTube, Google Drive, etc.). */
const VIDEO_URL = "https://youtu.be/qWAgp-hDX3w";

(function () {
  "use strict";

  const fmt = (n, d = 0) => new Intl.NumberFormat("es-CO", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const $ = (id) => document.getElementById(id);
  const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- video ---------- */
  if (VIDEO_URL) {
    $("video-texto").innerHTML = 'Mira la presentación: <a href="' + VIDEO_URL + '" target="_blank" rel="noopener">abrir el video</a>.';
  }

  /* ---------- 100 personas ---------- */
  const rejilla = $("rejilla");
  const celdas = [];
  for (let i = 0; i < 100; i++) {
    const li = document.createElement("li");
    rejilla.appendChild(li);
    celdas.push(li);
  }
  let cubiertos = 0;
  let temporizadores = [];

  function pintar(destino) {
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
    const cambios = [];
    for (let i = 0; i < 100; i++) {
      const debeSerOk = i < destino;
      if (celdas[i].classList.contains("ok") !== debeSerOk) cambios.push(i);
    }
    cambios.forEach((i, k) => {
      const hacer = () => celdas[i].classList.toggle("ok", i < destino);
      if (reducirMovimiento) hacer();
      else temporizadores.push(setTimeout(hacer, destino > cubiertos ? k * 40 : 0));
    });
    cubiertos = destino;
  }

  const escenarios = {
    inicio: { n: 74, lectura: "74 de 100 en 2024", detalle: "Cada cuadro representa a 1 de cada 100 personas del mundo. Cifras redondeadas de OMS y UNICEF (2025)." },
    actual: { n: 78, lectura: "78 de 100 en 2030", detalle: "Si el avance sigue a 0,67 pp por año, como entre 2015 y 2024, solo se suman 4 cuadros en 6 años." },
    meta: { n: 100, lectura: "100 de 100 en 2030", detalle: "Llegar a todos exigiría 4,33 pp por año, unas 6,5 veces el ritmo actual." },
  };
  const botones = document.querySelectorAll("[data-cien]");
  function elegir(clave) {
    const e = escenarios[clave];
    pintar(e.n);
    $("cien-lectura").textContent = e.lectura;
    $("cien-detalle").textContent = e.detalle;
    botones.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cien === clave)));
  }
  botones.forEach((b) => b.addEventListener("click", () => elegir(b.dataset.cien)));
  // estado inicial sin animación
  for (let i = 0; i < 74; i++) celdas[i].classList.add("ok");
  cubiertos = 74;

  /* ---------- calculadora de ritmo ---------- */
  const rRitmo = $("r-ritmo");
  const svg = $("r-grafica");
  const NS = "http://www.w3.org/2000/svg";
  const X = (a) => 52 + (a - 2000) * (448 / 40);
  const Y = (c) => 230 - (c - 55) * (210 / 45);

  function el(nombre, attrs, texto) {
    const e = document.createElementNS(NS, nombre);
    Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k]));
    if (texto) e.textContent = texto;
    return e;
  }

  function actualizarRitmo() {
    const r = parseFloat(rRitmo.value);
    const cob2030 = Math.min(100, 74 + 6 * r);
    const anio100 = 2024 + 26 / r;
    $("r-ritmo-v").textContent = fmt(r, 2) + " pp/año";
    $("r-cob").textContent = fmt(cob2030, 1) + " %";
    $("r-anio").textContent = anio100 <= 2030 ? "2030 o antes" : "Hacia " + Math.round(anio100);
    $("r-veces").textContent = fmt(r / (2 / 3), 1) + " veces";
    const caja = $("r-aviso-caja");
    caja.hidden = false;
    caja.classList.toggle("aviso", cob2030 < 100);
    $("r-aviso").textContent = cob2030 >= 100 ? "Se cumple" : "Faltan " + fmt(100 - cob2030, 1) + " pp";

    svg.textContent = "";
    [60, 70, 80, 90, 100].forEach((c) => {
      svg.appendChild(el("line", { x1: 52, x2: 500, y1: Y(c), y2: Y(c), class: "eje" }));
      svg.appendChild(el("text", { x: 46, y: Y(c) + 4, "text-anchor": "end" }, c + " %"));
    });
    [2000, 2010, 2020, 2030, 2040].forEach((a) => svg.appendChild(el("text", { x: X(a), y: 250, "text-anchor": "middle" }, String(a))));
    svg.appendChild(el("line", { x1: X(2030), x2: X(2030), y1: 20, y2: 230, class: "eje", "stroke-dasharray": "2 4" }));

    svg.appendChild(el("polyline", { class: "real", points: [[2000, 61.3], [2015, 68], [2024, 74]].map((p) => X(p[0]) + "," + Y(p[1])).join(" ") }));
    const finAnio = Math.min(2040, anio100);
    const finCob = Math.min(100, 74 + r * (finAnio - 2024));
    svg.appendChild(el("line", { class: "proy", x1: X(2024), y1: Y(74), x2: X(finAnio), y2: Y(finCob) }));
    [[2000, 61.3], [2015, 68], [2024, 74]].forEach((p) => svg.appendChild(el("circle", { class: "punto", cx: X(p[0]), cy: Y(p[1]), r: 5 })));
    svg.appendChild(el("circle", { class: "fin", cx: X(finAnio), cy: Y(finCob), r: 5 }));
    const etiqueta = finAnio < 2040 && finCob >= 100 ? "100 % hacia " + Math.round(anio100) : fmt(Math.min(100, 74 + r * (2040 - 2024)), 1) + " % en 2040";
    const anclaFin = X(finAnio) > 380 ? "end" : "start";
    svg.appendChild(el("text", { x: X(finAnio) + (anclaFin === "end" ? -10 : 10), y: Y(finCob) - 10, "text-anchor": anclaFin }, etiqueta));
  }
  rRitmo.addEventListener("input", actualizarRitmo);
  actualizarRitmo();

  /* ---------- calculadora de cisterna ---------- */
  const c = {};
  ["personas", "litros", "area", "lluvia", "coef", "dias", "radio"].forEach((k) => (c[k] = $("c-" + k)));
  function actualizarCisterna() {
    const n = +c.personas.value, lpd = +c.litros.value, A = +c.area.value, P = +c.lluvia.value, C = +c.coef.value, dias = +c.dias.value, r = +c.radio.value;
    $("c-personas-v").textContent = fmt(n);
    $("c-litros-v").textContent = fmt(lpd) + " L";
    $("c-area-v").textContent = fmt(A) + " m²";
    $("c-lluvia-v").textContent = fmt(P) + " mm";
    $("c-coef-v").textContent = fmt(C, 2);
    $("c-dias-v").textContent = fmt(dias) + " días";
    $("c-radio-v").textContent = fmt(r, 2) + " m";

    const captado = (A * P * C) / 1000;           // m³/año (1 mm sobre 1 m² = 1 L)
    const demanda = (n * lpd * 365) / 1000;        // m³/año
    const cobertura = captado / demanda;
    const areaNec = demanda / ((P / 1000) * C);    // m²
    const tanque = (n * lpd * dias) / 1000;        // m³
    const altura = tanque / (Math.PI * r * r);     // m

    $("c-cap").textContent = fmt(captado, 1) + " m³";
    $("c-dem").textContent = fmt(demanda, 1) + " m³";
    $("c-cob").textContent = fmt(cobertura * 100, 0) + " %";
    $("c-areanec").textContent = fmt(areaNec, 0) + " m²";
    $("c-tanque").textContent = fmt(tanque, 1) + " m³";
    $("c-altura").textContent = fmt(altura, 2) + " m";
  }
  Object.keys(c).forEach((k) => c[k].addEventListener("input", actualizarCisterna));
  actualizarCisterna();

  /* ---------- calculadora binomial ---------- */
  const bn = $("b-n"), bp = $("b-p");
  function actualizarBinomial() {
    const n = +bn.value, p = +bp.value / 100, q = 1 - p;
    $("b-n-v").textContent = fmt(n);
    $("b-p-v").textContent = fmt(+bp.value, 1) + " %";
    // pmf por recurrencia: P(k+1) = P(k) * (n-k)/(k+1) * p/q
    let pk = Math.pow(q, n), acum012 = 0;
    const p0 = pk;
    for (let k = 0; k <= 2; k++) {
      acum012 += pk;
      pk = pk * ((n - k) / (k + 1)) * (p / q);
    }
    $("b-e").textContent = fmt(n * p, 2);
    $("b-s").textContent = fmt(Math.sqrt(n * p * q), 2);
    $("b-p0").textContent = fmt(p0 * 100, 1) + " %";
    $("b-p1").textContent = fmt((1 - p0) * 100, 1) + " %";
    $("b-p3").textContent = fmt(Math.max(0, 1 - acum012) * 100, 1) + " %";
  }
  bn.addEventListener("input", actualizarBinomial);
  bp.addEventListener("input", actualizarBinomial);
  actualizarBinomial();

  /* ---------- regla de nivel y progreso ---------- */
  const enlaces = Array.from(document.querySelectorAll(".regla a"));
  const secciones = enlaces.map((a) => document.querySelector(a.getAttribute("href")));
  const pista = $("pista");
  const barra = $("progreso");

  function progreso() {
    const alto = document.documentElement.scrollHeight - window.innerHeight;
    const p = alto > 0 ? Math.min(100, Math.max(0, (window.scrollY / alto) * 100)) : 0;
    barra.style.setProperty("--p", p + "%");
    if (pista) pista.style.setProperty("--p", p + "%");
    // sección activa: la última cuyo borde superior ya pasó 35 % de la ventana
    let activa = 0;
    secciones.forEach((s, i) => { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.35) activa = i; });
    enlaces.forEach((a, i) => a.setAttribute("aria-current", String(i === activa)));
  }
  window.addEventListener("scroll", progreso, { passive: true });
  window.addEventListener("resize", progreso);
  progreso();
})();
