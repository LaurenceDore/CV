(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const chapters = $$('.chap');
  const done = new Set();

  // 1. Suivi de progression (comme un LMS) : un chapitre est "vu" quand il est lu à l'écran
  function markDone(id) {
    if (done.has(id)) return;
    done.add(id);
    const link = $(`#nav a[data-ch="${id}"]`);
    if (link) link.classList.add('done');
    const pct = Math.round((done.size / chapters.length) * 100);
    $('#bar').style.width = pct + '%';
    $('.progress').setAttribute('aria-valuenow', pct);
    if (id === 'langues') $('.langs').classList.add('on');
  }
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.id !== "quiz" && markDone(e.target.id)), { threshold: 0.35 });
  chapters.forEach(c => io.observe(c));

  // 2. Mode « coulisses » : révèle les techniques de digital learning utilisées dans ce CV
  const btn = $('#backstageBtn');
  btn.addEventListener('click', () => {
    const on = document.body.classList.toggle('backstage');
    btn.setAttribute('aria-pressed', on);
    btn.textContent = on ? 'Masquer les coulisses' : 'Voir les coulisses';
  });

  // 3. Accordéon : tout ouvrir / tout fermer
  const toggleAll = $('#toggleAll');
  toggleAll.addEventListener('click', () => {
    const open = toggleAll.textContent === 'Tout ouvrir';
    $$('.exp').forEach(d => (d.open = open));
    toggleAll.textContent = open ? 'Tout fermer' : 'Tout ouvrir';
  });

  // 4. Compétences cliquables avec compteur
  $$('.chips button').forEach(b => b.addEventListener('click', () => {
    b.classList.toggle('seen');
    $('#skillCount').textContent = `${$$('.chips .seen').length} / ${$$('.chips button').length} compétences vues`;
  }));

  // 5. Quiz avec feedback immédiat, score et certificat
  const questions = [
    { q: "Dans quel établissement Laurence a-t-elle été ingénieure pédagogique de fév. 2022 à juil. 2023 ?",
      o: ["INALCO", "Université de Lille", "HEI"], a: 0 },
    { q: "Quelle suite utilise-t-elle pour développer des modules e-learning interactifs ?",
      o: ["Suite Articulate (Storyline, Rise)", "Camtasia", "Genially"], a: 0 },
    { q: "Sur quelle plateforme LMS a-t-elle un niveau d'administration expert ?",
      o: ["Fun EDX", "Moodle", "BigBlueButton"], a: 1 }
  ];
  let i = 0, score = 0;
  const box = $('#quizBox');

  function showQ() {
    const { q, o, a } = questions[i];
    box.innerHTML = `<p class="hint">Question ${i + 1} / ${questions.length}</p><p class="q-title">${q}</p>` +
      o.map((t, k) => `<button class="opt" data-k="${k}">${t}</button>`).join('') +
      `<p class="fb" aria-live="polite"></p>`;
    $$('.opt', box).forEach(b => b.addEventListener('click', () => {
      const k = +b.dataset.k;
      $$('.opt', box).forEach(x => (x.disabled = true));
      $$('.opt', box)[a].classList.add('ok');
      if (k === a) { score++; $('.fb', box).textContent = 'Bonne réponse !'; }
      else { b.classList.add('ko'); $('.fb', box).textContent = 'Pas tout à fait : la bonne réponse est en vert.'; }
      const n = document.createElement('button');
      n.className = 'next';
      n.textContent = i < questions.length - 1 ? 'Question suivante' : 'Voir mon résultat';
      n.addEventListener('click', () => { i++; i < questions.length ? showQ() : end(); });
      box.appendChild(n);
      n.focus();
    }));
  }

  function end() {
    box.innerHTML = `<p class="q-title">Score : ${score} / ${questions.length}</p><button class="next" id="retry">Recommencer le quiz</button>`;
    $('#retry').addEventListener('click', () => { i = 0; score = 0; $('#cert').hidden = true; showQ(); });
    markDone('quiz');
    const c = $('#cert');
    c.hidden = false;
    c.innerHTML = `<h3>🏅 Parcours terminé</h3><p>Vous avez parcouru le CV de Laurence Doremus.<br>Pour échanger : <a href="mailto:laurence.doremus84@gmail.com">laurence.doremus84@gmail.com</a> · <a href="tel:0648151559">06 48 15 15 59</a></p>`;
  }
  showQ();
})();
