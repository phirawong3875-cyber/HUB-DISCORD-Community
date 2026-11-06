// ==========================================
// DISCORD HUB - MAIN JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("serverList");
  const search = document.getElementById("searchInput");
  const category = document.getElementById("categoryFilter");
  const sort = document.getElementById("sortSelect");
  const pagination = document.getElementById("pagination");
  const serverCount = document.getElementById("serverCount");

  let servers = [];
  let currentPage = 1;

  const perPage = 12;

  // ==========================================
  // LOAD SERVER DATA
  // ==========================================

  async function loadServers() {
    try {
      const response = await fetch(
        new URL("servers.json", document.baseURI)
      );

      if (!response.ok) {
        throw new Error("โหลด servers.json ไม่สำเร็จ");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("รูปแบบข้อมูล JSON ไม่ถูกต้อง");
      }

      servers = data;

      loadCategories();
      renderServers();

    } catch (error) {
      console.error(error);

      list.innerHTML = `
        <p class="loading">
          ไม่สามารถโหลดข้อมูลเซิร์ฟเวอร์ได้
        </p>
      `;

      serverCount.textContent = "โหลดข้อมูลไม่สำเร็จ";
    }
  }

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================

  function loadCategories() {
    const categories = [
      ...new Set(
        servers
          .map(server => server.category)
          .filter(Boolean)
      )
    ];

    category.innerHTML = `
      <option value="">ทุกหมวดหมู่</option>
    `;

    categories.forEach(item => {
      const option = document.createElement("option");

      option.value = item;
      option.textContent = item;

      category.appendChild(option);
    });
  }

  // ==========================================
  // FILTER AND SORT
  // ==========================================

  function getFilteredServers() {
    let result = [...servers];

    const keyword = search.value
      .trim()
      .toLowerCase();

    const selectedCategory = category.value;

    // SEARCH
    if (keyword) {
      result = result.filter(server => {
        return [
          server.name,
          server.description,
          server.short_description,
          server.category
        ]
          .filter(Boolean)
          .some(value =>
            String(value).toLowerCase().includes(keyword)
          );
      });
    }

    // CATEGORY
    if (selectedCategory) {
      result = result.filter(
        server => server.category === selectedCategory
      );
    }

    // SORT
    if (sort.value === "name") {
      result.sort((a, b) =>
        (a.name || "").localeCompare(
          b.name || "",
          "th"
        )
      );
    }

    if (sort.value === "oldest") {
      result.reverse();
    }

    return result;
  }

  // ==========================================
  // CREATE SERVER CARD
  // ไม่มี BANNER ในหน้านี้
  // ==========================================

  function createServerCard(server) {
    const link = document.createElement("a");

    link.className = "server-row";

    link.href =
      `server.html?slug=${encodeURIComponent(server.slug || "")}`;

    // LOGO เท่านั้น
    const logo = document.createElement("img");

    logo.className = "server-logo";
    logo.src = server.logo || "";
    logo.alt = server.name || "Discord";
    logo.loading = "lazy";

    logo.onerror = () => {
      const fallback = document.createElement("div");

      fallback.className = "server-logo server-logo-fallback";
      fallback.textContent = "DISCORD";

      logo.replaceWith(fallback);
    };

    // SERVER INFORMATION
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

    // ประกอบการ์ดโดยใช้เฉพาะ Logo
    link.append(logo, info, arrow);

    return link;
  }

  // ==========================================
  // PAGINATION
  // ==========================================

  function renderPagination(totalPages) {
    pagination.innerHTML = "";

    if (totalPages <= 1) {
      return;
    }

    function createButton(label, page, disabled = false) {
      const button = document.createElement("button");

      button.textContent = label;
      button.disabled = disabled;

      if (page === currentPage) {
        button.classList.add("active");
      }

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

    createButton(
      "‹",
      currentPage - 1,
      currentPage === 1
    );

    for (let page = 1; page <= totalPages; page++) {
      createButton(
        page,
        page,
        false
      );
    }

    createButton(
      "›",
      currentPage + 1,
      currentPage === totalPages
    );
  }

  // ==========================================
  // RENDER SERVERS
  // ==========================================

  function renderServers() {
    const filtered = getFilteredServers();

    const totalPages = Math.ceil(
      filtered.length / perPage
    );

    if (currentPage > totalPages) {
      currentPage = Math.max(1, totalPages);
    }

    const start = (currentPage - 1) * perPage;

    const currentServers = filtered.slice(
      start,
      start + perPage
    );

    // CLEAR OLD CONTENT
    list.innerHTML = "";

    // UPDATE COUNT
    serverCount.textContent =
      `พบ ${filtered.length} เซิร์ฟเวอร์`;

    // EMPTY RESULT
    if (filtered.length === 0) {
      list.innerHTML = `
        <p class="loading">
          ไม่พบเซิร์ฟเวอร์ที่ค้นหา
        </p>
      `;

      pagination.innerHTML = "";
      return;
    }

    // CREATE CARDS
    const fragment = document.createDocumentFragment();

    currentServers.forEach(server => {
      fragment.appendChild(
        createServerCard(server)
      );
    });

    list.appendChild(fragment);

    renderPagination(totalPages);
  }

  // ==========================================
  // EVENTS
  // ==========================================

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

  // ==========================================
  // START
  // ==========================================

  loadServers();
});
