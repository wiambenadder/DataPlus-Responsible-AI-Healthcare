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
  const viewerSubtitle = document.getElementById("viewer-subtitle");
  const viewerPages = document.getElementById("viewer-pages");
  const documentPage = document.getElementById("document-page");
  const zoomValue = document.getElementById("zoom-value");
  const countryFlag = document.getElementById("country-flag");
  let drawerReturnFocus = null;
  let viewerReturnFocus = null;
  let repositoryCategory = "governance";
  let repositorySort = "newest";
  let currentViewerPage = 14;
  let viewerZoom = 100;
  let currentCountry = "Rwanda";
  let currentDocument = null;

  // Portable v0.3.2 keeps the v0.3 interaction model and illustrative content.
  const countryDemos = {
    Rwanda: {
      code: "RWA", flag: "rwanda-flag", updated: "24 October 2026", population: "14.1M", income: "Low income", spending: "6.8%", internet: "34.5%",
      agencies: ["Ministry of Health", "Rwanda FDA", "National Cyber Security Authority"],
      assessments: {
        ai: [
          ["National AI Health Strategy & Governance", "In Formulation / Draft", "yellow", "Design", "Draft strategy exists; implementation roadmap and governance structure are still developing.", "Development", "Limited resources and technical expertise for development and testing.", "rwa-samd-2024"],
          ["Dedicated Health AI Ethics & Review Committees", "Formalized / Binding", "green", "Design", "Ethical guidelines are aligned with international standards.", "Deployment", "Active review of AI health projects and systems.", "rwa-privacy-2023"],
          ["Clinical Algorithm Validation & Local Evidence Rules", "No Dedicated Policy", "gray", "Design", "No specific validation framework or local evidence requirements in this demo.", "Development", "Limited capacity for algorithm testing and local data generation.", "rwa-samd-2024"],
          ["Health Data Access & Algorithmic Training Clearances", "Formalized / Binding", "green", "Design", "A legal framework for data access and protection is represented.", "Deployment", "Operational access mechanisms and audit trails.", "rwa-privacy-2023"],
          ["AI Liability, Transparency & Adverse Event Auditing", "In Formulation / Draft", "yellow", "Design", "Draft regulations on AI liability and transparency are under review.", "Deployment", "No full-scale auditing system represented yet.", "rwa-device-2022"]
        ],
        baseline: [
          ["Medical Device & Software as a Medical Device (SaMD) Classification Pathways", "Formalized / Binding", "green", "Operational guidance", "Class I–III device classification with local review; SaMD pathways aligned with international standards.", "Key operators", "Rwanda FDA; Ministry of Health.", "rwa-samd-2024"],
          ["Personal Data Protection & Health Privacy Baselines", "Formalized / Binding", "green", "Operational guidance", "Apply health data-specific safeguards and consent requirements.", "Key operators", "NCSA; Ministry of Health; RDB.", "rwa-privacy-2023"],
          ["Electronic Health Record & Clinical Data Interoperability Standards", "Formalized / Binding", "green", "Operational guidance", "Use open standards and support data exchange between facilities.", "Timeline", "Phased implementation, 2024–2027.", "rwa-device-2022"],
          ["General Medical Software Registration & Post-Market Surveillance", "Baseline Applies / Extension", "purple", "Operational guidance", "Register software and implement post-market surveillance.", "Timeline", "In force, with periodic review.", "rwa-samd-2024"],
          ["Institutional Healthcare Cybersecurity & Breach Notification Mandates", "Formalized / Binding", "green", "Operational guidance", "Implement cybersecurity and incident response plans.", "Key operators", "NCSA; Ministry of Health; healthcare institutions.", "rwa-cyber-2021"]
        ]
      }
    },
    Mexico: {
      code: "MEX", flag: "mexico-flag", updated: "10 November 2026", population: "Illustrative", income: "Upper middle income", spending: "Illustrative", internet: "Illustrative",
      agencies: ["Secretariat of Health (illustrative)", "Federal Health Products Authority (illustrative)", "National Data Protection Institute (illustrative)"],
      assessments: {
        ai: [
          ["National AI Health Strategy & Governance", "In Formulation / Draft", "yellow", "Design", "A sample national direction for responsible public-health AI is represented.", "Deployment", "Detailed implementation roles remain illustrative and incomplete.", "mex-ai-health-2022"],
          ["Dedicated Health AI Ethics & Review Committees", "Baseline Applies / Extension", "purple", "Design", "Existing research and clinical-review structures are extended to AI in this demo.", "Deployment", "No single nationwide AI-health committee is represented.", "mex-ai-health-2022"],
          ["Clinical Algorithm Validation & Local Evidence Rules", "In Formulation / Draft", "yellow", "Design", "The sample guidance requests intended-use, risk and performance evidence.", "Development", "Local representativeness expectations are described as emerging guidance.", "mex-samd-2024"],
          ["Health Data Access & Algorithmic Training Clearances", "Formalized / Binding", "green", "Design", "The illustrative privacy instrument covers purpose, consent and safeguards.", "Deployment", "Secondary-use documentation and access controls are represented.", "mex-privacy-2023"],
          ["AI Liability, Transparency & Adverse Event Auditing", "No Dedicated Policy", "gray", "Design", "The demo includes incident reporting but no dedicated AI-liability regime.", "Deployment", "Independent algorithmic audit requirements are not represented.", "mex-cyber-2021"]
        ],
        baseline: [
          ["Medical Device & Software as a Medical Device (SaMD) Classification Pathways", "In Formulation / Draft", "yellow", "Operational guidance", "A sample risk-based pathway for AI-enabled medical software is represented.", "Key operators", "Federal health-products authority and Secretariat of Health (illustrative).", "mex-samd-2024"],
          ["Personal Data Protection & Health Privacy Baselines", "Formalized / Binding", "green", "Operational guidance", "Apply purpose, consent, security and accountability safeguards.", "Key operators", "National data-protection institute and health-sector controllers (illustrative).", "mex-privacy-2023"],
          ["Electronic Health Record & Clinical Data Interoperability Standards", "Baseline Applies / Extension", "purple", "Operational guidance", "Existing digital-health standards are assumed to apply to AI integrations.", "Timeline", "No AI-specific national timeline is represented.", "mex-ai-health-2022"],
          ["General Medical Software Registration & Post-Market Surveillance", "In Formulation / Draft", "yellow", "Operational guidance", "Submit technical evidence and plan performance monitoring after deployment.", "Timeline", "Illustrative staged implementation beginning in 2024.", "mex-samd-2024"],
          ["Institutional Healthcare Cybersecurity & Breach Notification Mandates", "Formalized / Binding", "green", "Operational guidance", "Maintain access controls, incident response and continuity plans.", "Key operators", "Digital-health operators and health institutions (illustrative).", "mex-cyber-2021"]
        ]
      }
    }
  };

  const documents = [
    { id: "rwa-samd-2024", country: "Rwanda", code: "RWA", flag: "rwanda-flag", year: 2024, date: "2024 · Oct 26", decree: "No. 004/2024/FDA", tags: ["governance", "software", "validation"], title: "National Guidelines for the Validation and Certification of Software as a Medical Device (SaMD)", local: "Amabwiriza y’Igihugu yo Kwemeza Porogaramu z’Ubuvuzi", agency: "Rwanda Food and Drugs Authority (Rwanda FDA)", summary: "Illustrative technical guidance for validating and certifying software as a medical device.", findings: [["Local Clinical Validation Mandates", 3, "Actionable", "Validation of representative local clinical trials is required prior to market authorization.", 14, "Article 4.2"], ["Algorithmic Bias & Representative Datasets", 1, "Aspirational", "Ensure dataset validation to mitigate bias in AI models and algorithms.", 18, "Article 5.1"], ["Adverse Event & Model Drift Reporting", 2, "Voluntary", "Adverse event oversight and model drift monitoring shall be established.", 22, "Article 7.3"]] },
    { id: "rwa-privacy-2023", country: "Rwanda", code: "RWA", flag: "rwanda-flag", year: 2023, date: "2023 · Mar 15", decree: "Demo privacy instrument", tags: ["governance", "privacy"], title: "National Health Data Protection and Privacy Regulations", local: "Amabwiriza y’Igihugu ku Kurinda Amakuru y’Ubuzima", agency: "Rwanda Data Protection Authority", summary: "Illustrative privacy rules for health information.", findings: [["Health-data safeguards", 2, "Operational", "Health-data safeguards and access controls should be documented.", 9, "Article 3.1"]] },
    { id: "rwa-device-2022", country: "Rwanda", code: "RWA", flag: "rwanda-flag", year: 2022, date: "2022 · Nov 08", decree: "Demo device framework", tags: ["governance", "software"], title: "Medical Device Regulatory Framework", local: "Itegeko rigena ibikoresho by’ubuvuzi", agency: "Rwanda FDA", summary: "Illustrative registration and monitoring rules for medical devices.", findings: [["Device registration", 3, "Actionable", "Medical software shall follow the applicable registration pathway.", 12, "Article 6"]] },
    { id: "rwa-cyber-2021", country: "Rwanda", code: "RWA", flag: "rwanda-flag", year: 2021, date: "2021 · Jun 30", decree: "Demo cybersecurity strategy", tags: ["governance", "cybersecurity"], title: "National Cybersecurity Strategy for Health Information Systems", local: "Ingamba z’Umutekano ku Makuru y’Ubuzima", agency: "National Cyber Security Authority", summary: "Illustrative cybersecurity expectations for connected health systems.", findings: [["Incident response", 2, "Voluntary", "Health institutions should maintain an incident-response plan.", 20, "Section 8"]] },
    { country: "Kenya", code: "KEN", flag: "kenya-flag", date: "2022 · Nov 08", title: "Medical Device Regulatory Framework", local: "Mfumo wa Udhibiti wa Vifaa vya Matibabu", agency: "Kenya Medical Devices Authority" },
    { id: "mex-samd-2024", country: "Mexico", code: "MEX", flag: "mexico-flag", year: 2024, date: "2024 · Aug 12", decree: "Demo No. MEX-SAMD-2024", tags: ["governance", "software", "validation"], title: "Technical Guidance for AI-Enabled Software as a Medical Device", local: "Guía técnica para software como dispositivo médico habilitado por inteligencia artificial", agency: "Federal Health Products Authority (illustrative)", summary: "Illustrative Mexico-specific guidance for risk classification, technical evidence and lifecycle monitoring of AI-enabled medical software.", findings: [["Risk Classification for AI-Enabled Medical Software", 3, "Actionable", "El expediente técnico deberá describir el nivel de riesgo, el uso previsto y las medidas de control del software médico.", 11, "Article 5.3"], ["Health-Data Consent and Secondary Use", 2, "Operational", "El tratamiento secundario de datos de salud deberá documentar su finalidad y las salvaguardas aplicables.", 16, "Article 8.1"], ["Performance Monitoring After Deployment", 2, "Voluntary", "Los responsables podrán establecer revisiones periódicas del desempeño y mecanismos de notificación de incidentes.", 24, "Article 12.4"]] },
    { id: "mex-privacy-2023", country: "Mexico", code: "MEX", flag: "mexico-flag", year: 2023, date: "2023 · Mar 15", decree: "Demo privacy regulation", tags: ["governance", "privacy"], title: "National Health Data Protection and Privacy Regulations", local: "Reglamento nacional de protección de datos de salud", agency: "National Institute for Transparency and Data Protection (illustrative)", summary: "Illustrative Mexico-specific safeguards for health-data access, processing and accountability.", findings: [["Secondary Use of Health Data", 2, "Operational", "El tratamiento secundario deberá documentar su finalidad y salvaguardas.", 16, "Article 8.1"]] },
    { id: "mex-ai-health-2022", country: "Mexico", code: "MEX", flag: "mexico-flag", year: 2022, date: "2022 · Sep 05", decree: "Demo national strategy", tags: ["governance", "validation"], title: "National Strategy for Responsible AI in Public Health", local: "Estrategia nacional para la inteligencia artificial responsable en salud pública", agency: "Secretariat of Health (illustrative)", summary: "Illustrative strategic direction for ethics review, representative evaluation and accountable public-sector use of health AI.", findings: [["Responsible Public-Sector AI", 1, "Aspirational", "Las instituciones promoverán una evaluación responsable y representativa de los sistemas de inteligencia artificial.", 8, "Section 3"]] },
    { id: "mex-cyber-2021", country: "Mexico", code: "MEX", flag: "mexico-flag", year: 2021, date: "2021 · Apr 19", decree: "Demo digital-health standard", tags: ["privacy", "cybersecurity"], title: "Cybersecurity and Incident Response Standard for Digital Health Services", local: "Norma de ciberseguridad y respuesta a incidentes para servicios de salud digital", agency: "National Digital Health Directorate (illustrative)", summary: "Illustrative access-control, breach-response and service-continuity safeguards for digital health services.", findings: [["Incident Response", 3, "Actionable", "Los operadores deberán mantener procedimientos documentados de respuesta y continuidad.", 19, "Article 10"]] },
    { country: "South Africa", code: "ZAF", flag: "south-africa-flag", date: "2021 · Jun 30", title: "National Cybersecurity Strategy for Health Information Systems", local: "National policy instrument", agency: "Department of Health" },
    { country: "Colombia", code: "COL", flag: "colombia-flag", date: "2020 · Dec 12", title: "AI Liability and Accountability in Healthcare", local: "Responsabilidad de la IA en la atención médica", agency: "Ministry of Health and Social Protection" }
  ];

  function assessmentRow(item, index, level) {
    const [title, status, statusClass, label1, detail1, label2, detail2, sourceId] = item;
    const sourceLabel = level === "baseline" ? "Read Baseline Decree" : "View Supporting Source";
    return `<article class="assessment-row"><span class="row-number">${index + 1}</span><div class="assessment-title"><span aria-hidden="true">${["▤", "✚", "◉", "▦", "◇"][index]}</span><div><strong>${title}</strong><span class="status ${statusClass}">● ${status}</span></div></div><div class="assessment-detail"><b>${label1}:</b><span>${detail1}</span><b>${label2}:</b><span>${detail2}</span></div><button class="source-button" type="button" data-document-id="${sourceId}">▤ ${sourceLabel} <span aria-hidden="true">→</span></button></article>`;
  }

  function documentRow(doc, compact) {
    if (compact) {
      return `<article class="search-result"><div class="result-country"><span class="flag ${doc.flag}" aria-hidden="true"></span><div><strong>${doc.code}</strong><small>${doc.country}</small></div></div><div><small>${doc.date}</small><h2>${doc.title}</h2><p>${doc.local}</p><p>▥ ${doc.agency}</p><div class="policy-badges"><span>⚙ Operational</span><span>● Implementation</span><span>▤ Normative</span></div></div><button class="open-drawer" type="button" data-document-id="${doc.id || ""}">Open Analysis Drawer <span aria-hidden="true">→</span></button></article>`;
    }
    return `<article class="repository-row"><div><strong>${doc.date}</strong><small>Publication date</small></div><div><h3>${doc.title}</h3><p>${doc.local}</p><p>▥ ${doc.agency}</p></div><div><div class="policy-badges"><span>● Operational</span><span>⚙ Implementation</span><span>▤ Normative</span></div><p><strong>Key developer takeaways:</strong> Review the analysis drawer for sample codebook content.</p></div><button class="open-drawer" type="button" data-document-id="${doc.id}">Open Analysis Drawer <span aria-hidden="true">→</span></button></article>`;
  }

  function renderAssessments(level) {
    document.getElementById("assessment-list").innerHTML = countryDemos[currentCountry].assessments[level].map((item, index) => assessmentRow(item, index, level)).join("");
  }

  function renderRepository(query = "") {
    const normalized = query.trim().toLowerCase();
    const filtered = documents.filter((doc) => doc.country === currentCountry && doc.tags && doc.tags.includes(repositoryCategory) && `${doc.title} ${doc.local} ${doc.agency}`.toLowerCase().includes(normalized)).sort((a, b) => repositorySort === "newest" ? b.year - a.year : a.year - b.year);
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
    });
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

  function renderCountryHeader() {
    const country = countryDemos[currentCountry];
    countryFlag.className = `flag ${country.flag} large`;
    document.getElementById("country-title").textContent = currentCountry;
    document.getElementById("country-iso").textContent = `ISO: ${country.code}`;
    document.getElementById("country-updated").textContent = `◷ Last updated: ${country.updated}`;
    document.getElementById("country-agencies").innerHTML = country.agencies.map((agency) => `<span>▥ ${agency}</span>`).join("");
    document.getElementById("country-population").textContent = country.population;
    document.getElementById("country-income").textContent = country.income;
    document.getElementById("country-health-spending").textContent = country.spending;
    document.getElementById("country-internet").textContent = country.internet;
    const countryDocuments = documents.filter((doc) => doc.country === currentCountry && doc.id);
    document.getElementById("country-document-count").textContent = `${countryDocuments.length} documents`;
    document.getElementById("country-section-tabs").setAttribute("aria-label", `${currentCountry} policy sections`);
  }

  function routeFromHash() {
    const raw = window.location.hash.replace(/^#/, "") || "about";
    if (raw.startsWith("country-")) {
      const parts = raw.split("-");
      const country = parts[1] === "mex" ? "Mexico" : "Rwanda";
      return { screen: "country", country, countryView: parts.slice(2).join("-") || "ai" };
    }
    return { screen: ["about", "map", "search"].includes(raw) ? raw : "about" };
  }

  function renderRoute() {
    closeViewer();
    closeDrawer();
    const route = routeFromHash();
    screens.forEach((screen) => { screen.hidden = screen.dataset.screen !== route.screen; });
    navLinks.forEach((link) => link.classList.toggle("active", link.dataset.route === route.screen || (route.screen === "country" && link.dataset.route === "map")));
    if (route.screen === "country") {
      currentCountry = route.country;
      renderCountryHeader();
      setCountryView(["ai", "baseline", "repository"].includes(route.countryView) ? route.countryView : "ai");
    }
    if (route.screen === "search") renderSearch();
    primaryNavigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    window.scrollTo(0, 0);
  }

  function go(destination) {
    const prefix = currentCountry === "Mexico" ? "country-mex" : "country-rwa";
    const hashes = { about: "about", map: "map", search: "search", "country-ai": `${prefix}-ai`, "country-baseline": `${prefix}-baseline`, "country-repository": `${prefix}-repository` };
    window.location.hash = hashes[destination] || "about";
  }

  function openDrawer(event) {
    drawerReturnFocus = event.currentTarget;
    const documentId = event.currentTarget.dataset.documentId;
    currentDocument = documents.find((doc) => doc.id === documentId) || documents.find((doc) => doc.country === currentCountry && doc.id);
    if (!currentDocument) return;
    renderDrawer(currentDocument);
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    drawerBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    drawerClose.focus();
  }

  function renderDrawer(doc) {
    const findings = doc.findings || [];
    document.getElementById("drawer-title").textContent = doc.title;
    document.getElementById("drawer-local-title").textContent = doc.local;
    document.getElementById("drawer-year").textContent = doc.year || "Illustrative";
    document.getElementById("drawer-agency").textContent = doc.agency;
    document.getElementById("drawer-decree").textContent = doc.decree || "Not provided";
    document.getElementById("drawer-summary").textContent = doc.summary || "Illustrative sample record for interface testing.";
    document.querySelector(".drawer-body > .button").dataset.viewerPage = String(findings.find((finding) => finding[4])?.[4] || 1);
    document.getElementById("analysis-table-body").innerHTML = findings.length ? findings.map((finding) => {
      const [subdomain, depth, label, excerpt, page, article] = finding;
      return `<tr><td>${subdomain}</td><td><span class="rating level${depth}">Level ${depth}: ${label}</span></td><td><em>“${excerpt}”</em></td><td>${page ? `<button type="button" data-viewer-page="${page}">Page ${page}${article ? ` · ${article}` : ""} →</button>` : "N/A"}</td></tr>`;
    }).join("") : `<tr><td colspan="4">Illustrative analysis is not available for this sample instrument.</td></tr>`;
    document.getElementById("viewer-document-title").textContent = doc.title;
    document.getElementById("viewer-document-meta").textContent = `${doc.agency} · ${doc.year || "Illustrative"}`;
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
    const pageMatch = event.currentTarget.textContent.match(/Page\s+(\d+)/i);
    setViewerPage(Number(event.currentTarget.dataset.viewerPage || (pageMatch && pageMatch[1]) || 14));
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

  function setViewerPage(page) {
    currentViewerPage = page;
    const findings = currentDocument?.findings || [];
    const citationFinding = findings.find((finding) => finding[4] === page);
    const citation = citationFinding ? { heading: citationFinding[0], excerpt: citationFinding[3], article: citationFinding[5] } : null;
    const citedPages = findings.map((finding) => finding[4]).filter(Boolean);
    const viewerPageNumbers = Array.from(new Set(citedPages.flatMap((value) => [value - 1, value, value + 1]))).filter((value) => value > 0).sort((a, b) => a - b);
    viewerSubtitle.textContent = `Illustrative passage preview · Page ${page}`;
    viewerPages.innerHTML = viewerPageNumbers.map((value) => `<button type="button" class="viewer-page${value === page ? " selected" : ""}" data-page="${value}">Page ${value}${citedPages.includes(value) ? `<span>${value === page ? "Current citation" : "Citation"}</span>` : ""}</button>`).join("");
    documentPage.setAttribute("aria-label", `Illustrative document page ${page}`);
    const doc = currentDocument || documents.find((item) => item.id === "rwa-samd-2024");
    documentPage.innerHTML = `<div class="document-letterhead"><span class="flag ${doc.flag}" aria-hidden="true"></span><div><strong>${doc.agency}</strong><small>${doc.country} · Illustrative policy guidance</small></div></div><p class="page-number">${page}</p><h2>${citation ? citation.heading : "Supporting policy context"}</h2><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. This placeholder page demonstrates how an official policy document will appear beside its coded analysis.</p>${citation ? `<p class="highlighted-passage"><mark>${citation.excerpt}</mark> The highlighted passage is the illustrative source used in the analysis drawer.</p><p><strong>${citation.article || "Illustrative citation"}</strong> · Cited page ${page}</p>` : `<div class="highlighted-passage"><strong>Context page</strong><p>This adjacent page demonstrates continuous navigation around a cited passage.</p></div>`}<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Policy authors may describe scope, evidence expectations, responsible institutions, and implementation timelines in this section.</p><h3>Implementation considerations</h3><p>The production viewer can replace this text with OCR or verified document content while preserving page numbers, highlights, and source references.</p><p class="prototype-stamp">ILLUSTRATIVE PROTOTYPE PAGE · NOT AN OFFICIAL DOCUMENT</p>`;
  }

  function setViewerZoom(nextZoom) {
    viewerZoom = Math.max(80, Math.min(130, nextZoom));
    documentPage.style.width = "100%";
    documentPage.style.maxWidth = `${720 * viewerZoom / 100}px`;
    zoomValue.textContent = `${viewerZoom}%`;
  }

  function bindDrawerButtons() {
    document.querySelectorAll(".open-drawer").forEach((button) => {
      button.removeEventListener("click", openDrawer);
      button.addEventListener("click", openDrawer);
    });
  }

  document.addEventListener("click", (event) => {
    const goButton = event.target.closest("[data-go]");
    if (goButton) {
      if (goButton.dataset.country) currentCountry = goButton.dataset.country;
      go(goButton.dataset.go);
    }
    const sourceButton = event.target.closest(".source-button");
    if (sourceButton) openDrawer({ currentTarget: sourceButton });
    const viewerPage = event.target.closest(".viewer-page");
    if (viewerPage) setViewerPage(Number(viewerPage.dataset.page));
    const citedPage = event.target.closest("[data-viewer-page]");
    if (citedPage && !citedPage.classList.contains("viewer-page")) openViewer({ currentTarget: citedPage });
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
  document.getElementById("rwanda-marker").addEventListener("click", () => { currentCountry = "Rwanda"; go("country-ai"); });
  document.getElementById("mexico-marker").addEventListener("click", () => { currentCountry = "Mexico"; go("country-ai"); });
  drawerClose.addEventListener("click", closeDrawer);
  drawerBack.addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);
  viewerClose.addEventListener("click", closeViewer);
  viewerBackdrop.addEventListener("click", closeViewer);
  document.getElementById("zoom-out").addEventListener("click", () => setViewerZoom(viewerZoom - 10));
  document.getElementById("zoom-in").addEventListener("click", () => setViewerZoom(viewerZoom + 10));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { if (!viewer.hidden) closeViewer(); else closeDrawer(); } });
  window.addEventListener("hashchange", renderRoute);

  currentDocument = documents.find((doc) => doc.id === "rwa-samd-2024");
  renderDrawer(currentDocument);
  renderAssessments("ai");
  renderRepository();
  renderSearch();
  setViewerPage(currentViewerPage);
  renderRoute();
})();
