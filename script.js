// ======================
// VIEW-HANTERING
// ======================
const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll("[data-view]");

function showView(id) {
  views.forEach((v) => v.classList.remove("active"));
  const view = document.getElementById(id);
  if (view) view.classList.add("active");

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
// DRAG-AND-DROP
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

  rootElement.querySelectorAll(".dropzone, .timeline-slot, #timeline-card-bank, #cause-card-bank").forEach(
    (zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (!draggedCard) return;
        const target = e.currentTarget;
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
// TIDSLINJE – DATA
// ======================
const timelineEventsData = [
  // Amerikanska revolutionen
  { id: "e1763-war", text: "7-årskriget avslutas", year: 1763, revolution: "american" },
  { id: "e1765-stamp", text: "Stämpelskatten införs", year: 1765, revolution: "american" },
  { id: "e1773-boston", text: "Boston Tea Party", year: 1773, revolution: "american" },
  { id: "e1775-war", text: "Krig mot Storbritannien inleds", year: 1775, revolution: "american" },
  { id: "e1776-declaration", text: "Självständighetsförklaringen antas", year: 1776, revolution: "american" },
  { id: "e1777-saratoga", text: "Slaget vid Saratoga", year: 1777, revolution: "american" },
  { id: "e1783-paris", text: "Parisfreden – USA erkänns", year: 1783, revolution: "american" },
  { id: "e1787-constitution", text: "USA:s konstitution antas", year: 1787, revolution: "american" },
  { id: "e1791-billofrights", text: "Bill of Rights antas", year: 1791, revolution: "american" },

  // Franska revolutionen
  { id: "f1788-crisis", text: "Finanskris i Frankrike", year: 1788, revolution: "french" },
  { id: "f1789-estates", text: "Generalständerna sammankallas", year: 1789, revolution: "french" },
  { id: "f1789-national", text: "Nationalförsamlingen bildas", year: 1789, revolution: "french" },
  { id: "f1789-bastille", text: "Stormningen av Bastiljen", year: 1789, revolution: "french" },
  { id: "f1789-rights", text: "Människans och medborgarens rättigheter antas", year: 1789, revolution: "french" },
  { id: "f1789-women", text: "Kvinnornas marsch till Versailles", year: 1789, revolution: "french" },
  { id: "f1793-terror", text: "Skräckväldet inleds", year: 1793, revolution: "french" },
  { id: "f1793-king", text: "Kungen avrättas", year: 1793, revolution: "french" },
  { id: "f1799-napoleon", text: "Napoleon tar makten", year: 1799, revolution: "french" }
];

const orderedTimelineIds = [...timelineEventsData]
  .sort((a, b) => a.year - b.year || a.text.localeCompare(b.text))
  .map((e) => e.id);

const timelineCardBank = document.getElementById("timeline-card-bank");
const timelineSlotsContainer = document.getElementById("timeline-slots");
const timelineCheckBtn = document.getElementById("timeline-check-btn");
const timelineResetBtn = document.getElementById("timeline-reset-btn");
const timelineScore = document.getElementById("timeline-score");
const timelineComplete = document.getElementById("timeline-complete");

function createTimelineSlots() {
  timelineSlotsContainer.innerHTML = "";
  orderedTimelineIds.forEach((id, index) => {
    const slot = document.createElement("div");
    slot.className = "timeline-slot";
    slot.dataset.slotIndex = String(index);
    slot.dataset.position = String(index + 1); // visas ovanför slottet
    timelineSlotsContainer.appendChild(slot);
  });
}

function createTimelineCards() {
  timelineCardBank.querySelectorAll(".card").forEach((c) => c.remove());
  const shuffled = [...timelineEventsData].sort(() => Math.random() - 0.5);

  shuffled.forEach((event) => {
    const card = document.createElement("div");
    card.className = `card event-card ${
      event.revolution === "american" ? "american-card" : "french-card"
    }`;
    card.draggable = true;
    card.dataset.id = event.id;
    card.dataset.year = String(event.year);
    card.textContent = event.text;
    card.title = `År: ${event.year}`;
    timelineCardBank.appendChild(card);
  });
}

function getCardInSlot(slot) {
  return slot.querySelector(".card");
}

function handleDrop(target, card) {
  const isTimelineSlot = target.classList.contains("timeline-slot");
  const isCauseDropzone = target.classList.contains("dropzone");
  const isTimelineBank = target.id === "timeline-card-bank";
  const isCauseBank = target.id === "cause-card-bank";

  if (!(isTimelineSlot || isCauseDropzone || isTimelineBank || isCauseBank)) return;

  if (isTimelineSlot) {
    const existingCard = getCardInSlot(target);
    if (existingCard) {
      timelineCardBank.appendChild(existingCard);
    }
    target.appendChild(card);
  } else if (isCauseDropzone) {
    target.appendChild(card);
  } else if (isTimelineBank || isCauseBank) {
    target.appendChild(card);
  }

  card.classList.remove("correct", "wrong", "animate-correct", "animate-wrong");
}

function filledTimelineSlotsCount() {
  const slots = timelineSlotsContainer.querySelectorAll(".timeline-slot");
  let filled = 0;
  slots.forEach((slot) => {
    if (getCardInSlot(slot)) filled++;
  });
  return filled;
}

// ======================
// ORSAKSPEL – DATA (KEDJOR)
// ======================
const causeCardsData = [
  // Kedja A – Amerikanska: skatter & självstyre
  { id: "c1-tax", text: "Höga skatter", category: "orsak", chain: "a" },
  { id: "c5-declaration", text: "Självständighetsförklaringen antas", category: "konsekvens", chain: "a" },
  { id: "c9-usa-model", text: "USA blir förebild för andra demokratiska stater", category: "lang", chain: "a" },

  // Kedja B – Amerikanska: upplysning & rättigheter
  { id: "c2-enlightenment", text: "Inspiration från Upplysningen", category: "orsak", chain: "b" },
  { id: "c6-rights", text: "Människors lika rättigheter skrivs ner", category: "konsekvens", chain: "b" },
  { id: "c10-constitutions", text: "Nya författningar och konstitutioner", category: "lang", chain: "b" },

  // Kedja C – Franska: brödkris & Bastiljen
  { id: "c3-bread", text: "Inflation och höga brödpriser", category: "orsak", chain: "c" },
  { id: "c7-bastille", text: "Stormningen av Bastiljen", category: "konsekvens", chain: "c" },
  { id: "c11-classes", text: "Ståndssamhället försvagas eller avskaffas", category: "lang", chain: "c" },

  // Kedja D – Franska: inflytande & kungamakten
  { id: "c4-influence", text: "Brist på inflytande", category: "orsak", chain: "d" },
  { id: "c8-king", text: "Kungen avrättas", category: "konsekvens", chain: "d" },
  { id: "c12-democracy", text: "Spridning av demokratiska idéer", category: "lang", chain: "d" }
];

const causeCardBank = document.getElementById("cause-card-bank");
const causeCheckBtn = document.getElementById("cause-check-btn");
const causeResetBtn = document.getElementById("cause-reset-btn");
const causeScore = document.getElementById("cause-score");
const causeComplete = document.getElementById("cause-complete");

function createCauseCards() {
  causeCardBank.querySelectorAll(".card").forEach((c) => c.remove());
  const shuffled = [...causeCardsData].sort(() => Math.random() - 0.5);

  shuffled.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.id = item.id;
    card.dataset.category = item.category;
    card.dataset.chain = item.chain;
    card.textContent = item.text;
    causeCardBank.appendChild(card);
  });

  // töm alla dropzones
  document.querySelectorAll("#cause-chains .dropzone").forEach((dz) => {
    dz.innerHTML = "";
  });
}

// ======================
// RÄTTNING & POÄNG
// ======================
function updateButtonsEnabled() {
  const allTimelinePlaced = filledTimelineSlotsCount() === orderedTimelineIds.length;
  timelineCheckBtn.disabled = !allTimelinePlaced;

  const causeBankCards = causeCardBank.querySelectorAll(".card");
  const allCausePlaced = causeBankCards.length === 0;
  causeCheckBtn.disabled = !allCausePlaced;
}

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

function resetTimelineGame() {
  timelineScore.textContent = "";
  timelineComplete.classList.add("hidden");

  const allCards = document.querySelectorAll("#timeline-view .card");
  allCards.forEach((card) => {
    card.classList.remove("correct", "wrong", "animate-correct", "animate-wrong");
    timelineCardBank.appendChild(card);
  });

  timelineSlotsContainer.querySelectorAll(".timeline-slot").forEach((slot) => {
    slot.innerHTML = "";
  });

  createTimelineCards();
  updateButtonsEnabled();
}

function checkCauseGame() {
  let score = 0;
  const total = causeCardsData.length;
  const allCards = document.querySelectorAll("#cause-view .card");

  allCards.forEach((card) => {
    card.classList.remove("correct", "wrong", "animate-correct", "animate-wrong");

    const cardCategory = card.dataset.category;
    const cardChain = card.dataset.chain;

    const slot = card.closest(".cause-chain-slot");
    const row = card.closest(".cause-chain-row");

    let correct = false;
    if (slot && row) {
      const slotCategory = slot.dataset.slotCategory;
      const slotChain = row.dataset.chain;
      correct = cardCategory === slotCategory && cardChain === slotChain;
    }

    if (correct) {
      score++;
      card.classList.add("correct", "animate-correct");
    } else {
      card.classList.add("wrong", "animate-wrong");
    }
  });

  causeScore.textContent = `Du fick ${score} av ${total} rätt.`;

  if (score === total) {
    causeComplete.classList.remove("hidden");
  }
}

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
  createTimelineSlots();
  createTimelineCards();
  createCauseCards();

  setupDragAndDrop(document.body);

  timelineCheckBtn.addEventListener("click", checkTimelineGame);
  timelineResetBtn.addEventListener("click", resetTimelineGame);

  causeCheckBtn.addEventListener("click", checkCauseGame);
  causeResetBtn.addEventListener("click", resetCauseGame);

  showView("home-view");
  updateButtonsEnabled();
}

document.addEventListener("DOMContentLoaded", init);
