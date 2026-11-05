async function loadDetail() {
  const container = document.getElementById("server-detail");
  const slug = new URLSearchParams(window.location.search).get("slug");

  try {
    const response = await fetch("servers.json");
    if (!response.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");

    const servers = await response.json();
    const server = servers.find(item => item.slug === slug);

    if (!server) {
      container.textContent = "ไม่พบเซิร์ฟเวอร์นี้";
      return;
    }

    document.title = server.name;

    const banner = document.createElement("img");
    banner.className = "detail-banner";
    banner.src = server.banner;
    banner.alt = `แบนเนอร์ ${server.name}`;

    const profile = document.createElement("section");
    profile.className = "detail-profile";

    const logo = document.createElement("img");
    logo.className = "detail-logo";
    logo.src = server.logo;
    logo.alt = `โลโก้ ${server.name}`;

    const name = document.createElement("h1");
    name.textContent = server.name;

    const tag = document.createElement("span");
    tag.className = "category-tag";
    tag.textContent = server.category;

    profile.append(logo, name, tag);

    const description = document.createElement("section");
    description.className = "detail-description";

    const heading = document.createElement("h2");
    heading.textContent = "เกี่ยวกับเซิร์ฟเวอร์";

    const paragraph = document.createElement("p");
    paragraph.textContent = server.description;

    description.append(heading, paragraph);

    const join = document.createElement("a");
    join.className = "join-button";
    join.textContent = "เข้าร่วม Discord";
    join.href = server.invite;
    join.target = "_blank";
    join.rel = "noopener noreferrer";

    container.replaceChildren(banner, profile, description, join);
  } catch (error) {
    container.textContent = "ไม่สามารถโหลดข้อมูลได้";
  }
}

loadDetail();
