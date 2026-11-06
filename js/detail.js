// =====================================
// DISCORD HUB - DETAIL PAGE
// =====================================

document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("server-detail");

  // =====================================
  // GET SERVER SLUG
  // =====================================

  const params = new URLSearchParams(
    window.location.search
  );

  const slug = params.get("slug");

  // =====================================
  // CREATE ELEMENT
  // =====================================

  function createElement(tag, className, text) {

    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  // =====================================
  // LOAD SERVER DATA
  // =====================================

  async function loadDetail() {

    try {

      if (!slug) {
        throw new Error("ไม่พบรหัสเซิร์ฟเวอร์");
      }

      const response = await fetch("servers.json");

      if (!response.ok) {
        throw new Error("โหลด servers.json ไม่สำเร็จ");
      }

      const servers = await response.json();

      if (!Array.isArray(servers)) {
        throw new Error("รูปแบบข้อมูล JSON ไม่ถูกต้อง");
      }

      const server = servers.find(
        item => item.slug === slug
      );

      if (!server) {
        container.textContent = "ไม่พบเซิร์ฟเวอร์นี้";
        return;
      }

      // =====================================
      // PAGE TITLE
      // =====================================

      document.title =
        `${server.name || "รายละเอียดเซิร์ฟเวอร์"} | DISCORD HUB`;

      // =====================================
      // BANNER
      // =====================================

      const banner = createElement(
        "img",
        "detail-banner"
      );

      banner.alt = `แบนเนอร์ ${server.name || "Discord"}`;
      banner.loading = "eager";

      if (server.banner) {

        banner.src = server.banner;

        banner.onerror = () => {
          banner.remove();
        };

      } else {

        banner.remove();

      }

      // =====================================
      // PROFILE
      // =====================================

      const profile = createElement(
        "section",
        "detail-profile"
      );

      // LOGO

      const logo = createElement(
        "img",
        "detail-logo"
      );

      logo.alt = `โลโก้ ${server.name || "Discord"}`;

      if (server.logo) {

        logo.src = server.logo;

        logo.onerror = () => {
          logo.remove();
        };

      } else {

        logo.remove();

      }

      // NAME

      const name = createElement(
        "h1",
        "",
        server.name || "ไม่มีชื่อ"
      );

      // CATEGORY

      const category = createElement(
        "span",
        "category-tag",
        server.category || "ทั่วไป"
      );

      profile.append(
        logo,
        name,
        category
      );

      // =====================================
      // DESCRIPTION
      // =====================================

      const description = createElement(
        "section",
        "detail-description"
      );

      const heading = createElement(
        "h2",
        "",
        "เกี่ยวกับเซิร์ฟเวอร์"
      );

      const paragraph = createElement(
        "p",
        "",
        server.description ||
        server.short_description ||
        "ไม่มีคำอธิบาย"
      );

      description.append(
        heading,
        paragraph
      );

      // =====================================
      // INVITE BUTTON
      // =====================================

      const join = createElement(
        "a",
        "join-button",
        "เข้าร่วม Discord"
      );

      const invite = server.invite || "";

      // ตรวจสอบลิงก์ Discord

      try {

        const inviteURL = new URL(invite);

        const validHosts = [
          "discord.gg",
          "discord.com",
          "www.discord.com"
        ];

        if (
          inviteURL.protocol === "https:" &&
          validHosts.includes(inviteURL.hostname)
        ) {

          join.href = inviteURL.href;
          join.target = "_blank";
          join.rel = "noopener noreferrer";

        } else {

          throw new Error("ลิงก์ไม่ถูกต้อง");

        }

      } catch {

        join.textContent = "ไม่มีลิงก์เข้าร่วม";
        join.classList.add("disabled");
        join.removeAttribute("href");

      }

      // =====================================
      // DISPLAY CONTENT
      // =====================================

      container.replaceChildren(
        banner,
        profile,
        description,
        join
      );

    } catch (error) {

      console.error("Detail Error:", error);

      container.textContent =
        "ไม่สามารถโหลดข้อมูลเซิร์ฟเวอร์ได้";

    }

  }

  // =====================================
  // START
  // =====================================

  loadDetail();

});
