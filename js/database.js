(() => {
  let products = [];
  const FLAG = { usa: "🇺🇸", france: "🇫🇷", china: "🇨🇳", other: "🌍" };
  const COUNTRY_LABEL = { usa: "USA", france: "France", china: "China", other: "Other" };
  const HEAT = { gas: "🔥 Gas", electric: "⚡ Elec", induction: "🧲 Ind", oven: "♨️ Oven", campfire: "🏕️ Camp", grill: "🔲 Grill", broiler: "🔥 Broil" };
  const CATEGORY_LABEL = {
    skillet: "Skillet", "dutch-oven": "Dutch Oven", wok: "Wok", griddle: "Griddle",
    "grill-pan": "Grill Pan", saucepan: "Saucepan", braiser: "Braiser", baking: "Baking", specialty: "Specialty"
  };
  const MATERIAL_LABEL = {
    "cast-iron": "Cast Iron", "enameled-cast-iron": "Enameled Cast Iron",
    "carbon-steel": "Carbon Steel", copper: "Copper", "stainless-clad": "Stainless Clad"
  };

  const $ = id => document.getElementById(id);

  function populateFilters() {
    const cats = [...new Set(products.map(p => p.category))].sort();
    const mats = [...new Set(products.map(p => p.material))].sort();
    const countries = [...new Set(products.map(p => p.country_of_origin))].sort();

    cats.forEach(c => $("category").innerHTML += `<option value="${c}">${CATEGORY_LABEL[c] || c}</option>`);
    mats.forEach(m => $("material").innerHTML += `<option value="${m}">${MATERIAL_LABEL[m] || m}</option>`);
    countries.forEach(c => $("country").innerHTML += `<option value="${c}">${COUNTRY_LABEL[c] || c}</option>`);
  }

  function getFiltered() {
    const q = $("search").value.toLowerCase();
    const cat = $("category").value;
    const mat = $("material").value;
    const co = $("country").value;
    const sort = $("sort").value;

    let list = products.filter(p => {
      if (cat && p.category !== cat) return false;
      if (mat && p.material !== mat) return false;
      if (co && p.country_of_origin !== co) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false;
      return true;
    });

    if (sort === "price-asc") list.sort((a, b) => a.price_usd - b.price_usd);
    else if (sort === "price-desc") list.sort((a, b) => b.price_usd - a.price_usd);
    else if (sort === "weight-asc") list.sort((a, b) => a.weight_lbs - b.weight_lbs);
    else if (sort === "weight-desc") list.sort((a, b) => b.weight_lbs - a.weight_lbs);

    return list;
  }

  function renderCard(p) {
    const flag = FLAG[p.country_of_origin] || "🌍";
    const heatHtml = (p.heat_source || []).map(h => `<span class="heat-icon">${HEAT[h] || h}</span>`).join("");
    const prosHtml = (p.pros || []).map(pr => `<li>${pr}</li>`).join("");
    const collectorHtml = p.collector_note ? `<div class="collector-note">${p.collector_note}</div>` : "";
    const seasonedBadge = p.seasoned ? `<span class="badge badge-seasoned">Pre-Seasoned</span>` : "";

    return `<div class="product-card">
      <div class="brand">${p.brand}</div>
      <h3>${p.name}</h3>
      <div class="badges">
        <span class="badge badge-cat">${CATEGORY_LABEL[p.category] || p.category}</span>
        <span class="badge badge-mat">${MATERIAL_LABEL[p.material] || p.material}</span>
        ${seasonedBadge}
      </div>
      <div class="product-meta">
        <span>${flag} ${COUNTRY_LABEL[p.country_of_origin] || p.country_of_origin}</span>
        <span>${p.diameter_inches}"</span>
        <span>${p.weight_lbs} lbs</span>
      </div>
      <div class="heat-icons">${heatHtml}</div>
      <div class="product-price">$${p.price_usd.toFixed(2)}</div>
      <ul class="product-pros">${prosHtml}</ul>
      <div class="product-best"><strong>Best for:</strong> ${p.best_for}</div>
      ${collectorHtml}
    </div>`;
  }

  function render() {
    const list = getFiltered();
    $("resultCount").textContent = `${list.length} product${list.length !== 1 ? "s" : ""} found`;
    $("grid").innerHTML = list.map(renderCard).join("");
  }

  function init() {
    fetch("data/products.json")
      .then(r => r.json())
      .then(data => {
        products = data;
        populateFilters();
        render();
      })
      .catch(err => {
        $("grid").innerHTML = `<p style="padding:24px;color:#78716C">Could not load products. ${err.message}</p>`;
      });

    ["search", "category", "material", "country", "sort"].forEach(id => {
      $(id).addEventListener(id === "search" ? "input" : "change", render);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
