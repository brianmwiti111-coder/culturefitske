"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingCart, Heart, Search, X, Plus, Minus, ChevronLeft,
  Star, MessageCircle, Package, LayoutGrid, AlertTriangle,
  Check, Trash2, User, Menu, Sparkles
} from "lucide-react";

// ---------------------------------------------------------------
// DESIGN TOKENS
// ---------------------------------------------------------------
const C = {
  bg: "#050b1a",
  bgRaise: "#0c1730",
  bgCard: "#0e1c3d",
  line: "#1c2c52",
  gold: "#d9a94e",
  goldSoft: "#f0d9a5",
  red: "#e8342a",
  redDeep: "#8f1a17",
  blue: "#2f6fdb",
  blueDeep: "#0f2c66",
  white: "#f4f6fb",
  mute: "#8d97b8",
};

const FONT_DISPLAY = "'Oswald', 'Arial Narrow', sans-serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";

// ---------------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------------
const SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];
const SLEEVES = ["Short", "Long"];
const FONTS = [
  { id: "classic", label: "Classic Block", family: "Arial, sans-serif", weight: 900 },
  { id: "sport", label: "Sport Italic", family: "'Oswald', sans-serif", weight: 700, style: "italic" },
  { id: "varsity", label: "Varsity Serif", family: "Georgia, serif", weight: 700 },
  { id: "stadium", label: "Stadium Bold", family: "'Anton', sans-serif", weight: 400 },
  { id: "streetwear", label: "Streetwear", family: "'Bebas Neue', sans-serif", weight: 400 },
  { id: "athletic", label: "Athletic Condensed", family: "'Teko', sans-serif", weight: 600 },
  { id: "signature", label: "Signature Script", family: "'Permanent Marker', cursive", weight: 400 },
  { id: "futuristic", label: "Futuristic", family: "'Orbitron', sans-serif", weight: 700 },
];

function makeStock() {
  const s = {};
  SIZES.forEach((sz) => {
    SLEEVES.forEach((sl) => {
      s[`${sz}-${sl}`] = Math.floor(Math.random() * 6);
    });
  });
  return s;
}

const KIT_TYPES = ["Home", "Away", "Third"];

const TEAMS = [
  { id: "coastal", name: "Coastal FC", kits: { Home: [C.red, C.blueDeep], Away: [C.blue, "#0a1530"], Third: [C.gold, C.redDeep] } },
  { id: "highland", name: "Highland United", kits: { Home: [C.blue, C.redDeep], Away: [C.red, "#0a1530"], Third: [C.gold, C.blueDeep] } },
  { id: "metro", name: "Metro City", kits: { Home: [C.gold, "#0a1530"], Away: [C.blue, C.redDeep], Third: [C.red, C.blueDeep] } },
  { id: "savanna", name: "Savanna Rangers", kits: { Home: [C.red, "#0a1530"], Away: [C.gold, C.blueDeep], Third: [C.blue, C.redDeep] } },
];

const DEFAULT_PRODUCTS = (() => {
  const list = [];
  let n = 1;
  TEAMS.forEach((team) => {
    KIT_TYPES.forEach((kit) => {
      ["Player Version", "Fan Version"].forEach((version) => {
        list.push({
          id: `p${n++}`,
          team: team.name,
          teamId: team.id,
          kit,
          name: `${team.name} ${kit} Kit`,
          type: version,
          price: version === "Player Version" ? 1500 : 1300,
          accent: team.kits[kit][0],
          accent2: team.kits[kit][1],
          rating: (4.5 + Math.round(Math.random() * 5) / 10).toFixed(1),
          reviews: Math.floor(Math.random() * 28) + 5,
          stock: makeStock(),
        });
      });
    });
    // Kids set, home colours
    list.push({
      id: `p${n++}`,
      team: team.name,
      teamId: team.id,
      kit: "Home",
      name: `${team.name} Home Kids Set`,
      type: "Kids Set",
      price: 1300,
      accent: team.kits.Home[0],
      accent2: team.kits.Home[1],
      rating: 4.8,
      reviews: Math.floor(Math.random() * 12) + 5,
      stock: makeStock(),
    });
  });
  return list;
})();

const DEFAULT_CUSTOM_FEE = 300; // starting value; admin can change this from Settings

// ---------------------------------------------------------------
// JERSEY GRAPHIC (signature element — every kit is drawn, not photographed,
// so customization renders live on the actual product art)
// ---------------------------------------------------------------
function JerseyArt({ accent, accent2, sleeve = "Short", name, number, font, namePosition = "below", designImage, big }) {
  const f = FONTS.find((x) => x.id === font) || FONTS[0];
  const h = big ? 340 : 200;
  const numberY = namePosition === "above" ? 205 : 185;
  const nameY = namePosition === "above" ? 130 : 220;
  const clipId = `clip-${accent}-${accent2}`.replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 300 300" width="100%" height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`g-${accent}-${accent2}`.replace(/[^a-zA-Z0-9]/g, "")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={accent2} />
        </linearGradient>
        <clipPath id={clipId}>
          <circle cx="150" cy="115" r="34" />
        </clipPath>
      </defs>
      <path
        d="M75,55 L120,30 L150,55 L180,30 L225,55 L255,90 L225,120 L215,105 L215,260 L85,260 L85,105 L75,120 L45,90 Z"
        fill={`url(#${`g-${accent}-${accent2}`.replace(/[^a-zA-Z0-9]/g, "")})`}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2"
      />
      <path d="M120,30 L150,55 L180,30 L165,45 L150,38 L135,45 Z" fill="#f4f6fb" />
      {sleeve === "Long" && (
        <>
          <path d="M45,90 L20,145 L45,165 L75,120 Z" fill={accent2} opacity="0.85" />
          <path d="M255,90 L280,145 L255,165 L225,120 Z" fill={accent2} opacity="0.85" />
        </>
      )}
      {designImage && (
        <>
          <image href={designImage} x="116" y="81" width="68" height="68" clipPath={`url(#${clipId})`} preserveAspectRatio="xMidYMid slice" />
          <circle cx="150" cy="115" r="34" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
        </>
      )}
      {number ? (
        <text
          x="150"
          y={numberY}
          textAnchor="middle"
          fontSize="70"
          fontWeight={f.weight}
          fontStyle={f.style || "normal"}
          fontFamily={f.family}
          fill="#ffffff"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="1.5"
        >
          {number}
        </text>
      ) : null}
      {name ? (
        <text
          x="150"
          y={nameY}
          textAnchor="middle"
          fontSize="20"
          fontWeight={f.weight}
          fontStyle={f.style || "normal"}
          fontFamily={f.family}
          letterSpacing="2"
          fill="#ffffff"
        >
          {name.toUpperCase()}
        </text>
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------
// SMALL UI PRIMITIVES
// ---------------------------------------------------------------
function Badge({ children, tone = "gold" }) {
  const map = {
    gold: { bg: "rgba(217,169,78,0.15)", fg: C.gold, bd: "rgba(217,169,78,0.4)" },
    red: { bg: "rgba(232,52,42,0.15)", fg: "#ff9088", bd: "rgba(232,52,42,0.4)" },
    mute: { bg: "rgba(141,151,184,0.12)", fg: C.mute, bd: "rgba(141,151,184,0.3)" },
  };
  const s = map[tone];
  return (
    <span
      style={{
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.bd}`,
        fontFamily: FONT_BODY,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "3px 9px",
        borderRadius: 999,
      }}
    >
      {children}
    </span>
  );
}

function Button({ children, onClick, variant = "solid", full, disabled, style }) {
  const base = {
    fontFamily: FONT_DISPLAY,
    fontSize: 15,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontWeight: 600,
    padding: "12px 20px",
    borderRadius: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "none",
    width: full ? "100%" : "auto",
    opacity: disabled ? 0.5 : 1,
    transition: "transform 0.15s ease, filter 0.15s ease",
  };
  const variants = {
    solid: { background: `linear-gradient(135deg, ${C.gold}, #b8843a)`, color: "#1a1204" },
    outline: { background: "transparent", color: C.white, border: `1px solid ${C.line}` },
    ghost: { background: "transparent", color: C.mute },
    danger: { background: "rgba(232,52,42,0.15)", color: "#ff9088", border: `1px solid rgba(232,52,42,0.4)` },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.filter = "brightness(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
    >
      {children}
    </button>
  );
}

function SectionLabel({ eyebrow, title }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div
          style={{
            fontFamily: FONT_BODY,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: C.gold,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {eyebrow}
        </div>
      )}
      <h2
        style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 30,
          fontWeight: 600,
          color: C.white,
          textTransform: "uppercase",
          letterSpacing: "0.02em",
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

// ---------------------------------------------------------------
// LOGO (matches the delivered badge concept, simplified for header use)
// ---------------------------------------------------------------
let logoInstanceCount = 0;
function Logo({ height = 40 }) {
  const uid = useMemo(() => `logo${logoInstanceCount++}`, []);
  const width = height * 1.8;
  return (
    <svg width={width} height={height} viewBox="0 0 900 500" style={{ display: "block" }}>
      <defs>
        <radialGradient id={`atmos-${uid}`} cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#1A1220" />
          <stop offset="55%" stopColor="#0C0A14" />
          <stop offset="100%" stopColor="#020103" />
        </radialGradient>
        <linearGradient id={`blue-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8FE3FF" />
          <stop offset="100%" stopColor="#1E63FF" />
        </linearGradient>
        <linearGradient id={`red-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF8A6B" />
          <stop offset="100%" stopColor="#C81E3A" />
        </linearGradient>
        <radialGradient id={`redHaze-${uid}`} cx="40%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#E22B2B" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#E22B2B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`blueHaze-${uid}`} cx="60%" cy="55%" r="45%">
          <stop offset="0%" stopColor="#2979FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2979FF" stopOpacity="0" />
        </radialGradient>
        <filter id={`glowBlue-${uid}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`glowRed-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id={`vig-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
          <stop offset="18%" stopColor="#000000" stopOpacity="0" />
          <stop offset="82%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
        </linearGradient>
        <path id={`bottomArc-${uid}`} d="M 309 240 A 141 141 0 0 1 591 240" fill="none" />
      </defs>

      <rect width="900" height="500" fill={`url(#atmos-${uid})`} />

      <ellipse cx="400" cy="200" rx="180" ry="150" fill={`url(#redHaze-${uid})`} />
      <ellipse cx="530" cy="280" rx="160" ry="140" fill={`url(#blueHaze-${uid})`} />

      <g opacity="0.08" stroke="#DCE6F5" strokeWidth="1">
        <line x1="450" y1="0" x2="290" y2="500" />
        <line x1="450" y1="0" x2="410" y2="500" />
        <line x1="450" y1="0" x2="550" y2="500" />
        <line x1="450" y1="0" x2="670" y2="500" />
      </g>

      <g fill="#DCE6F5">
        <circle cx="320" cy="120" r="1" opacity="0.5" />
        <circle cx="590" cy="380" r="1.1" opacity="0.4" />
        <circle cx="290" cy="360" r="0.8" opacity="0.5" />
        <circle cx="610" cy="140" r="0.9" opacity="0.4" />
      </g>

      <circle cx="450" cy="240" r="150" fill="none" stroke={`url(#blue-${uid})`} strokeWidth="2" filter={`url(#glowBlue-${uid})`} opacity="0.85" />
      <circle cx="450" cy="240" r="132" fill="none" stroke={`url(#red-${uid})`} strokeWidth="1.2" opacity="0.5" />

      <path d="M 530 160 A 90 90 0 1 0 530 320" fill="none" stroke={`url(#red-${uid})`} strokeWidth="30" strokeLinecap="round" filter={`url(#glowRed-${uid})`} />

      <text x="410" y="272" fontFamily="Consolas, 'Courier New', monospace" fontWeight="700" fontSize="118" fill={`url(#blue-${uid})`} filter={`url(#glowBlue-${uid})`}>F</text>
      <text x="468" y="272" fontFamily="Consolas, 'Courier New', monospace" fontWeight="700" fontSize="118" fill={`url(#blue-${uid})`} filter={`url(#glowBlue-${uid})`}>K</text>

      <circle cx="508" cy="240" r="3.5" fill="#FFB199" filter={`url(#glowRed-${uid})`} />
      <circle cx="445" cy="240" r="3.5" fill="#8FE3FF" filter={`url(#glowBlue-${uid})`} />

      <path d="M 360 300 L 550 300" stroke={`url(#red-${uid})`} strokeWidth="2.5" strokeDasharray="10 8" opacity="0.7" />

      <text fontFamily="Consolas, 'Courier New', monospace" fontWeight="700" letterSpacing="4" fontSize="20" fill={`url(#blue-${uid})`} filter={`url(#glowBlue-${uid})`} dominantBaseline="middle">
        <textPath href={`#bottomArc-${uid}`} startOffset="50%" textAnchor="middle">CULTURE FITS KE</textPath>
      </text>

      <rect width="900" height="500" fill={`url(#vig-${uid})`} />
    </svg>
  );
}

// ---------------------------------------------------------------
// HEADER / NAV
// ---------------------------------------------------------------
function Header({ view, setView, cartCount, wishlistCount, isAdmin, setIsAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = [
    { id: "home", label: "Home" },
    { id: "shop", label: "Shop" },
    { id: "wishlist", label: `Wishlist${wishlistCount ? ` (${wishlistCount})` : ""}` },
  ];
  return (
    <header
      style={{
        background: "rgba(5,11,26,0.92)",
        borderBottom: `1px solid ${C.line}`,
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5" style={{ height: 68 }}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView("home")}>
          <Logo height={40} />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, color: C.white, letterSpacing: "0.03em", textTransform: "uppercase" }}>
            CultureFits<span style={{ color: C.gold }}>Ke</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-7">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              style={{
                fontFamily: FONT_BODY,
                fontSize: 14,
                fontWeight: 600,
                color: view === n.id ? C.gold : C.mute,
                background: "none",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            title="Toggle admin view (demo)"
            style={{
              display: "none",
            }}
          />
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            style={{
              background: "none", border: `1px solid ${C.line}`, borderRadius: 6,
              color: C.mute, fontFamily: FONT_BODY, fontSize: 12, padding: "6px 10px",
              cursor: "pointer", marginRight: 6,
            }}
          >
            {isAdmin ? "Exit Admin" : "Admin"}
          </button>
          <button onClick={() => setView("cart")} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            <ShoppingCart size={22} color={C.white} />
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: 0, right: 0, background: C.red, color: "#fff",
                fontSize: 10, fontWeight: 700, borderRadius: 999, width: 16, height: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{cartCount}</span>
            )}
          </button>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", padding: 8 }}>
            <Menu size={22} color={C.white} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden flex flex-col px-5 pb-4 gap-3">
          {nav.map((n) => (
            <button
              key={n.id}
              onClick={() => { setView(n.id); setMenuOpen(false); }}
              style={{ textAlign: "left", background: "none", border: "none", color: C.white, fontFamily: FONT_BODY, fontSize: 15 }}
            >
              {n.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

// ---------------------------------------------------------------
// HOME VIEW
// ---------------------------------------------------------------
function Home({ setView, openProduct, wishlist, toggleWishlist, products, customizationFee }) {
  return (
    <div>
      {/* HERO */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: `radial-gradient(circle at 50% 20%, ${C.bgRaise}, ${C.bg} 70%)`,
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-5 py-20 flex flex-col items-center text-center relative z-10">
          <Badge tone="gold">Local Home Delivery</Badge>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(40px, 7vw, 76px)",
              lineHeight: 1.02,
              color: C.white,
              textTransform: "uppercase",
              letterSpacing: "0.01em",
              margin: "18px 0 14px",
            }}
          >
            Wear Your<br /><span style={{ color: C.gold }}>Colours</span>
          </h1>
          <p style={{ fontFamily: FONT_BODY, color: C.mute, fontSize: 17, maxWidth: 480, margin: "0 auto 30px" }}>
            Player & fan kits, kids sets, and name-and-number customization —
            built one order at a time, made just for you.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => setView("shop")}>Shop the Range</Button>
            <Button variant="outline" onClick={() => setView("shop")}>Kids Sets</Button>
          </div>
        </div>
        {/* Ambient jersey silhouettes */}
        <div style={{ position: "absolute", right: -60, top: 10, opacity: 0.18, transform: "rotate(8deg)" }}>
          <JerseyArt accent={C.red} accent2={C.blueDeep} big />
        </div>
        <div style={{ position: "absolute", left: -80, bottom: -40, opacity: 0.12, transform: "rotate(-10deg)" }}>
          <JerseyArt accent={C.blue} accent2={C.redDeep} big />
        </div>
      </section>

      {/* KIT TYPES */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <SectionLabel eyebrow="Choose your fit" title="Three Kinds of Kit" />
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { t: "Player Version", p: "KSh 1,500", d: "Match-spec cut, premium finish." },
            { t: "Fan Version", p: "KSh 1,300", d: "Everyday comfort, same colours." },
            { t: "Kids Set", p: "KSh 1,300", d: "Jersey + shorts, sized for juniors." },
          ].map((k) => (
            <div key={k.t} style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 10, padding: 24 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.white, textTransform: "uppercase" }}>{k.t}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.gold, margin: "6px 0" }}>{k.p}</div>
              <p style={{ fontFamily: FONT_BODY, color: C.mute, fontSize: 14 }}>{k.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <SectionLabel eyebrow="Fresh in stock" title="Featured Kits" />
        <ProductGrid products={products.slice(0, 3)} openProduct={openProduct} wishlist={wishlist} toggleWishlist={toggleWishlist} />
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={() => setView("shop")}>View Full Shop</Button>
        </div>
      </section>

      {/* CUSTOMIZATION CALLOUT */}
      <section style={{ background: C.bgRaise, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
        <div className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge tone="red">+ KSh {customizationFee} add-on</Badge>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: C.white, textTransform: "uppercase", margin: "14px 0" }}>
              Make it <span style={{ color: C.gold }}>Yours</span>
            </h3>
            <p style={{ fontFamily: FONT_BODY, color: C.mute, fontSize: 15, marginBottom: 20 }}>
              Add your name and number, pick a font, and preview the print on
              the actual jersey before you buy — no surprises at checkout.
            </p>
            <Button onClick={() => setView("shop")}>Try It On a Kit</Button>
          </div>
          <div style={{ background: C.bgCard, borderRadius: 12, border: `1px solid ${C.line}`, padding: 20 }}>
            <JerseyArt accent={C.blue} accent2={C.redDeep} name="Brian" number="10" font="sport" />
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------
// PRODUCT GRID / CARD
// ---------------------------------------------------------------
function ProductGrid({ products, openProduct, wishlist, toggleWishlist }) {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
      {products.map((p) => {
        const totalStock = Object.values(p.stock).reduce((a, b) => a + b, 0);
        const low = totalStock > 0 && totalStock <= 6;
        const out = totalStock === 0;
        const liked = wishlist.includes(p.id);
        return (
          <div
            key={p.id}
            style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 10, overflow: "hidden", cursor: "pointer" }}
            onClick={() => openProduct(p.id)}
          >
            <div style={{ background: `linear-gradient(160deg, ${C.bgRaise}, #060c1c)`, position: "relative" }}>
              <button
                onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
                style={{ position: "absolute", top: 10, right: 10, zIndex: 2, background: "rgba(5,11,26,0.7)", border: "none", borderRadius: 999, padding: 7 }}
              >
                <Heart size={16} color={liked ? C.red : C.white} fill={liked ? C.red : "none"} />
              </button>
              <div style={{ position: "absolute", top: 10, left: 10, zIndex: 2 }}>
                {out ? <Badge tone="red">Sold Out</Badge> : low ? <Badge tone="red">Low Stock</Badge> : null}
              </div>
              <div style={{ position: "absolute", bottom: 10, left: 10, zIndex: 2 }}>
                <Badge tone="mute">{p.kit} Kit</Badge>
              </div>
              {p.photos && p.photos.length > 0 ? (
                <img src={p.photos[0]} alt={p.name} style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
              ) : (
                <JerseyArt accent={p.accent} accent2={p.accent2} />
              )}
            </div>
            <div className="p-4">
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{p.team} · {p.type}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, color: C.white, textTransform: "uppercase", margin: "3px 0 6px" }}>{p.name}</div>
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.gold }}>KSh {p.price.toLocaleString()}</span>
                <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, display: "flex", alignItems: "center", gap: 4 }}>
                  <Star size={12} fill={C.gold} color={C.gold} /> {p.rating} ({p.reviews})
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------
// SHOP VIEW
// ---------------------------------------------------------------
function Shop({ openProduct, wishlist, toggleWishlist, products }) {
  const [team, setTeam] = useState("All");
  const [kit, setKit] = useState("All");
  const [filter, setFilter] = useState("All");
  const types = ["All", "Player Version", "Fan Version", "Kids Set"];
  const teamOptions = ["All", ...Array.from(new Set(products.map((p) => p.team)))];
  const kitOptions = ["All", ...KIT_TYPES];

  const filtered = products.filter((p) =>
    (filter === "All" || p.type === filter) &&
    (team === "All" || p.team === team) &&
    (kit === "All" || p.kit === kit)
  );

  const FilterRow = ({ label, options, value, onChange }) => (
    <div className="mb-4">
      <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mute, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
      <div className="flex gap-2 flex-wrap">
        {options.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            style={{
              fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 999,
              border: `1px solid ${value === t ? C.gold : C.line}`,
              color: value === t ? C.gold : C.mute,
              background: value === t ? "rgba(217,169,78,0.1)" : "transparent",
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      <SectionLabel eyebrow="Full Range" title="Shop All Kits" />
      <FilterRow label="Team" options={teamOptions} value={team} onChange={setTeam} />
      <FilterRow label="Kit" options={kitOptions} value={kit} onChange={setKit} />
      <FilterRow label="Version" options={types} value={filter} onChange={setFilter} />
      <div className="mt-6">
        <ProductGrid products={filtered} openProduct={openProduct} wishlist={wishlist} toggleWishlist={toggleWishlist} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// PRODUCT DETAIL VIEW
// ---------------------------------------------------------------
function ProductDetail({ product, setView, addToCart, wishlist, toggleWishlist, customizationFee }) {
  const [size, setSize] = useState("M");
  const [sleeve, setSleeve] = useState("Short");
  const [customize, setCustomize] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [font, setFont] = useState("classic");
  const [namePosition, setNamePosition] = useState("below");
  const [designImage, setDesignImage] = useState(null);

  const handleDesignUpload = (fileList) => {
    const file = fileList[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDesignImage(reader.result);
    reader.readAsDataURL(file);
  };
  const [added, setAdded] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const stockKey = `${size}-${sleeve}`;
  const stockLeft = product.stock[stockKey] ?? 0;
  const liked = wishlist.includes(product.id);
  const total = product.price + (customize ? customizationFee : 0);
  const hasPhotos = product.photos && product.photos.length > 0;

  const handleAdd = () => {
    addToCart({
      id: `${product.id}-${size}-${sleeve}-${customize ? name + number + font : "std"}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      type: product.type,
      accent: product.accent,
      accent2: product.accent2,
      size, sleeve,
      customization: customize ? { name, number, font, namePosition, designImage } : null,
      price: total,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <button onClick={() => setView("shop")} style={{ background: "none", border: "none", color: C.mute, display: "flex", alignItems: "center", gap: 6, fontFamily: FONT_BODY, fontSize: 13, marginBottom: 20, cursor: "pointer" }}>
        <ChevronLeft size={16} /> Back to shop
      </button>
      <div className="grid md:grid-cols-2 gap-10">
        <div style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 12, padding: 20 }}>
          {customize ? (
            <>
              <JerseyArt accent={product.accent} accent2={product.accent2} sleeve={sleeve} name={name} number={number} font={font} namePosition={namePosition} designImage={designImage} big />
              {(name || number) && (
                <div className="flex items-center gap-2 justify-center mt-3">
                  <Sparkles size={14} color={C.gold} />
                  <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute }}>Live preview — this is exactly how it prints</span>
                </div>
              )}
            </>
          ) : hasPhotos ? (
            <>
              <img src={product.photos[activePhoto]} alt={product.name} style={{ width: "100%", height: 340, objectFit: "cover", borderRadius: 8, display: "block" }} />
              <div className="flex gap-2 justify-center mt-3 flex-wrap">
                {product.photos.map((src, i) => (
                  <button key={i} onClick={() => setActivePhoto(i)} style={{
                    padding: 0, border: `2px solid ${activePhoto === i ? C.gold : "transparent"}`, borderRadius: 6, cursor: "pointer", background: "none",
                  }}>
                    <img src={src} alt={`${product.name} thumbnail ${i + 1}`} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 4, display: "block" }} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <JerseyArt accent={product.accent} accent2={product.accent2} sleeve={sleeve} big />
          )}
        </div>

        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{product.team} · {product.kit} Kit · {product.type}</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 34, color: C.white, textTransform: "uppercase", margin: "4px 0 8px" }}>{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.gold }}>KSh {total.toLocaleString()}</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mute, display: "flex", alignItems: "center", gap: 4 }}>
              <Star size={13} fill={C.gold} color={C.gold} /> {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          {/* Size */}
          <div className="mb-5">
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 8 }}>Size</div>
            <div className="flex gap-2 flex-wrap">
              {SIZES.map((s) => (
                <button key={s} onClick={() => setSize(s)} style={{
                  width: 44, height: 40, borderRadius: 6, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13,
                  border: `1px solid ${size === s ? C.gold : C.line}`,
                  background: size === s ? "rgba(217,169,78,0.12)" : "transparent",
                  color: size === s ? C.gold : C.white, cursor: "pointer",
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* Sleeve */}
          <div className="mb-5">
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 8 }}>Sleeve</div>
            <div className="flex gap-2">
              {SLEEVES.map((s) => (
                <button key={s} onClick={() => setSleeve(s)} style={{
                  padding: "9px 18px", borderRadius: 6, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13,
                  border: `1px solid ${sleeve === s ? C.gold : C.line}`,
                  background: sleeve === s ? "rgba(217,169,78,0.12)" : "transparent",
                  color: sleeve === s ? C.gold : C.white, cursor: "pointer",
                }}>{s} Sleeve</button>
              ))}
            </div>
          </div>

          {/* Stock */}
          <div className="mb-5 flex items-center gap-2">
            {stockLeft === 0 ? (
              <Badge tone="red">Out of stock in this size</Badge>
            ) : stockLeft <= 2 ? (
              <Badge tone="red">Only {stockLeft} left</Badge>
            ) : (
              <Badge tone="mute">In stock</Badge>
            )}
          </div>

          {/* Customization */}
          <div style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={customize} onChange={(e) => setCustomize(e.target.checked)} style={{ width: 18, height: 18, accentColor: C.gold }} />
              <span style={{ fontFamily: FONT_BODY, fontWeight: 700, color: C.white, fontSize: 14 }}>
                Add name & number customization <span style={{ color: C.gold }}>(+KSh {customizationFee})</span>
              </span>
            </label>

            {customize && (
              <div className="mt-4 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 5 }}>Name</div>
                    <input value={name} maxLength={12} onChange={(e) => setName(e.target.value)} placeholder="e.g. BRIAN"
                      style={{ width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6, padding: "9px 11px", color: C.white, fontFamily: FONT_BODY }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 5 }}>Number</div>
                    <input value={number} maxLength={2} onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 10"
                      style={{ width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6, padding: "9px 11px", color: C.white, fontFamily: FONT_BODY }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 5 }}>Font style</div>
                  <div className="flex gap-2 flex-wrap">
                    {FONTS.map((f) => (
                      <button key={f.id} onClick={() => setFont(f.id)} style={{
                        padding: "7px 14px", borderRadius: 6, fontSize: 13,
                        border: `1px solid ${font === f.id ? C.gold : C.line}`,
                        background: font === f.id ? "rgba(217,169,78,0.12)" : "transparent",
                        color: font === f.id ? C.gold : C.white, cursor: "pointer",
                        fontFamily: f.family, fontWeight: f.weight, fontStyle: f.style || "normal",
                      }}>{f.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 5 }}>Name position</div>
                  <div className="flex gap-2">
                    {[
                      { id: "above", label: "Name above number" },
                      { id: "below", label: "Name below number" },
                    ].map((opt) => (
                      <button key={opt.id} onClick={() => setNamePosition(opt.id)} style={{
                        padding: "8px 14px", borderRadius: 6, fontSize: 13, fontFamily: FONT_BODY, fontWeight: 600,
                        border: `1px solid ${namePosition === opt.id ? C.gold : C.line}`,
                        background: namePosition === opt.id ? "rgba(217,169,78,0.12)" : "transparent",
                        color: namePosition === opt.id ? C.gold : C.white, cursor: "pointer",
                      }}>{opt.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 5 }}>
                    Upload your own design (optional) — badge, crest, or graphic
                  </div>
                  {designImage ? (
                    <div className="flex items-center gap-3">
                      <img src={designImage} alt="Custom design" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.line}` }} />
                      <button onClick={() => setDesignImage(null)} style={{
                        background: "none", border: `1px solid ${C.line}`, borderRadius: 6, padding: "6px 12px",
                        color: C.mute, fontFamily: FONT_BODY, fontSize: 12, cursor: "pointer",
                      }}>Remove</button>
                    </div>
                  ) : (
                    <label style={{
                      display: "inline-flex", alignItems: "center", gap: 8, border: `1px dashed ${C.line}`,
                      borderRadius: 6, padding: "9px 14px", cursor: "pointer", background: C.bg,
                    }}>
                      <Plus size={14} color={C.mute} />
                      <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute }}>Choose image</span>
                      <input type="file" accept="image/*" hidden onChange={(e) => handleDesignUpload(e.target.files)} />
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button full disabled={stockLeft === 0} onClick={handleAdd}>
              {added ? <><Check size={16} /> Added</> : <><ShoppingCart size={16} /> Add to Cart</>}
            </Button>
            <Button variant="outline" onClick={() => toggleWishlist(product.id)}>
              <Heart size={16} color={liked ? C.red : C.white} fill={liked ? C.red : "none"} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// CART VIEW
// ---------------------------------------------------------------
function Cart({ cart, updateQty, removeItem, setView }) {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  return (
    <div className="max-w-4xl mx-auto px-5 py-14">
      <SectionLabel eyebrow="Review order" title="Your Cart" />
      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontFamily: FONT_BODY, color: C.mute, marginBottom: 16 }}>Your cart is empty.</p>
          <Button onClick={() => setView("shop")}>Browse Kits</Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 mb-8">
            {cart.map((item) => (
              <div key={item.id} style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 70, background: C.bgRaise, borderRadius: 8 }}>
                  <JerseyArt accent={item.accent} accent2={item.accent2} sleeve={item.sleeve} name={item.customization?.name} number={item.customization?.number} font={item.customization?.font} namePosition={item.customization?.namePosition} designImage={item.customization?.designImage} />
                </div>
                <div className="flex-1">
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: C.white, textTransform: "uppercase" }}>{item.name}</div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute }}>
                    {item.size} · {item.sleeve} Sleeve{item.customization ? ` · "${item.customization.name}" #${item.customization.number}` : ""}
                  </div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: C.gold, marginTop: 4 }}>KSh {item.price.toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.id, -1)} style={{ background: C.bgRaise, border: `1px solid ${C.line}`, borderRadius: 6, padding: 6, cursor: "pointer" }}><Minus size={14} color={C.white} /></button>
                  <span style={{ fontFamily: FONT_BODY, color: C.white, width: 18, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ background: C.bgRaise, border: `1px solid ${C.line}`, borderRadius: 6, padding: 6, cursor: "pointer" }}><Plus size={14} color={C.white} /></button>
                </div>
                <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <Trash2 size={17} color={C.mute} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 10, padding: 20 }}>
            <div className="flex justify-between mb-2" style={{ fontFamily: FONT_BODY, color: C.mute, fontSize: 14 }}>
              <span>Subtotal</span><span style={{ color: C.white }}>KSh {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-4" style={{ fontFamily: FONT_BODY, color: C.mute, fontSize: 13 }}>
              <span>Delivery fee</span><span>Confirmed by us via WhatsApp after checkout</span>
            </div>
            <Button full onClick={() => setView("checkout")}>Proceed to Checkout</Button>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// WISHLIST VIEW
// ---------------------------------------------------------------
function Wishlist({ wishlist, toggleWishlist, openProduct, products }) {
  const items = products.filter((p) => wishlist.includes(p.id));
  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      <SectionLabel eyebrow="Saved for later" title="Your Wishlist" />
      {items.length === 0 ? (
        <p style={{ fontFamily: FONT_BODY, color: C.mute }}>Nothing saved yet — tap the heart on any kit to add it here.</p>
      ) : (
        <ProductGrid products={items} openProduct={openProduct} wishlist={wishlist} toggleWishlist={toggleWishlist} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// CHECKOUT VIEW
// ---------------------------------------------------------------
function Checkout({ cart, setView, placeOrder, paybillNumber, paybillAccountNote }) {
  const [form, setForm] = useState({ name: "", phone: "", location: "", notes: "" });
  const [payment, setPayment] = useState("mpesa");
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const canSubmit = form.name && form.phone && form.location && cart.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <SectionLabel eyebrow="Almost there" title="Checkout" />
      <div style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 10, padding: 22, marginBottom: 20 }}>
        <div className="flex items-start gap-3">
          <MessageCircle size={20} color={C.gold} style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mute, margin: 0 }}>
            We'll send your final total, including the delivery fee for your area, on WhatsApp
            (SMS as backup) before you pay. Nothing is charged until you confirm.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your name" />
        <Field label="Phone number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="07XX XXX XXX" />
        <Field label="Delivery location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="Estate / area, town" />
        <Field label="Notes (optional)" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Landmark, delivery time preference, etc." />
      </div>

      <div className="mb-6">
        <div style={{ fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 8 }}>Payment method</div>
        <div className="flex gap-2">
          {[{ id: "mpesa", label: "M-Pesa" }, { id: "cash", label: "Cash on Delivery" }].map((m) => (
            <button key={m.id} onClick={() => setPayment(m.id)} style={{
              padding: "10px 18px", borderRadius: 6, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13,
              border: `1px solid ${payment === m.id ? C.gold : C.line}`,
              background: payment === m.id ? "rgba(217,169,78,0.12)" : "transparent",
              color: payment === m.id ? C.gold : C.white, cursor: "pointer",
            }}>{m.label}</button>
          ))}
        </div>

        {payment === "mpesa" && (
          <div style={{ background: C.bgCard, border: `1px solid ${C.gold}`, borderRadius: 8, padding: 16, marginTop: 12 }}>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 6 }}>Pay via M-Pesa Paybill</div>
            {paybillNumber ? (
              <>
                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mute }}>Paybill Number</div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.gold, letterSpacing: "0.04em" }}>{paybillNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mute }}>Account Number</div>
                    <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.white }}>{paybillAccountNote || "Your order number"}</div>
                  </div>
                </div>
                <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginTop: 10, marginBottom: 0 }}>
                  We'll confirm your final total (including delivery) before you pay — use your order number as the account reference so we can match your payment.
                </p>
              </>
            ) : (
              <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, margin: 0 }}>
                Paybill details will be confirmed with you on WhatsApp along with your final total.
              </p>
            )}
          </div>
        )}
      </div>

      <div style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <div className="flex justify-between" style={{ fontFamily: FONT_BODY, color: C.mute, fontSize: 14 }}>
          <span>Items subtotal</span><span style={{ color: C.white }}>KSh {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between mt-1" style={{ fontFamily: FONT_BODY, color: C.mute, fontSize: 13 }}>
          <span>Delivery fee</span><span>To be confirmed via WhatsApp</span>
        </div>
      </div>

      <Button full disabled={!canSubmit} onClick={() => placeOrder(form, payment, subtotal)}>
        Submit Order Request
      </Button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 5 }}>{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6, padding: "11px 13px", color: C.white, fontFamily: FONT_BODY }} />
    </div>
  );
}

// ---------------------------------------------------------------
// ORDER CONFIRMATION
// ---------------------------------------------------------------
function OrderConfirmed({ setView, paybillNumber, paybillAccountNote }) {
  return (
    <div className="max-w-lg mx-auto px-5 py-24 text-center">
      <div style={{ width: 64, height: 64, borderRadius: 999, background: "rgba(217,169,78,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <Check size={30} color={C.gold} />
      </div>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.white, textTransform: "uppercase", marginBottom: 10 }}>Request Received</h2>
      <p style={{ fontFamily: FONT_BODY, color: C.mute, fontSize: 14, marginBottom: 24 }}>
        We're reviewing your order and will message you on WhatsApp shortly with
        the delivery fee and final total to confirm before payment.
      </p>
      {paybillNumber && (
        <div style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 10, padding: 16, marginBottom: 24, textAlign: "left" }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 6 }}>If paying by M-Pesa Paybill</div>
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mute }}>Paybill Number</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.gold }}>{paybillNumber}</div>
            </div>
            <div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mute }}>Account Number</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.white }}>{paybillAccountNote || "Your order number"}</div>
            </div>
          </div>
        </div>
      )}
      <Button onClick={() => setView("home")}>Back to Home</Button>
    </div>
  );
}

// ---------------------------------------------------------------
// ADMIN — DASHBOARD
// ---------------------------------------------------------------
function AdminDashboard({ orders, products }) {
  const revenue = orders.reduce((s, o) => s + o.subtotal, 0);
  const lowStockCount = products.reduce((count, p) => {
    const flagged = Object.values(p.stock).filter((v) => v > 0 && v <= 2).length;
    return count + (flagged > 0 ? 1 : 0);
  }, 0);

  return (
    <div className="grid sm:grid-cols-3 gap-4 mb-8">
      {[
        { label: "Orders (pending)", value: orders.length, icon: Package },
        { label: "Revenue (subtotal)", value: `KSh ${revenue.toLocaleString()}`, icon: LayoutGrid },
        { label: "Low-stock kits", value: lowStockCount, icon: AlertTriangle },
      ].map((s) => (
        <div key={s.label} style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 10, padding: 18 }}>
          <s.icon size={18} color={C.gold} />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.white, margin: "8px 0 2px" }}>{s.value}</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------
// ADMIN — ORDERS (set delivery fee, confirm via WhatsApp, update status)
// ---------------------------------------------------------------
const STATUS_FLOW = ["Requested", "Awaiting Confirmation", "Confirmed", "Processing", "Out for Delivery", "Delivered"];

function AdminOrders({ orders, updateOrder, paybillNumber, paybillAccountNote }) {
  if (orders.length === 0) {
    return <p style={{ fontFamily: FONT_BODY, color: C.mute }}>No orders yet. Orders placed by customers will show up here.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {orders.map((o) => {
        const total = o.subtotal + (Number(o.deliveryFee) || 0);
        const payWithPaybill = o.payment === "mpesa" && paybillNumber;
        const waMessage = encodeURIComponent(
          `Hi ${o.form.name}, thanks for your CultureFitsKe order! Delivery to ${o.form.location} is KSh ${o.deliveryFee || "___"}. Your total is KSh ${total.toLocaleString()}.` +
          (payWithPaybill ? ` Pay via M-Pesa Paybill ${paybillNumber}, Account Number: ${o.id} (${paybillAccountNote || "your order number"}).` : "") +
          ` Reply YES to confirm and we'll get it moving.`
        );
        const phoneDigits = o.form.phone.replace(/[^0-9]/g, "");
        return (
          <div key={o.id} style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 10, padding: 18 }}>
            <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
              <div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.white }}>{o.form.name} · {o.form.phone}</div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute }}>{o.form.location} · {o.payment === "mpesa" ? "M-Pesa" : "Cash on Delivery"}</div>
              </div>
              <Badge tone="gold">{o.status}</Badge>
            </div>

            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.mute, marginBottom: 10 }}>
              {o.items.map((i) => `${i.qty}× ${i.name} (${i.size}/${i.sleeve})`).join(", ")}
            </div>

            <div className="flex flex-wrap items-end gap-3 mb-3">
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mute, marginBottom: 4 }}>Subtotal</div>
                <div style={{ fontFamily: FONT_DISPLAY, color: C.white, fontSize: 15 }}>KSh {o.subtotal.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mute, marginBottom: 4 }}>Delivery fee (KSh)</div>
                <input
                  type="number"
                  value={o.deliveryFee}
                  onChange={(e) => updateOrder(o.id, { deliveryFee: e.target.value })}
                  placeholder="Set fee"
                  style={{ width: 100, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6, padding: "7px 9px", color: C.white, fontFamily: FONT_BODY }}
                />
              </div>
              <div>
                <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.mute, marginBottom: 4 }}>Total</div>
                <div style={{ fontFamily: FONT_DISPLAY, color: C.gold, fontSize: 16 }}>KSh {total.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/${phoneDigits}?text=${waMessage}`}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none" }}
                onClick={() => updateOrder(o.id, { status: "Awaiting Confirmation" })}
              >
                <Button variant="solid" style={{ padding: "9px 16px", fontSize: 13 }}>
                  <MessageCircle size={14} /> Confirm Total via WhatsApp
                </Button>
              </a>
              <select
                value={o.status}
                onChange={(e) => updateOrder(o.id, { status: e.target.value })}
                style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6, padding: "9px 11px", color: C.white, fontFamily: FONT_BODY, fontSize: 13 }}
              >
                {STATUS_FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------
// ADMIN — PRODUCTS / STOCK
// ---------------------------------------------------------------
function AddProductForm({ addProduct, products }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    team: "", kit: "Home", version: "Player Version", price: 1500, accent: C.red, accent2: C.blue, photos: [],
  });

  const MIN_PHOTOS = 3;
  const MAX_PHOTOS = 6;

  const colorChoices = [
    { label: "Red", hex: C.red }, { label: "Blue", hex: C.blue }, { label: "Gold", hex: C.gold },
    { label: "Deep Red", hex: C.redDeep }, { label: "Deep Blue", hex: C.blueDeep }, { label: "Navy", hex: "#0a1530" },
  ];

  const handleFiles = (fileList) => {
    const files = Array.from(fileList).slice(0, MAX_PHOTOS - form.photos.length);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((f) => ({ ...f, photos: [...f.photos, reader.result].slice(0, MAX_PHOTOS) }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx) => setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));

  const canSave = form.team.trim() && form.photos.length >= MIN_PHOTOS;

  const handleAdd = () => {
    if (!canSave) return;
    const id = `custom-${Date.now()}`;
    addProduct({
      id,
      team: form.team.trim(),
      teamId: form.team.trim().toLowerCase().replace(/\s+/g, "-"),
      kit: form.kit,
      name: `${form.team.trim()} ${form.kit} Kit`,
      type: form.version,
      price: Number(form.price) || 0,
      accent: form.accent,
      accent2: form.accent2,
      photos: form.photos,
      rating: 5.0,
      reviews: 0,
      stock: makeStock(),
    });
    setForm({ team: "", kit: "Home", version: "Player Version", price: 1500, accent: C.red, accent2: C.blue, photos: [] });
    setOpen(false);
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} style={{ marginBottom: 20 }}>
        <Plus size={16} /> Add New Kit
      </Button>
    );
  }

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.gold}`, borderRadius: 10, padding: 20, marginBottom: 24 }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.white, textTransform: "uppercase", marginBottom: 14 }}>Add New Kit</div>
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 5 }}>Team / club name</div>
          <input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="e.g. Riverside United"
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6, padding: "9px 11px", color: C.white, fontFamily: FONT_BODY }} />
        </div>
        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 5 }}>Price (KSh)</div>
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6, padding: "9px 11px", color: C.white, fontFamily: FONT_BODY }} />
        </div>
      </div>

      <div className="mb-3">
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 6 }}>Kit</div>
        <div className="flex gap-2">
          {KIT_TYPES.map((k) => (
            <button key={k} onClick={() => setForm({ ...form, kit: k })} style={{
              padding: "8px 14px", borderRadius: 6, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
              border: `1px solid ${form.kit === k ? C.gold : C.line}`,
              background: form.kit === k ? "rgba(217,169,78,0.12)" : "transparent",
              color: form.kit === k ? C.gold : C.white, cursor: "pointer",
            }}>{k}</button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 6 }}>Version</div>
        <div className="flex gap-2 flex-wrap">
          {["Player Version", "Fan Version", "Kids Set"].map((v) => (
            <button key={v} onClick={() => setForm({ ...form, version: v, price: v === "Player Version" ? 1500 : 1300 })} style={{
              padding: "8px 14px", borderRadius: 6, fontFamily: FONT_BODY, fontSize: 13, fontWeight: 600,
              border: `1px solid ${form.version === v ? C.gold : C.line}`,
              background: form.version === v ? "rgba(217,169,78,0.12)" : "transparent",
              color: form.version === v ? C.gold : C.white, cursor: "pointer",
            }}>{v}</button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 6 }}>Primary colour</div>
          <div className="flex gap-2 flex-wrap">
            {colorChoices.map((c) => (
              <button key={c.hex} onClick={() => setForm({ ...form, accent: c.hex })}
                style={{ width: 26, height: 26, borderRadius: 999, background: c.hex, border: form.accent === c.hex ? `2px solid ${C.white}` : `1px solid ${C.line}`, cursor: "pointer" }}
                title={c.label} />
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 6 }}>Secondary colour</div>
          <div className="flex gap-2 flex-wrap">
            {colorChoices.map((c) => (
              <button key={c.hex} onClick={() => setForm({ ...form, accent2: c.hex })}
                style={{ width: 26, height: 26, borderRadius: 999, background: c.hex, border: form.accent2 === c.hex ? `2px solid ${C.white}` : `1px solid ${C.line}`, cursor: "pointer" }}
                title={c.label} />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 6 }}>
          Product photos — front, back, badge close-up (minimum {MIN_PHOTOS})
        </div>
        <div className="flex gap-2 flex-wrap mb-2">
          {form.photos.map((src, i) => (
            <div key={i} style={{ position: "relative", width: 72, height: 72 }}>
              <img src={src} alt={`Kit photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6, border: `1px solid ${C.line}` }} />
              <button
                onClick={() => removePhoto(i)}
                style={{ position: "absolute", top: -6, right: -6, background: C.red, border: "none", borderRadius: 999, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X size={11} color="#fff" />
              </button>
            </div>
          ))}
          {form.photos.length < MAX_PHOTOS && (
            <label style={{
              width: 72, height: 72, borderRadius: 6, border: `1px dashed ${C.line}`,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", background: C.bg,
            }}>
              <Plus size={20} color={C.mute} />
              <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
            </label>
          )}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: form.photos.length >= MIN_PHOTOS ? C.mute : "#ff9088" }}>
          {form.photos.length} of {MIN_PHOTOS} required photos added
          {form.photos.length < MIN_PHOTOS ? " — add more to save this kit" : ""}
        </div>
      </div>

      <div style={{ background: C.bgRaise, borderRadius: 8, padding: 14, marginBottom: 16, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 120 }}>
          <JerseyArt accent={form.accent} accent2={form.accent2} />
        </div>
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 16 }}>
        Stock for every size and sleeve combination is created automatically — you'll set actual counts from the Products & Stock list after adding. This drawn preview is what customers see while customizing name/number; your uploaded photos appear on the product gallery.
      </div>

      <div className="flex gap-3">
        <Button onClick={handleAdd} disabled={!canSave}>
          <Check size={16} /> Save Kit
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

function AdminProducts({ products, addProduct, removeProduct }) {
  return (
    <div>
      <AddProductForm addProduct={addProduct} products={products} />
      <div className="flex flex-col gap-4">
        {products.map((p) => {
          const lowKeys = Object.entries(p.stock).filter(([, v]) => v > 0 && v <= 2);
          const outKeys = Object.entries(p.stock).filter(([, v]) => v === 0);
          return (
            <div key={p.id} style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 10, padding: 18 }}>
              <div className="flex items-center justify-between mb-2">
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.white, textTransform: "uppercase" }}>{p.name}</div>
                <div className="flex items-center gap-3">
                  <span style={{ fontFamily: FONT_DISPLAY, color: C.gold, fontSize: 16 }}>KSh {p.price.toLocaleString()}</span>
                  <button onClick={() => removeProduct(p.id)} style={{ background: "none", border: "none", cursor: "pointer" }} title="Remove kit">
                    <Trash2 size={16} color={C.mute} />
                  </button>
                </div>
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 10 }}>{p.team} · {p.type}</div>
              {outKeys.length > 0 && (
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone="red">Out of stock</Badge>
                  <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute }}>{outKeys.map(([k]) => k).join(", ")}</span>
                </div>
              )}
              {lowKeys.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge tone="red">Low stock</Badge>
                  <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute }}>{lowKeys.map(([k, v]) => `${k} (${v} left)`).join(", ")}</span>
                </div>
              )}
              {outKeys.length === 0 && lowKeys.length === 0 && (
                <Badge tone="mute">All variants healthy</Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// ADMIN SHELL
// ---------------------------------------------------------------
function AdminSettings({ customizationFee, setCustomizationFee, paybillNumber, setPaybillNumber, paybillAccountNote, setPaybillAccountNote }) {
  const [feeInput, setFeeInput] = useState(String(customizationFee));
  const [paybillInput, setPaybillInput] = useState(paybillNumber);
  const [noteInput, setNoteInput] = useState(paybillAccountNote);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const fee = Number(feeInput);
    if (!Number.isNaN(fee) && fee >= 0) setCustomizationFee(fee);
    setPaybillNumber(paybillInput.trim());
    setPaybillAccountNote(noteInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 480 }}>
      <div style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 10, padding: 20 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.white, textTransform: "uppercase", marginBottom: 4 }}>Customization Fee</div>
        <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 12 }}>
          Extra charge added when a customer adds name/number customization. Update this any time the market changes.
        </p>
        <div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 5 }}>Fee (KSh)</div>
          <input type="number" value={feeInput} onChange={(e) => setFeeInput(e.target.value)}
            style={{ width: 140, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6, padding: "9px 11px", color: C.white, fontFamily: FONT_BODY }} />
        </div>
      </div>

      <div style={{ background: C.bgCard, border: `1px solid ${C.line}`, borderRadius: 10, padding: 20 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.white, textTransform: "uppercase", marginBottom: 4 }}>M-Pesa Paybill</div>
        <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 12 }}>
          Shown to customers at checkout and included in your WhatsApp confirmation message. Customers pay you directly — no payment gateway involved.
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 5 }}>Paybill Number</div>
            <input value={paybillInput} onChange={(e) => setPaybillInput(e.target.value)} placeholder="e.g. 123456"
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6, padding: "9px 11px", color: C.white, fontFamily: FONT_BODY }} />
          </div>
          <div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.mute, marginBottom: 5 }}>Account Number instructions</div>
            <input value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="e.g. Use your order number as the Account Number"
              style={{ width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 6, padding: "9px 11px", color: C.white, fontFamily: FONT_BODY }} />
          </div>
        </div>
      </div>

      <Button onClick={handleSave}>
        {saved ? <><Check size={16} /> Saved</> : "Save Settings"}
      </Button>
    </div>
  );
}

function AdminShell({
  orders, updateOrder, products, addProduct, updateProduct, removeProduct,
  customizationFee, setCustomizationFee, paybillNumber, setPaybillNumber, paybillAccountNote, setPaybillAccountNote,
}) {
  const [tab, setTab] = useState("dashboard");
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "orders", label: "Orders" },
    { id: "products", label: "Products & Stock" },
    { id: "settings", label: "Settings" },
  ];
  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <SectionLabel eyebrow="Owner tools" title="Admin Dashboard" />
      <div className="flex gap-2 mb-8">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "9px 16px", borderRadius: 6, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 13,
            border: `1px solid ${tab === t.id ? C.gold : C.line}`,
            background: tab === t.id ? "rgba(217,169,78,0.12)" : "transparent",
            color: tab === t.id ? C.gold : C.white, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>
      {tab === "dashboard" && <AdminDashboard orders={orders} products={products} />}
      {tab === "orders" && <AdminOrders orders={orders} updateOrder={updateOrder} paybillNumber={paybillNumber} paybillAccountNote={paybillAccountNote} />}
      {tab === "products" && <AdminProducts products={products} addProduct={addProduct} updateProduct={updateProduct} removeProduct={removeProduct} />}
      {tab === "settings" && (
        <AdminSettings
          customizationFee={customizationFee} setCustomizationFee={setCustomizationFee}
          paybillNumber={paybillNumber} setPaybillNumber={setPaybillNumber}
          paybillAccountNote={paybillAccountNote} setPaybillAccountNote={setPaybillAccountNote}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// FOOTER
// ---------------------------------------------------------------
function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.line}`, marginTop: 40 }}>
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Logo height={30} />
          <span style={{ fontFamily: FONT_DISPLAY, color: C.white, textTransform: "uppercase", fontSize: 14 }}>CultureFitsKe</span>
        </div>
        <span style={{ fontFamily: FONT_BODY, color: C.mute, fontSize: 12 }}>Player & fan kits, made to order.</span>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------
// ROOT APP
// ---------------------------------------------------------------
export default function App() {
  const [view, setView] = useState("home");
  const [activeProductId, setActiveProductId] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [isAdmin, setIsAdmin] = useState(false);

  const openProduct = (id) => { setActiveProductId(id); setView("product"); };
  const activeProduct = useMemo(() => products.find((p) => p.id === activeProductId), [activeProductId, products]);

  const addToCart = (item) => setCart((c) => [...c, item]);
  const updateQty = (id, delta) => setCart((c) => c.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  const removeItem = (id) => setCart((c) => c.filter((i) => i.id !== id));
  const toggleWishlist = (id) => setWishlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]);
  const addProduct = (product) => setProducts((p) => [...p, product]);
  const updateProduct = (id, patch) => setProducts((p) => p.map((x) => x.id === id ? { ...x, ...patch } : x));
  const removeProduct = (id) => setProducts((p) => p.filter((x) => x.id !== id));

  const [customizationFee, setCustomizationFee] = useState(DEFAULT_CUSTOM_FEE);
  const [paybillNumber, setPaybillNumber] = useState("");
  const [paybillAccountNote, setPaybillAccountNote] = useState("Use your order number as the Account Number");

  const placeOrder = (form, payment, subtotal) => {
    setOrders((o) => [...o, {
      id: `ORD-${1000 + o.length}`,
      form, payment, subtotal,
      items: cart,
      deliveryFee: "",
      status: "Requested",
    }]);
    setCart([]);
    setView("confirmed");
  };

  const updateOrder = (id, patch) => setOrders((os) => os.map((o) => o.id === id ? { ...o, ...patch } : o));

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: FONT_BODY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Anton&family=Bebas+Neue&family=Teko:wght@600;700&family=Permanent+Marker&family=Orbitron:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      <Header view={view} setView={setView} cartCount={cart.reduce((s, i) => s + i.qty, 0)} wishlistCount={wishlist.length} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />

      {isAdmin ? (
        <AdminShell
          orders={orders} updateOrder={updateOrder} products={products}
          addProduct={addProduct} updateProduct={updateProduct} removeProduct={removeProduct}
          customizationFee={customizationFee} setCustomizationFee={setCustomizationFee}
          paybillNumber={paybillNumber} setPaybillNumber={setPaybillNumber}
          paybillAccountNote={paybillAccountNote} setPaybillAccountNote={setPaybillAccountNote}
        />
      ) : (
        <>
          {view === "home" && <Home setView={setView} openProduct={openProduct} wishlist={wishlist} toggleWishlist={toggleWishlist} products={products} customizationFee={customizationFee} />}
          {view === "shop" && <Shop openProduct={openProduct} wishlist={wishlist} toggleWishlist={toggleWishlist} products={products} />}
          {view === "product" && activeProduct && <ProductDetail product={activeProduct} setView={setView} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} customizationFee={customizationFee} />}
          {view === "cart" && <Cart cart={cart} updateQty={updateQty} removeItem={removeItem} setView={setView} />}
          {view === "wishlist" && <Wishlist wishlist={wishlist} toggleWishlist={toggleWishlist} openProduct={openProduct} products={products} />}
          {view === "checkout" && <Checkout cart={cart} setView={setView} placeOrder={placeOrder} paybillNumber={paybillNumber} paybillAccountNote={paybillAccountNote} />}
          {view === "confirmed" && <OrderConfirmed setView={setView} paybillNumber={paybillNumber} paybillAccountNote={paybillAccountNote} />}
        </>
      )}

      <Footer />
    </div>
  );
}
