const list = document.getElementById("server-list");
const search = document.getElementById("search");
const category = document.getElementById("category");
const sort = document.getElementById("sort");
const pagination = document.getElementById("pagination");
const resultCount = document.getElementById("result-count");

let servers = [];
let currentPage = 1;
const perPage = 12;

async function loadServers() {
  try {
    const response = await fetch("servers.json");

    if (!response.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");

    servers = await response.json();

    const categories = [...new Set(servers.map(s => s.category))];

    categories.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      category.appendChild(option);
    });

    renderServers();
  } catch (error) {
    list.textContent = "ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบไฟล์ servers.json";
  }
}

function renderServers() {
  const keyword = search.value.toLowerCase().trim();
  const selectedCategory = category.value;

  let filtered = servers.filter(server => {
    const text = `${server.name} ${server.short_description} ${server.description} ${server.category}`.toLowerCase();

    return text.includes(keyword) &&
      (selectedCategory === "all" || server.category === selectedCategory);
  });

  if (sort.value === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name, "th"));
  }

  resultCount.textContent = `${filtered.length} เซิร์ฟเวอร์`;

  const totalPages = Math.ceil(filtered.length / perPage);
  if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

  const start = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  list.replaceChildren();

  if (pageItems.length === 0) {
    list.textContent = "ไม่พบเซิร์ฟเวอร์ที่ค้นหา";
  }

  pageItems.forEach(server => {
    const card = document.createElement("a");
    card.className = "server-row";
    card.href = `server.html?slug=${encodeURIComponent(server.slug)}`;

    const logo = document.createElement("img");
    logo.className = "server-logo";
    logo.src = server.logo;
    logo.alt = `โลโก้ ${server.name}`;
    logo.loading = "lazy";

    const info = document.createElement("div");
    info.className = "server-info";

    const name = document.createElement("h3");
    name.textContent = server.name;

    const description = document.createElement("p");
    description.textContent = server.short_description;

    const tag = document.createElement("span");
    tag.className = "category-tag";
    tag.textContent = server.category;

    info.append(name, description, tag);
    card.append(logo, info);

    const arrow = document.createElement("span");
    arrow.className = "server-arrow";
    arrow.textContent = "›";
    card.append(arrow);

    list.append(card);
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  pagination.replaceChildren();

  if (totalPages <= 1) return;

  function addButton(label, page, disabled = false, active = false) {
    const button = document.createElement("button");
    button.textContent = label;
    button.disabled = disabled;
    if (active) button.className = "active";

    button.addEventListener("click", () => {
      currentPage = page;
      renderServers();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    pagination.append(button);
  }

  addButton("ก่อนหน้า", currentPage - 1, currentPage === 1);

  for (let page = 1; page <= totalPages; page++) {
    addButton(String(page), page, false, page === currentPage);
  }

  addButton("ถัดไป", currentPage + 1, currentPage === totalPages);
}

search.addEventListener("input", () => {
  currentPage = 1;
  renderServers();
});

category.addEventListener("change", () => {
  currentPage = 1;
  renderServers();
});

sort.addEventListener("change", () => {
  currentPage = 1;
  renderServers();
});

loadServers();
