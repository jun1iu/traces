// Export a rendered page as an SVG with real text and named groups, for import into Figma.
// usage: npm run dev, then
//   node scripts/figma-export.cjs http://localhost:3000/runs design/figma/run-explorer-light light
// Needs Playwright with Chromium (not a project dependency).
const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const [url, out, scheme] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.addStyleTag({
    content:
      "nextjs-portal{display:none!important} *{animation:none!important;transition:none!important;caret-color:transparent!important}",
  });
  await p.waitForTimeout(1500);
  const svg = await p.evaluate(() => {
    const W = document.documentElement.scrollWidth,
      H = document.documentElement.scrollHeight;
    const ctx = document.createElement("canvas").getContext("2d");
    const pxc = document.createElement("canvas");
    pxc.width = pxc.height = 1;
    const px = pxc.getContext("2d", { willReadFrequently: true });
    const esc = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const r1 = (n) => Math.round(n * 10) / 10;
    const color = (c) => {
      let m = c.match(/rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[, /]+([\d.]+))?\)/);
      if (!m) {
        // oklab(), color-mix() and friends: let the browser convert by painting one pixel
        if (!c || c === "none" || c === "transparent" || /^url/.test(c)) return null;
        px.clearRect(0, 0, 1, 1);
        px.fillStyle = "#0000";
        px.fillStyle = c;
        px.fillRect(0, 0, 1, 1);
        const d = px.getImageData(0, 0, 1, 1).data;
        m = [null, d[0], d[1], d[2], d[3] / 255];
      }
      const a = m[4] === undefined ? 1 : +m[4];
      if (a === 0) return null;
      const hex = "#" + [m[1], m[2], m[3]].map((v) => (+v).toString(16).padStart(2, "0")).join("");
      return { hex, a };
    };
    const paint = (attr, c) =>
      c ? ` ${attr}="${c.hex}"${c.a < 1 ? ` ${attr}-opacity="${r1(c.a)}"` : ""}` : "";
    const family = (f) => (/mono/i.test(f) ? "Geist Mono" : "Geist");
    let clipN = 0,
      defs = "";

    function nameOf(el) {
      const label = el.getAttribute("aria-label");
      const role = el.getAttribute("role");
      const tag = el.tagName.toLowerCase();
      const text = (el.innerText || "").trim().split("\n")[0].slice(0, 32);
      if (role === "option" || role === "row") {
        // Skip the status icon's screen-reader text ("Passed,") and name the row after its task
        const title = (el.innerText || "")
          .split("\n")
          .map((l) => l.trim())
          .find((l) => l && !l.endsWith(","));
        return `run: ${title}`;
      }
      if (label) return `${role || tag}: ${label}`;
      if (/^h[1-6]$/.test(tag)) return `${tag}: ${text}`;
      if (tag === "button" || tag === "a") return `${tag === "a" ? "link" : "button"}: ${text}`;
      if (tag === "input") return `input: ${el.placeholder || el.type}`;
      if (role) return `${role}${text ? ": " + text : ""}`;
      if (
        [
          "header",
          "nav",
          "main",
          "section",
          "aside",
          "footer",
          "li",
          "table",
          "tr",
          "ul",
          "ol",
          "form",
        ].includes(tag)
      )
        return `${tag}${text ? ": " + text : ""}`;
      return null;
    }

    function textLines(node, cs) {
      const range = document.createRange();
      const s = node.textContent;
      const lines = [];
      for (let i = 0; i < s.length; i++) {
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const r = range.getClientRects()[0];
        if (!r || (r.width === 0 && s[i] !== " ")) continue;
        let line = lines.find((l) => Math.abs(l.top - r.top) < 2);
        if (!line) {
          line = { top: r.top, h: r.height, x: r.left, t: "" };
          lines.push(line);
        }
        line.x = Math.min(line.x, r.left);
        line.t += s[i];
      }
      const tt = cs.textTransform;
      return lines
        .map((l) => ({
          ...l,
          t: (tt === "uppercase"
            ? l.t.toUpperCase()
            : tt === "lowercase"
              ? l.t.toLowerCase()
              : l.t
          ).replace(/\s+/g, " "),
        }))
        .filter((l) => l.t.trim());
    }

    function textEl(t, x, top, h, cs) {
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = ctx.measureText("Hg");
      const asc = m.fontBoundingBoxAscent,
        desc = m.fontBoundingBoxDescent;
      const base = top + (h - (asc + desc)) / 2 + asc;
      const ls =
        cs.letterSpacing === "normal" ? "" : ` letter-spacing="${parseFloat(cs.letterSpacing)}"`;
      const lead = t.match(/^ */)[0].length;
      return `<text x="${r1(x)}" y="${r1(base + scrollY)}" font-family="${family(cs.fontFamily)}" font-size="${parseFloat(cs.fontSize)}" font-weight="${cs.fontWeight}"${ls}${paint("fill", color(cs.color))}${cs.fontStyle === "italic" ? ' font-style="italic"' : ""} xml:space="preserve">${esc(t.slice(lead).trimEnd())}</text>`;
    }

    function inlineSvg(el, r) {
      const clone = el.cloneNode(true);
      const src = [el, ...el.querySelectorAll("*")],
        dst = [clone, ...clone.querySelectorAll("*")];
      src.forEach((s, i) => {
        const cs = getComputedStyle(s),
          d = dst[i];
        d.removeAttribute("class");
        d.removeAttribute("style");
        if (s === el) return;
        for (const k of ["fill", "stroke"]) {
          const c = cs[k] === "none" ? null : color(cs[k]);
          if (cs[k] === "none") d.setAttribute(k, "none");
          else if (c) {
            d.setAttribute(k, c.hex);
            if (c.a < 1) d.setAttribute(k + "-opacity", r1(c.a));
          }
        }
        if (cs.strokeWidth) d.setAttribute("stroke-width", parseFloat(cs.strokeWidth));
        if (cs.opacity !== "1") d.setAttribute("opacity", cs.opacity);
        if (s.tagName === "text") {
          d.setAttribute("font-family", family(cs.fontFamily));
          d.setAttribute("font-size", parseFloat(cs.fontSize));
        }
      });
      const vb = el.getAttribute("viewBox") || `0 0 ${r.width} ${r.height}`;
      clone.setAttribute("x", r1(r.left));
      clone.setAttribute("y", r1(r.top + scrollY));
      clone.setAttribute("width", r1(r.width));
      clone.setAttribute("height", r1(r.height));
      clone.setAttribute("viewBox", vb);
      clone.removeAttribute("xmlns");
      let out = clone.outerHTML.replace(/<svg/, '<svg overflow="hidden"');
      // Rotated icons (an expanded row's chevron): carry the rotation over
      for (let e = el; e && e !== document.body; e = e.parentElement) {
        const ecs = getComputedStyle(e),
          t = ecs.transform;
        const m = t && t.match(/matrix\(([-\d.e]+), ([-\d.e]+)/);
        const rot = parseFloat(ecs.rotate) || 0; // Tailwind 4 uses the rotate property
        const deg = rot || (m ? Math.round((Math.atan2(+m[2], +m[1]) * 180) / Math.PI) : 0);
        {
          if (deg) {
            out = `<g transform="rotate(${deg} ${r1(r.left + r.width / 2)} ${r1(r.top + scrollY + r.height / 2)})">${out}</g>`;
            break;
          }
        }
      }
      return out;
    }

    function walk(el) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return "";
      const r = el.getBoundingClientRect();
      if (
        (r.width <= 1 && r.height <= 1 && /(hidden|clip)/.test(cs.overflow)) ||
        /rect\(0/.test(cs.clip) ||
        /inset\(50%/.test(cs.clipPath)
      )
        return ""; // screen-reader-only
      if (el.tagName.toLowerCase() === "svg") return r.width && r.height ? inlineSvg(el, r) : "";
      let out = "";
      const y = r.top + scrollY;
      const bg = color(cs.backgroundColor);
      const bw = ["Top", "Right", "Bottom", "Left"].map((s) => parseFloat(cs[`border${s}Width`]));
      const bc = ["Top", "Right", "Bottom", "Left"].map((s) => color(cs[`border${s}Color`]));
      const rad = parseFloat(cs.borderTopLeftRadius) || 0;
      const uniform =
        bw.every((w) => w === bw[0]) && bc.every((c) => c && bc[0] && c.hex === bc[0].hex);
      if (r.width && r.height && (bg || (uniform && bw[0] > 0))) {
        const sw = uniform && bw[0] > 0 ? bw[0] : 0;
        out += `<rect x="${r1(r.left + sw / 2)}" y="${r1(y + sw / 2)}" width="${r1(r.width - sw)}" height="${r1(r.height - sw)}"${rad ? ` rx="${r1(Math.min(rad, r.height / 2))}"` : ""}${bg ? paint("fill", bg) : ' fill="none"'}${sw ? paint("stroke", bc[0]) + ` stroke-width="${sw}"` : ""}/>`;
      }
      if (!uniform) {
        const [t, ri, bo, l] = bw;
        if (t && bc[0])
          out += `<rect x="${r1(r.left)}" y="${r1(y)}" width="${r1(r.width)}" height="${t}"${paint("fill", bc[0])}/>`;
        if (bo && bc[2])
          out += `<rect x="${r1(r.left)}" y="${r1(y + r.height - bo)}" width="${r1(r.width)}" height="${bo}"${paint("fill", bc[2])}/>`;
        if (l && bc[3])
          out += `<rect x="${r1(r.left)}" y="${r1(y)}" width="${l}" height="${r1(r.height)}"${paint("fill", bc[3])}/>`;
        if (ri && bc[1])
          out += `<rect x="${r1(r.right - ri)}" y="${r1(y)}" width="${ri}" height="${r1(r.height)}"${paint("fill", bc[1])}/>`;
      }
      if (el.tagName === "INPUT" && !el.value && el.placeholder) {
        const pcs = getComputedStyle(el, "::placeholder");
        out += textEl(
          el.placeholder,
          r.left + parseFloat(cs.paddingLeft) + bw[3],
          r.top,
          r.height,
          {
            ...pcs,
            fontFamily: cs.fontFamily,
            fontSize: cs.fontSize,
            fontWeight: cs.fontWeight,
            letterSpacing: cs.letterSpacing,
            fontStyle: cs.fontStyle,
            color: pcs.color,
          },
        );
      }
      for (const child of el.childNodes) {
        if (child.nodeType === 3 && child.textContent.trim())
          for (const l of textLines(child, cs)) out += textEl(l.t, l.x, l.top, l.h, cs);
        else if (child.nodeType === 1) out += walk(child);
      }
      if (!out) return "";
      const clips =
        /(hidden|auto|scroll|clip)/.test(cs.overflowX + cs.overflowY) && r.width && r.height;
      const name = nameOf(el);
      if (clips) {
        const id = `clip${++clipN}`;
        defs += `<clipPath id="${id}"><rect x="${r1(r.left)}" y="${r1(y)}" width="${r1(r.width)}" height="${r1(r.height)}"${rad ? ` rx="${r1(rad)}"` : ""}/></clipPath>`;
        out = `<g clip-path="url(#${id})">${out}</g>`;
      }
      return name ? `<g id="${esc(name)}">${out}</g>` : out;
    }

    const body = walk(document.body);
    const pageBg = color(getComputedStyle(document.body).backgroundColor) ||
      color(getComputedStyle(document.documentElement).backgroundColor) || { hex: "#ffffff", a: 1 };
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs><g id="Run explorer"><rect id="background" width="${W}" height="${H}" fill="${pageBg.hex}"/>${body}</g></svg>`;
  });
  fs.writeFileSync(`${out}.svg`, svg);
  await p.screenshot({ path: `${out}.png`, fullPage: true });
  console.log(out, (svg.length / 1024).toFixed(0) + " KB");
  await b.close();
})();
