
const list = document.getElementById("server-list");
const search = document.getElementById("search");
const category = document.getElementById("category");
const sort = document.getElementById("sort");
const pagination = document.getElementById("pagination");
const resultCount = document.getElementById("result-count");

let servers = [];
let currentPage = 1;

const perPage = 12;

// โหลดข้อมูลเซิร์ฟเวอร์
async function loadServers() {
  try {
    const response = await fetch("./servers.json");

    if (!response.ok) {
      throw new Error("ไม่สามารถโหลด servers.json ได้");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("รูปแบบข้อมูลไม่ถูกต้อง");
    }

    servers = data.map((server, index) => ({
      ...server,
      originalIndex: index
    }));

    renderServers();

  } catch (error) {
    console.error("Load Error:", error);

    list.textContent = "ไม่สามารถโหลดข้อมูลเซิร์ฟเวอร์ได้";
    resultCount.textContent = "เกิดข้อผิดพลาด";
  }
}

// ค้นหาและกรองข้อมูล
function getFilteredServers() {
  let result = [...servers];

  const keyword = search.value.trim().toLowerCase();
  const selectedCategory = category.value;

  // ค้นหาด้วยชื่อและรายละเอียด
  if (keyword) {
    result = result.filter(server => {
      const text = [
        server.name,
        server.short_description,
        server.description,
        server.category
      ].join(" ").toLowerCase();

      return text.includes(keyword);
    });
  }

  // กรองหมวดหมู่
  if (selectedCategory && selectedCategory !== "all") {
    result = result.filter(server =>
      server.category === selectedCategory
    );
  }

  // เรียงลำดับ
  const sortValue = sort.value;

  if (sortValue === "name" || sortValue === "name-asc") {
    result.sort((a, b) =>
      a.name.localeCompare(b.name, "th")
    );
  }

  else if (sortValue === "name-desc") {
    result.sort((a, b) =>
      b.name.localeCompare(a.name, "th")
    );
  }

  // newest จะเรียงตามลำดับใน servers.json
  else if (sortValue === "newest") {
    result.sort((a, b) =>
      a.originalIndex - b.originalIndex
    );
  }

  return result;
}

// สร้างการ์ดเซิร์ฟเวอร์
function createServerCard(server) {
  const link = document.createElement("a");
  link.className = "server-row";
  link.href = `server.html?slug=${encodeURIComponent(server.slug)}`;

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

  // ข้อมูลเซิร์ฟเวอร์
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

// แสดงข้อมูลและแบ่งหน้า
function renderServers() {
  const filtered = getFilteredServers();

  const totalPages = Math.ceil(filtered.length / perPage);

  if (currentPage > totalPages) {
    currentPage = Math.max(1, totalPages);
  }

  const start = (currentPage - 1) * perPage;
  const pageServers = filtered.slice(start, start + perPage);

  list.replaceChildren();

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "ไม่พบเซิร์ฟเวอร์ที่ค้นหา";
    list.appendChild(empty);
  } else {
    pageServers.forEach(server => {
      list.appendChild(createServerCard(server));
    });
  }

  resultCount.textContent =
    `พบ ${filtered.length} เซิร์ฟเวอร์`;

  renderPagination(totalPages);
}

// ระบบเปลี่ยนหน้า
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    return button;
  }

  // ปุ่มย้อนกลับ
  pagination.appendChild(
    createButton("ก่อนหน้า", Math.max(1, currentPage - 1))
  );

  // หมายเลขหน้า
  for (let i = 1; i <= totalPages; i++) {
    pagination.appendChild(
      createButton(String(i), i, i === currentPage)
    );
  }

  // ปุ่มถัดไป
  pagination.appendChild(
    createButton("ถัดไป", Math.min(totalPages, currentPage + 1))
  );
}

// เชื่อมต่อช่องค้นหา
search.addEventListener("input", () => {
  currentPage = 1;
  renderServers();
});

// เชื่อมต่อหมวดหมู่
category.addEventListener("change", () => {
  currentPage = 1;
  renderServers();
});

// เชื่อมต่อการเรียงลำดับ
sort.addEventListener("change", () => {
  currentPage = 1;
  renderServers();
});

// เริ่มต้นเว็บไซต์
loadServers();
