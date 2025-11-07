// ======================
// ENKEL VIEW-HANTERING
// ======================
const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll("[data-view]");

function showView(id) {
  views.forEach((v) => v.classList.remove("active"));
  const view = document.getElementById(id);
  if (view) view.classList.add("active");

  // Stäng eventuella level-complete-fönster vid byte
  document.getElementById("timeline-complete").classList.add("hidden");
  document.getElementById("cause-complete").classList.add("hidden");
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-view");
    if (id) showView(id);
  });
});

// ======================
// DRAG-AND-DROP BAS
// ======================
let draggedCard = null;

function setupDragAndDrop(rootElement) {
  rootElement.addEventListener("dragstart", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    draggedCard = card;
    card.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", card.dataset.id || "");
  });

  rootElement.addEventListener("dragend", (e) => {
    const card = e.target.closest(".card");
    if (card) card.classList.remove("dragging");
    draggedCard = null;
  });

  rootElement.querySelectorAll("[data-dropzone], .dropzone, .timeline-slot").forEach(
    (zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        const target = e.currentTarget;
        if (!draggedCard) return;
        target.classList.add("hovered");
        e.dataTransfer.dropEffect = "move";
      });

      zone.addEventListener("dragleave", (e) => {
        e.currentTarget.classList.remove("hovered");
      });

      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        const target = e.currentTarget;
        target.classList.remove("hovered");
        if (!draggedCard) return;
        handleDrop(target, draggedCard);
        updateButtonsEnabled();
      });
    }
  );
}

// ======================
// TIDSLINJESPEL DATA
// ======================
const timelineEventsData = [
  // Amerikanska revolutionen (blå)
  {
    id: "e1763-war",
    text: "7-årskriget avslutas (1763)",
    year: 1763,
    revolution: "american",
  },
  {
    id: "e1765-stamp",
    text: "Stämpelskatten införs (1765)",
    year: 1765,
    revolution: "american",
  },
  {
    id: "e1773-boston",
    text: "Boston Tea Party (1773)",
    year: 1773,
    revolution: "american",
  },
  {
    id: "e1775-war",
    text: "Kriget mot Storbritannien inleds (1775)",
    year: 1775,
    revolution: "american",
  },
  {
    id: "e1776-declaration",
    text: "Självständighetsförklaringen (1776)",
    year: 1776,
    revolution: "american",
  },
  {
    id: "e1777-saratoga",
    text: "Slaget vid Saratoga (1777)",
    year: 1777,
    revolution: "american",
  },
  {
    id: "e1783-paris",
    text: "Parisfreden – USA erkänns (1783)",
    year: 1783,
    revolution: "american",
  },
  {
    id: "e1787-constitution",
    text: "USA:s konstitution antas (1787)",
    year: 1787,
    revolution: "american",
  },
  {
    id: "e1791-billofrights",
    text: "Bill of Rights antas (1791)",
    year: 1791,
    revolution: "american",
  },

  // Franska revolutionen (röd)
  {
    id: "f1788-crisis",
    text: "Finanskris i Frankrike (1788)",
    year: 1788,
    revolution: "french",
  },
  {
    id: "f1789-estates",
    text: "Generalständerna sammankallas (1789)",
    year: 1789,
    revolution: "french",
  },
  {
    id: "f1789-national",
    text: "Nationalförsamlingen bildas (1789)",
    year: 1789,
    revolution: "french",
  },
  {
    id: "f1789-bastille",
    text: "Stormningen av Bastiljen (1789)",
    year: 1789,
    revolution: "french",
  },
  {
    id: "f1789-rights",
    text: "Människans och medborgarens rättigheter antas (1789)",
    year: 1789,
    revolution: "french",
  },
  {
    id: "f1789-women",
    text: "Kvinnornas marsch till Versailles (1789)",
    year: 1789,
    revolution: "french",
  },
  {
    id: "f1793-terror",
    text: "Skräckväldet inleds (1793)",
    year: 1793,
    revolution: "french",
  },
  {
    id: "f1793-king",
    text: "Kungen avrättas (1793)",
    year: 1793,
    revolution: "french",
  },
  {
    id: "f1799-napoleon",
    text: "Napoleon tar makten (1799)",
    year: 1799,
    revolution: "french",
  },
];

// Sorterad lista med ids i korrekt kronologisk ordning
const orderedTimelineIds = [...timelineEventsData]
  .sort((a, b) => a.year - b.year || a.text.localeCompare(b.text))
  .map((e) => e.id);

// DOM-element tidslinje
const timelineCardBank = document.getElementById("timeline-card-bank");
const timelineSlotsContainer = document.getElementById("timeline-slots");
const timelineCheckBtn = document.getElementById("timeline-check-btn");
const timelineResetBtn = document.getElementById("timeline-reset-btn");
const timelineScore = document.getElementById("timeline-score");
const timelineComplete = document.getElementById("timeline-complete");

// Skapa slots
function createTimelineSlots() {
  timelineSlotsContainer.innerHTML = "";
  orderedTimelineIds.forEach((id, index) => {
    const slot = document.createElement("div");
    slot.className = "timeline-slot";
    slot.dataset.slotIndex = String(index);
    slot.setAttribute("data-dropzone", "timeline");
    slot.setAttribute("aria-label", "Tidslinjeplats");
    timelineSlotsContainer.appendChild(slot);
  });
}

// Skapa kort i banken
function createTimelineCards() {
  timelineCardBank.querySelectorAll(".card").forEach((c) => c.remove());

  const shuffled = [...timelineEventsData].sort(() => Math.random() - 0.5);

  shuffled.forEach((event) => {
    const card = document.createElement("div");
    card.className = `card event-card ${
      event.revolution === "american" ? "american-card" : "french-card"
    }`;
    card.draggable = true;
    card.textContent = event.text;
    card.dataset.id = event.id;
    timelineCardBank.appendChild(card);
  });
}

// Hämta kort från slot
function getCardInSlot(slot) {
  return slot.querySelector(".card");
}

// Hantera drop (gemensam)
function handleDrop(target, card) {
  const isTimelineSlot = target.classList.contains("timeline-slot");
  const isCauseDropzone = target.classList.contains("dropzone");
  const isBank =
    target.id === "timeline-card-bank" || target.id === "cause-card-bank";

  if (!(isTimelineSlot || isCauseDropzone || isBank)) return;

  if (isTimelineSlot) {
    // Bara ett kort per slot
    const existingCard = getCardInSlot(target);
    if (existingCard) {
      // Skicka gamla kortet tillbaka till rätt bank
      timelineCardBank.appendChild(existingCard);
    }
    target.appendChild(card);
  } else if (isCauseDropzone) {
    target.appendChild(card);
  } else if (isBank) {
    target.appendChild(card);
  }

  // Nollställ rätt/fel-styles vid flytt
  card.classList.remove("correct", "wrong", "animate-correct", "animate-wrong");
}

// Räkna hur många slotar som är fyllda
function filledTimelineSlotsCount() {
  const slots = timelineSlotsContainer.querySelectorAll(".timeline-slot");
  let filled = 0;
  slots.forEach((slot) => {
    if (getCardInSlot(slot)) filled++;
  });
  return filled;
}

// ======================
// ORSAK–KONSEKVENS DATA
// ======================
const causeCardsData = [
  // Orsaker
  { id: "c1-tax", text: "Höga skatter", category: "orsak" },
  { id: "c2-influence", text: "Brist på inflytande", category: "orsak" },
  { id: "c3-enlightenment", text: "Inspiration från Upplysningen", category: "orsak" },
  { id: "c4-selfrule", text: "Koloniernas självstyre", category: "orsak" },
  { id: "c5-bread", text: "Inflation och höga brödpriser", category: "orsak" },
  { id: "c6-greatpower", text: "Stormaktspolitik i Europa", category: "orsak" },

  // Konsekvenser (direkta)
  {
    id: "c7-declaration",
    text: "Självständighetsförklaringen antas",
    category: "konsekvens",
  },
  {
    id: "c8-bastille",
    text: "Stormningen av Bastiljen",
    category: "konsekvens",
  },
  { id: "c9-power", text: "Makt till folket", category: "konsekvens" },
  {
    id: "c10-kingdead",
    text: "Kungen avrättas",
    category: "konsekvens",
  },
  {
    id: "c11-rights",
    text: "Människors lika rättigheter skrivs ner",
    category: "konsekvens",
  },

  // Långsiktiga konsekvenser
  {
    id: "c12-democracy",
    text: "Spridning av demokratiska idéer",
    category: "lang",
  },
  {
    id: "c13-constitutions",
    text: "Nya författningar och konstitutioner",
    category: "lang",
  },
  {
    id: "c14-latin",
    text: "Inspiration till andra revolutioner i Latinamerika",
    category: "lang",
  },
  {
    id: "c15-classes",
    text: "Ståndssamhället försvagas eller avskaffas",
    category: "lang",
  },
  {
    id: "c16-usa-model",
    text: "USA blir förebild för andra demokratiska stater",
    category: "lang",
  },
];

// DOM-element orsaksspel
const causeCardBank = document.getElementById("cause-card-bank");
const causeColumns = document.querySelectorAll(".category-column");
const causeCheckBtn = document.getElementById("cause-check-btn");
const causeResetBtn = document.getElementById("cause-reset-btn");
const causeScore = document.getElementById("cause-score");
const causeComplete = document.getElementById("cause-complete");

// Skapa kort för orsakspelet
function createCauseCards() {
  causeCardBank.querySelectorAll(".card").forEach((c) => c.remove());

  const shuffled = [...causeCardsData].sort(() => Math.random() - 0.5);
  shuffled.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.id = item.id;
    card.dataset.category = item.category;
    card.textContent = item.text;
    causeCardBank.appendChild(card);
  });

  // Töm kolumner
  causeColumns.forEach((col) => {
    const dropzone = col.querySelector(".dropzone");
    dropzone.innerHTML = "";
  });
}

// ======================
// RÄTTNING & POÄNG
// ======================

// Aktivera/inaktivera check-knappar beroende på om alla kort är placerade
function updateButtonsEnabled() {
  // Tidslinje: alla slots fyllda?
  const allTimelinePlaced =
    filledTimelineSlotsCount() === orderedTimelineIds.length;
  timelineCheckBtn.disabled = !allTimelinePlaced;

  // Orsakspelet: alla kort bortflyttade från banken?
  const causeBankCards = causeCardBank.querySelectorAll(".card");
  const allCausePlaced = causeBankCards.length === 0;
  causeCheckBtn.disabled = !allCausePlaced;
}

// Rätta tidslinjen
function checkTimelineGame() {
  const slots = timelineSlotsContainer.querySelectorAll(".timeline-slot");
  let score = 0;

  slots.forEach((slot) => {
    const index = Number(slot.dataset.slotIndex);
    const correctId = orderedTimelineIds[index];
    const card = getCardInSlot(slot);

    if (!card) return;

    card.classList.remove("correct", "wrong", "animate-correct", "animate-wrong");

    if (card.dataset.id === correctId) {
      score++;
      card.classList.add("correct", "animate-correct");
    } else {
      card.classList.add("wrong", "animate-wrong");
    }
  });

  timelineScore.textContent = `Du fick ${score} av ${orderedTimelineIds.length} rätt.`;

  if (score === orderedTimelineIds.length) {
    timelineComplete.classList.remove("hidden");
  }
}

// Resetta tidslinje
function resetTimelineGame() {
  timelineScore.textContent = "";
  timelineComplete.classList.add("hidden");

  // Flytta tillbaka kort
  const allCards = document.querySelectorAll("#timeline-view .card");
  allCards.forEach((card) => {
    card.classList.remove("correct", "wrong", "animate-correct", "animate-wrong");
    timelineCardBank.appendChild(card);
  });

  // Töm slots
  timelineSlotsContainer.querySelectorAll(".timeline-slot").forEach((slot) => {
    slot.innerHTML = "";
  });

  // Slumpa om kort
  createTimelineCards();
  updateButtonsEnabled();
}

// Rätta orsakspelet
function checkCauseGame() {
  let score = 0;
  const total = causeCardsData.length;

  const allCards = document.querySelectorAll("#cause-view .card");

  allCards.forEach((card) => {
    card.classList.remove("correct", "wrong", "animate-correct", "animate-wrong");
    const cardCategory = card.dataset.category;
    const parentColumn = card.closest(".category-column");
    let correct = false;

    if (parentColumn) {
      const colCategory = parentColumn.dataset.category;
      if (cardCategory === colCategory) {
        correct = true;
        score++;
        card.classList.add("correct", "animate-correct");
      } else {
        card.classList.add("wrong", "animate-wrong");
      }
    } else {
      // Kort som inte ligger i någon kategori är fel
      card.classList.add("wrong", "animate-wrong");
    }
  });

  causeScore.textContent = `Du fick ${score} av ${total} rätt.`;

  if (score === total) {
    causeComplete.classList.remove("hidden");
  }
}

// Resetta orsakspelet
function resetCauseGame() {
  causeScore.textContent = "";
  causeComplete.classList.add("hidden");
  createCauseCards();
  updateButtonsEnabled();
}

// ======================
// INIT
// ======================
function init() {
  // Skapa tidslinjespel
  createTimelineSlots();
  createTimelineCards();

  // Skapa orsakspelet
  createCauseCards();

  // Setup DnD
  setupDragAndDrop(document.body);

  // Knapp-lyssnare
  timelineCheckBtn.addEventListener("click", checkTimelineGame);
  timelineResetBtn.addEventListener("click", resetTimelineGame);

  causeCheckBtn.addEventListener("click", checkCauseGame);
  causeResetBtn.addEventListener("click", resetCauseGame);

  // Starta i meny
  showView("home-view");
  updateButtonsEnabled();
}

document.addEventListener("DOMContentLoaded", init);
