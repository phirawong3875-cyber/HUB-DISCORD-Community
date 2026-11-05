
document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("serverList");
  const search = document.getElementById("searchInput");
  const category = document.getElementById("categoryFilter");
  const sort = document.getElementById("sortSelect");
  const pagination = document.getElementById("pagination");
  const resultCount = document.getElementById("serverCount");

  let servers = [];
  let currentPage = 1;
  const perPage = 12;

  // ตรวจสอบ HTML
  if (!list || !search || !category || !sort || !pagination || !resultCount) {
    console.error("ไม่พบ HTML ID ที่จำเป็น");
    return;
  }

  async function loadServers() {
    try {
      list.textContent = "กำลังโหลดข้อมูล...";

      const response = await fetch(
        new URL("servers.json", document.baseURI)
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("ข้อมูล JSON ไม่ใช่ Array");
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

  function loadCategories() {
    category.replaceChildren();

    const all = document.createElement("option");
    all.value = "";
    all.textContent = "ทุกหมวดหมู่";
    category.appendChild(all);

    const categories = [...new Set(
      servers.map(s => s.category).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "th"));

    categories.forEach(item => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      category.appendChild(option);
    });
  }

  function getFilteredServers() {
    let result = [...servers];
    const keyword = search.value.trim().toLowerCase();

    if (keyword) {
      result = result.filter(server =>
        [
          server.name,
          server.description,
          server.short_description,
          server.category
        ].join(" ").toLowerCase().includes(keyword)
      );
    }

    if (category.value) {
      result = result.filter(
        server => server.category === category.value
      );
    }

    if (sort.value === "name") {
      result.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), "th")
      );
    } else if (sort.value === "newest") {
      result.sort((a, b) => a.originalIndex - b.originalIndex);
    } else if (sort.value === "oldest") {
      result.sort((a, b) => b.originalIndex - a.originalIndex);
    }

    return result;
  }

  function createServerCard(server) {
    const link = document.createElement("a");
    link.className = "server-row";
    link.href = `server.html?slug=${encodeURIComponent(server.slug || "")}`;

    const logo = document.createElement("img");
    logo.className = "server-logo";
    logo.src = server.logo || "";
    logo.alt = server.name || "Discord";
    logo.loading = "lazy";

    logo.onerror = () => {
      const fallback = document.createElement("div");
      fallback.className = "server-logo";
      fallback.textContent = "Discord";
      logo.replaceWith(fallback);
    };

    const info = document.createElement("div");
    info.className = "server-info";

    const name = document.createElement("h3");
    name.textContent = server.name || "ไม่มีชื่อ";

    const description = document.createElement("p");
    description.textContent = server.short_description || "ไม่มีคำอธิบาย";

    const tag = document.createElement("span");
    tag.className = "category-tag";
    tag.textContent = server.category || "ทั่วไป";

    info.append(name, description, tag);

    const arrow = document.createElement("span");
    arrow.className = "server-arrow";
    arrow.textContent = "›";

    link.append(logo, info, arrow);
    return link;
  }

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
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      pagination.appendChild(button);
    }

    addButton("ก่อนหน้า", Math.max(1, currentPage - 1));

    for (let i = 1; i <= totalPages; i++) {
      addButton(String(i), i);
    }

    addButton("ถัดไป", Math.min(totalPages, currentPage + 1));
  }

  function renderServers() {
    const filtered = getFilteredServers();
    const totalPages = Math.ceil(filtered.length / perPage);

    currentPage = Math.min(currentPage, Math.max(1, totalPages));

    const start = (currentPage - 1) * perPage;
    const pageServers = filtered.slice(start, start + perPage);

    list.replaceChildren();

    if (filtered.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "ไม่พบเซิร์ฟเวอร์ที่ค้นหา";
      list.appendChild(empty);
    } else {
      pageServers.forEach(server =>
        list.appendChild(createServerCard(server))
      );
    }

    resultCount.textContent = `พบ ${filtered.length} เซิร์ฟเวอร์`;
    renderPagination(totalPages);
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
});
