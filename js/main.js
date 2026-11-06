// =====================================
// DISCORD HUB - MAIN JAVASCRIPT
// =====================================

document.addEventListener("DOMContentLoaded", () => {

  // =====================================
  // HTML ELEMENTS
  // =====================================

  const list = document.getElementById("serverList");
  const search = document.getElementById("searchInput");
  const category = document.getElementById("categoryFilter");
  const sort = document.getElementById("sortSelect");
  const pagination = document.getElementById("pagination");
  const resultCount = document.getElementById("serverCount");

  let servers = [];
  let currentPage = 1;
  const perPage = 12;

  // =====================================
  // CHECK HTML
  // =====================================

  if (!list || !search || !category || !sort || !pagination || !resultCount) {
    console.error("ไม่พบ HTML ID ที่จำเป็น");
    return;
  }

  // =====================================
  // LOAD SERVERS.JSON
  // =====================================

  async function loadServers() {
    try {
      list.textContent = "กำลังโหลดข้อมูล...";

      const response = await fetch(
        new URL("servers.json", document.baseURI)
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("servers.json ต้องเป็น Array");
      }

      servers = data.map((server, index) => ({
        ...server,
        originalIndex: index
      }));

      loadCategories();
      renderServers();

    } catch (error) {
      console.error("โหลดข้อมูลผิดพลาด:", error);

      list.textContent = "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่";
      resultCount.textContent = "เกิดข้อผิดพลาด";
    }
  }

  // =====================================
  // LOAD CATEGORIES
  // =====================================

  function loadCategories() {
    category.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "ทุกหมวดหมู่";

    category.appendChild(allOption);

    const categories = [
      ...new Set(
        servers.map(server => server.category).filter(Boolean)
      )
    ].sort((a, b) => a.localeCompare(b, "th"));

    categories.forEach(item => {
      const option = document.createElement("option");

      option.value = item;
      option.textContent = item;

      category.appendChild(option);
    });
  }

  // =====================================
  // FILTER SERVERS
  // =====================================

  function getFilteredServers() {
    let result = [...servers];

    const keyword = search.value.trim().toLowerCase();

    if (keyword) {
      result = result.filter(server => {

        const content = [
          server.name,
          server.description,
          server.short_description,
          server.category
        ].filter(Boolean).join(" ").toLowerCase();

        return content.includes(keyword);
      });
    }

    if (category.value) {
      result = result.filter(
        server => server.category === category.value
      );
    }

    // SORT

    if (sort.value === "name") {

      result.sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || ""), "th"
        )
      );

    } else if (sort.value === "newest") {

      result.sort(
        (a, b) => a.originalIndex - b.originalIndex
      );

    } else if (sort.value === "oldest") {

      result.sort(
        (a, b) => b.originalIndex - a.originalIndex
      );

    }

    return result;
  }

  // =====================================
  // CREATE IMAGE
  // =====================================

  function createImage(src, className, alt, fallbackText) {

    if (!src) {
      const fallback = document.createElement("div");

      fallback.className = className;
      fallback.textContent = fallbackText;

      return fallback;
    }

    const img = document.createElement("img");

    img.className = className;
    img.src = src;
    img.alt = alt;
    img.loading = "lazy";

    img.onerror = () => {

      const fallback = document.createElement("div");

      fallback.className = className;
      fallback.textContent = fallbackText;

      img.replaceWith(fallback);
    };

    return img;
  }

  // =====================================
  // CREATE SERVER CARD
  // =====================================

  function createServerCard(server) {

    const link = document.createElement("a");

    link.className = "server-row";

    link.href =
      `server.html?slug=${encodeURIComponent(server.slug || "")}`;

    // BANNER

    const banner = createImage(
      server.banner,
      "server-banner",
      `${server.name || "Discord"} Banner`,
      "ไม่มีแบนเนอร์"
    );

    // LOGO

    const logo = createImage(
      server.logo,
      "server-logo",
      server.name || "Discord",
      "Discord"
    );

    // SERVER INFO

    const info = document.createElement("div");

    info.className = "server-info";

    const name = document.createElement("h3");

    name.textContent = server.name || "ไม่มีชื่อ";

    const description = document.createElement("p");

    description.textContent =
      server.short_description || "ไม่มีคำอธิบาย";

    const tag = document.createElement("span");

    tag.className = "category-tag";

    tag.textContent = server.category || "ทั่วไป";

    info.append(name, description, tag);

    // ARROW

    const arrow = document.createElement("span");

    arrow.className = "server-arrow";
    arrow.textContent = "›";

    // APPEND ELEMENTS

    link.append(banner, logo, info, arrow);

    return link;
  }

  // =====================================
  // PAGINATION
  // =====================================

  function renderPagination(totalPages) {

    pagination.replaceChildren();

    if (totalPages <= 1) return;

    function addButton(label, page) {

      const button = document.createElement("button");

      button.type = "button";
      button.textContent = label;
      button.disabled = page === currentPage;

      button.addEventListener("click", () => {

        currentPage = page;

        renderServers();

        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });

      });

      pagination.appendChild(button);
    }

    addButton(
      "ก่อนหน้า",
      Math.max(1, currentPage - 1)
    );

    for (let i = 1; i <= totalPages; i++) {

      addButton(String(i), i);

    }

    addButton(
      "ถัดไป",
      Math.min(totalPages, currentPage + 1)
    );
  }

  // =====================================
  // RENDER SERVERS
  // =====================================

  function renderServers() {

    const filtered = getFilteredServers();

    const totalPages = Math.ceil(
      filtered.length / perPage
    );

    currentPage = Math.min(
      currentPage,
      Math.max(1, totalPages)
    );

    const start = (currentPage - 1) * perPage;

    const pageServers = filtered.slice(
      start,
      start + perPage
    );

    list.replaceChildren();

    // NO RESULTS

    if (filtered.length === 0) {

      const empty = document.createElement("p");

      empty.textContent = "ไม่พบเซิร์ฟเวอร์ที่ค้นหา";

      list.appendChild(empty);

    } else {

      pageServers.forEach(server => {

        list.appendChild(
          createServerCard(server)
        );

      });

    }

    // RESULT COUNT

    resultCount.textContent =
      `พบ ${filtered.length} เซิร์ฟเวอร์`;

    // PAGINATION

    renderPagination(totalPages);
  }

  // =====================================
  // SEARCH EVENT
  // =====================================

  search.addEventListener("input", () => {

    currentPage = 1;

    renderServers();

  });

  // =====================================
  // CATEGORY EVENT
  // =====================================

  category.addEventListener("change", () => {

    currentPage = 1;

    renderServers();

  });

  // =====================================
  // SORT EVENT
  // =====================================

  sort.addEventListener("change", () => {

    currentPage = 1;

    renderServers();

  });

  // =====================================
  // START
  // =====================================

  loadServers();

});
