
// =====================================
// DISCORD HUB - MAIN JAVASCRIPT
// =====================================

// เชื่อมต่อ HTML ด้วย ID ที่ถูกต้อง
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
// โหลดข้อมูลเซิร์ฟเวอร์
// =====================================

async function loadServers() {
  try {
    const response = await fetch("./servers.json");

    if (!response.ok) {
      throw new Error("โหลด servers.json ไม่สำเร็จ");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("รูปแบบข้อมูลไม่ถูกต้อง");
    }

    servers = data.map((server, index) => ({
      ...server,
      originalIndex: index
    }));

    loadCategories();
    renderServers();

  } catch (error) {
    console.error(error);

    list.textContent = "ไม่สามารถโหลดข้อมูลเซิร์ฟเวอร์ได้";
    resultCount.textContent = "เกิดข้อผิดพลาด";
  }
}


// =====================================
// โหลดหมวดหมู่อัตโนมัติ
// =====================================

function loadCategories() {
  const categories = [
    ...new Set(
      servers
        .map(server => server.category)
        .filter(Boolean)
    )
  ];

  category.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "ทุกหมวดหมู่";
  category.appendChild(allOption);

  categories.sort((a, b) =>
    String(a).localeCompare(String(b), "th")
  );

  categories.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    category.appendChild(option);
  });
}


// =====================================
// ค้นหา กรอง และเรียงลำดับ
// =====================================

function getFilteredServers() {
  let result = [...servers];

  const keyword = search.value.trim().toLowerCase();
  const selectedCategory = category.value;
  const sortValue = sort.value;

  // ค้นหา
  if (keyword) {
    result = result.filter(server => {
      const text = [
        server.name,
        server.description,
        server.short_description,
        server.category
      ].join(" ").toLowerCase();

      return text.includes(keyword);
    });
  }

  // กรองหมวดหมู่
  if (selectedCategory) {
    result = result.filter(server =>
      server.category === selectedCategory
    );
  }

  // เรียงตามชื่อ
  if (sortValue === "name") {
    result.sort((a, b) =>
      String(a.name || "").localeCompare(
        String(b.name || ""),
        "th"
      )
    );
  }

  // เพิ่มล่าสุด
  else if (sortValue === "newest") {
    result.sort((a, b) =>
      a.originalIndex - b.originalIndex
    );
  }

  // เพิ่มเก่าสุด
  else if (sortValue === "oldest") {
    result.sort((a, b) =>
      b.originalIndex - a.originalIndex
    );
  }

  return result;
}


// =====================================
// สร้างการ์ดเซิร์ฟเวอร์
// =====================================

function createServerCard(server) {
  const link = document.createElement("a");

  link.className = "server-row";
  link.href =
    `server.html?slug=${encodeURIComponent(server.slug || "")}`;

  // โลโก้
  if (server.logo) {
    const logo = document.createElement("img");

    logo.className = "server-logo";
    logo.src = server.logo;
    logo.alt = server.name || "Server logo";
    logo.loading = "lazy";

    logo.onerror = () => {
      const fallback = document.createElement("div");
      fallback.className = "server-logo";
      fallback.textContent = "Discord";
      logo.replaceWith(fallback);
    };

    link.appendChild(logo);

  } else {
    const logo = document.createElement("div");

    logo.className = "server-logo";
    logo.textContent = "Discord";

    link.appendChild(logo);
  }

  // ข้อมูล
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

  info.appendChild(name);
  info.appendChild(description);
  info.appendChild(tag);

  // ลูกศร
  const arrow = document.createElement("span");
  arrow.className = "server-arrow";
  arrow.textContent = "›";

  link.appendChild(info);
  link.appendChild(arrow);

  return link;
}


// =====================================
// แสดงเซิร์ฟเวอร์
// =====================================

function renderServers() {
  const filtered = getFilteredServers();

  const totalPages = Math.ceil(
    filtered.length / perPage
  );

  if (currentPage > totalPages) {
    currentPage = Math.max(1, totalPages);
  }

  const start = (currentPage - 1) * perPage;

  const pageServers = filtered.slice(
    start,
    start + perPage
  );

  list.replaceChildren();

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

  resultCount.textContent =
    `พบ ${filtered.length} เซิร์ฟเวอร์`;

  renderPagination(totalPages);
}


// =====================================
// ระบบแบ่งหน้า
// =====================================

function renderPagination(totalPages) {
  pagination.replaceChildren();

  if (totalPages <= 1) return;

  function createButton(label, page, active = false) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.className = active ? "active" : "";
    button.disabled = page === currentPage;

    button.addEventListener("click", () => {
      currentPage = page;

      renderServers();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });

    return button;
  }

  pagination.appendChild(
    createButton(
      "ก่อนหน้า",
      Math.max(1, currentPage - 1)
    )
  );

  for (let i = 1; i <= totalPages; i++) {
    pagination.appendChild(
      createButton(
        String(i),
        i,
        i === currentPage
      )
    );
  }

  pagination.appendChild(
    createButton(
      "ถัดไป",
      Math.min(totalPages, currentPage + 1)
    )
  );
}


// =====================================
// เชื่อมต่อระบบต่าง ๆ
// =====================================

// ค้นหา
search.addEventListener("input", () => {
  currentPage = 1;
  renderServers();
});

// หมวดหมู่
category.addEventListener("change", () => {
  currentPage = 1;
  renderServers();
});

// เรียงลำดับ
sort.addEventListener("change", () => {
  currentPage = 1;
  renderServers();
});


// =====================================
// เริ่มต้น
// =====================================

loadServers();
