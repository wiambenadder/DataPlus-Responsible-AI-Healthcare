(function () {
  "use strict";

  const screens = Array.from(document.querySelectorAll("[data-screen]"));
  const navLinks = Array.from(document.querySelectorAll("[data-route]"));
  const menuButton = document.getElementById("menu-button");
  const primaryNavigation = document.getElementById("primary-navigation");
  const drawer = document.getElementById("analysis-drawer");
  const drawerBackdrop = document.getElementById("drawer-backdrop");
  const drawerClose = document.getElementById("drawer-close");
  const drawerBack = document.getElementById("drawer-back");
  const viewer = document.getElementById("document-viewer");
  const viewerBackdrop = document.getElementById("viewer-backdrop");
  const viewerClose = document.getElementById("viewer-close");
  let drawerReturnFocus = null;
  let viewerReturnFocus = null;
  let repositoryCategory = "governance";
  let repositorySort = "newest";

  const assessments = {
    ai: [
      ["National AI Health Strategy & Governance", "In Formulation / Draft", "yellow", "Design", "Draft strategy exists; implementation roadmap and governance structure are still developing.", "Development", "Limited resources and technical expertise for development and testing."],
      ["Dedicated Health AI Ethics & Review Committees", "Formalized / Binding", "green", "Design", "Ethical guidelines are aligned with international standards.", "Deployment", "Active review of AI health projects and systems."],
      ["Clinical Algorithm Validation & Local Evidence Rules", "No Dedicated Policy", "gray", "Design", "No specific validation framework or local evidence requirements in this demo.", "Development", "Limited capacity for algorithm testing and local data generation."],
      ["Health Data Access & Algorithmic Training Clearances", "Formalized / Binding", "green", "Design", "A legal framework for data access and protection is represented.", "Deployment", "Operational data access mechanisms and audit trails."],
      ["AI Liability, Transparency & Adverse Event Auditing", "In Formulation / Draft", "yellow", "Design", "Draft regulations on AI liability and transparency are under review.", "Deployment", "No full-scale auditing system represented yet."]
    ],
    baseline: [
      ["Medical Device & Software as a Medical Device (SaMD) Classification Pathways", "Formalized / Binding", "green", "Operational guidance", "Class I–III device classification with local review; SaMD pathways aligned with international standards.", "Key operators", "Rwanda FDA; Ministry of Health."],
      ["Personal Data Protection & Health Privacy Baselines", "Formalized / Binding", "green", "Operational guidance", "Apply health data-specific safeguards and consent requirements.", "Key operators", "NCSA; Ministry of Health; RDB."],
      ["Electronic Health Record & Clinical Data Interoperability Standards", "Formalized / Binding", "green", "Operational guidance", "Use HL7 FHIR and open standards; support data exchange between facilities.", "Timeline", "Phased implementation, 2024–2027."],
      ["General Medical Software Registration & Post-Market Surveillance", "Baseline Applies / Extension", "purple", "Operational guidance", "Register software with Rwanda FDA and implement post-market surveillance.", "Timeline", "In force, with periodic review."],
      ["Institutional Healthcare Cybersecurity & Breach Notification Mandates", "Formalized / Binding", "green", "Operational guidance", "Implement cybersecurity frameworks and maintain incident response plans.", "Key operators", "NCSA; Ministry of Health; healthcare institutions."]
    ]
  };

  const documents = [
    { country: "Rwanda", code: "RWA", flag: "rwanda-flag", year: 2024, date: "2024 · Oct 26", tags: ["governance", "software", "validation"], title: "National Guidelines for the Validation and Certification of Software as a Medical Device (SaMD)", local: "Amabwiriza y’Igihugu yo Kwemeza Porogaramu z’Ubuvuzi", agency: "Rwanda Food and Drugs Authority (Rwanda FDA)" },
    { country: "Rwanda", code: "RWA", flag: "rwanda-flag", year: 2023, date: "2023 · Mar 15", tags: ["governance", "privacy"], title: "National Health Data Protection and Privacy Regulations", local: "Amabwiriza y’Igihugu ku Kurinda Amakuru y’Ubuzima", agency: "Rwanda Data Protection Authority" },
    { country: "Rwanda", code: "RWA", flag: "rwanda-flag", year: 2022, date: "2022 · Nov 08", tags: ["governance", "software"], title: "Medical Device Regulatory Framework", local: "Itegeko rigena ibikoresho by’ubuvuzi", agency: "Rwanda FDA" },
    { country: "Rwanda", code: "RWA", flag: "rwanda-flag", year: 2021, date: "2021 · Jun 30", tags: ["governance", "cybersecurity"], title: "National Cybersecurity Strategy for Health Information Systems", local: "Ingamba za Komisiyo y’Umutekano wa Mucyo ku Makuru y’Ubuzima", agency: "National Cyber Security Authority" },
    { country: "Kenya", code: "KEN", flag: "kenya-flag", date: "2022 · Nov 08", title: "Medical Device Regulatory Framework", local: "Mfumo wa Udhibiti wa Vifaa vya Matibabu", agency: "Kenya Medical Devices Authority" },
    { country: "Mexico", code: "MEX", flag: "mexico-flag", date: "2023 · Mar 15", title: "National Health Data Protection and Privacy Regulations", local: "Reglamento nacional de protección de datos de salud", agency: "Federal Commission for Data Protection" },
    { country: "South Africa", code: "ZAF", flag: "south-africa-flag", date: "2021 · Jun 30", title: "National Cybersecurity Strategy for Health Information Systems", local: "National policy instrument", agency: "Department of Health" },
    { country: "Colombia", code: "COL", flag: "colombia-flag", date: "2020 · Dec 12", title: "AI Liability and Accountability in Healthcare", local: "Responsabilidad de la IA en la atención médica", agency: "Ministry of Health and Social Protection" }
  ];

  function assessmentRow(item, index, level) {
    const [title, status, statusClass, label1, detail1, label2, detail2] = item;
    const sourceLabel = level === "baseline" ? "Read Baseline Decree" : "View Supporting Source";
    return `<article class="assessment-row"><span class="row-number">${index + 1}</span><div class="assessment-title"><span aria-hidden="true">${["▤", "✚", "◉", "▦", "◇"][index]}</span><div><strong>${title}</strong><span class="status ${statusClass}">● ${status}</span></div></div><div class="assessment-detail"><b>${label1}:</b><span>${detail1}</span><b>${label2}:</b><span>${detail2}</span></div><button class="source-button" type="button">▤ ${sourceLabel} <span aria-hidden="true">→</span></button></article>`;
  }

  function documentRow(doc, compact) {
    if (compact) {
      return `<article class="search-result"><div class="result-country"><span class="flag ${doc.flag}" aria-hidden="true"></span><div><strong>${doc.code}</strong><small>${doc.country}</small></div></div><div><small>${doc.date}</small><h2>${doc.title}</h2><p>${doc.local}</p><p>▥ ${doc.agency}</p><div class="policy-badges"><span>⚙ Operational</span><span>● Implementation</span><span>▤ Normative</span></div></div><button class="open-drawer" type="button">Open Analysis Drawer <span aria-hidden="true">→</span></button></article>`;
    }
    return `<article class="repository-row"><div><strong>${doc.date}</strong><small>Publication date</small></div><div><h3>${doc.title}</h3><p>${doc.local}</p><p>▥ ${doc.agency}</p></div><div><div class="policy-badges"><span>● Operational</span><span>⚙ Implementation</span><span>▤ Normative</span></div><p><strong>Key developer takeaways:</strong> Review the analysis drawer for sample codebook content.</p></div><button class="open-drawer" type="button">Open Analysis Drawer <span aria-hidden="true">→</span></button></article>`;
  }

  function renderAssessments(level) {
    document.getElementById("assessment-list").innerHTML = assessments[level].map((item, index) => assessmentRow(item, index, level)).join("");
  }

  function renderRepository(query = "") {
    const normalized = query.trim().toLowerCase();
    const filtered = documents.filter((doc) => doc.country === "Rwanda" && doc.tags.includes(repositoryCategory) && `${doc.title} ${doc.local} ${doc.agency}`.toLowerCase().includes(normalized)).sort((a, b) => repositorySort === "newest" ? b.year - a.year : a.year - b.year);
    document.getElementById("repository-list").innerHTML = filtered.length ? filtered.map((doc) => documentRow(doc, false)).join("") : `<div class="empty-state">No sample documents match that search.</div>`;
    bindDrawerButtons();
  }

  function activeCountries() {
    const checked = Array.from(document.querySelectorAll("[data-filter]:checked")).map((input) => input.dataset.filter);
    if (checked.length === 0 || checked.includes("Other")) return null;
    return checked;
  }

  function renderSearch() {
    const query = document.getElementById("global-search").value.trim().toLowerCase();
    const countries = activeCountries();
    const filtered = documents.filter((doc) => {
      const countryMatch = !countries || countries.includes(doc.country);
      const queryMatch = `${doc.country} ${doc.code} ${doc.title} ${doc.local} ${doc.agency}`.toLowerCase().includes(query);
      return countryMatch && queryMatch;
    }).slice(0, 6);
    document.getElementById("result-count").textContent = `Showing ${filtered.length} sample instrument${filtered.length === 1 ? "" : "s"}`;
    document.getElementById("search-results").innerHTML = filtered.length ? filtered.map((doc) => documentRow(doc, true)).join("") : `<div class="empty-state"><strong>No sample instruments found.</strong><p>Try clearing the filters or using a broader keyword.</p></div>`;
    bindDrawerButtons();
  }

  function setCountryView(view) {
    const repository = view === "repository";
    document.getElementById("summary-panel").hidden = repository;
    document.getElementById("repository-panel").hidden = !repository;
    document.getElementById("summary-tab").setAttribute("aria-selected", String(!repository));
    document.getElementById("repository-tab").setAttribute("aria-selected", String(repository));
    if (view === "ai" || view === "baseline") {
      document.querySelectorAll("[data-level]").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.level === view)));
      renderAssessments(view);
    }
    if (repository) renderRepository();
  }

  function routeFromHash() {
    const raw = window.location.hash.replace(/^#/, "") || "map";
    if (raw.startsWith("country-")) return { screen: "country", countryView: raw.replace("country-", "") };
    return { screen: ["about", "map", "search"].includes(raw) ? raw : "about" };
  }

  function renderRoute() {
    closeViewer();
    closeDrawer();
    const route = routeFromHash();
    screens.forEach((screen) => { screen.hidden = screen.dataset.screen !== route.screen; });
    navLinks.forEach((link) => link.classList.toggle("active", link.dataset.route === route.screen || (route.screen === "country" && link.dataset.route === "map")));
    if (route.screen === "country") setCountryView(["ai", "baseline", "repository"].includes(route.countryView) ? route.countryView : "ai");
    if (route.screen === "search") renderSearch();
    primaryNavigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    window.scrollTo(0, 0);
  }

  function go(destination) {
    const hashes = { about: "about", map: "map", search: "search", "country-ai": "country-ai", "country-baseline": "country-baseline", "country-repository": "country-repository" };
    window.location.hash = hashes[destination] || "about";
  }

  function openDrawer(event) {
    drawerReturnFocus = event.currentTarget;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    drawerBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    drawerClose.focus();
  }

  function closeDrawer() {
    if (!drawer.classList.contains("open")) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    drawerBackdrop.hidden = true;
    document.body.style.overflow = "";
    if (drawerReturnFocus) drawerReturnFocus.focus();
  }

  function openViewer(event) {
    viewerReturnFocus = event.currentTarget;
    viewer.hidden = false;
    viewerBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    viewerClose.focus();
  }

  function closeViewer() {
    if (viewer.hidden) return;
    viewer.hidden = true;
    viewerBackdrop.hidden = true;
    if (!drawer.classList.contains("open")) document.body.style.overflow = "";
    if (viewerReturnFocus) viewerReturnFocus.focus();
  }

  function bindDrawerButtons() {
    document.querySelectorAll(".open-drawer").forEach((button) => {
      button.removeEventListener("click", openDrawer);
      button.addEventListener("click", openDrawer);
    });
  }

  document.addEventListener("click", (event) => {
    const goButton = event.target.closest("[data-go]");
    if (goButton) go(goButton.dataset.go);
    const sourceButton = event.target.closest(".source-button");
    if (sourceButton) openViewer({ currentTarget: sourceButton });
  });

  document.querySelectorAll("[data-country-view]").forEach((button) => button.addEventListener("click", () => go(button.dataset.countryView === "repository" ? "country-repository" : "country-ai")));
  document.querySelectorAll("[data-level]").forEach((button) => button.addEventListener("click", () => go(button.dataset.level === "baseline" ? "country-baseline" : "country-ai")));
  document.getElementById("repository-search").addEventListener("input", (event) => renderRepository(event.target.value));
  document.getElementById("repository-sort").addEventListener("change", (event) => { repositorySort = event.target.value; renderRepository(document.getElementById("repository-search").value); });
  document.querySelectorAll("[data-category]").forEach((button) => button.addEventListener("click", () => {
    repositoryCategory = button.dataset.category;
    document.querySelectorAll("[data-category]").forEach((item) => item.classList.toggle("selected", item === button));
    renderRepository(document.getElementById("repository-search").value);
  }));
  document.getElementById("global-search").addEventListener("input", renderSearch);
  document.querySelectorAll("[data-filter]").forEach((checkbox) => checkbox.addEventListener("change", renderSearch));
  document.getElementById("clear-filters").addEventListener("click", () => {
    document.querySelectorAll(".filter-panel input[type='checkbox']").forEach((input) => { input.checked = false; });
    document.getElementById("global-search").value = "";
    renderSearch();
  });
  menuButton.addEventListener("click", () => {
    const open = primaryNavigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  document.getElementById("rwanda-marker").addEventListener("click", () => go("country-ai"));
  drawerClose.addEventListener("click", closeDrawer);
  drawerBack.addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);
  document.querySelectorAll(".source-button, .analysis-table button, .drawer-body > .button").forEach((button) => button.addEventListener("click", openViewer));
  viewerClose.addEventListener("click", closeViewer);
  viewerBackdrop.addEventListener("click", closeViewer);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { if (!viewer.hidden) closeViewer(); else closeDrawer(); } });
  window.addEventListener("hashchange", renderRoute);

  renderAssessments("ai");
  renderRepository();
  renderSearch();
  renderRoute();
})();
