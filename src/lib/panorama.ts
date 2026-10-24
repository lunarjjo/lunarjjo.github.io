/* Panorama generator — builds a Minecraft-style landscape from REAL block textures.
   grass_block_top & oak_leaves are grayscale in the jar (biome tinted at runtime),
   so we tint them here like the game does (plains palette). */

type Textures = Record<string, HTMLImageElement>;

const SRC: Record<string, string> = {
  grassSide: "/mc/blocks/grass_block_side.png",
  grassTop: "/mc/blocks/grass_block_top.png",
  dirt: "/mc/blocks/dirt.png",
  stone: "/mc/blocks/stone.png",
  cobble: "/mc/blocks/cobblestone.png",
  oakLog: "/mc/blocks/oak_log.png",
  oakLeaves: "/mc/blocks/oak_leaves.png",
  sand: "/mc/blocks/sand.png",
  water: "/mc/blocks/water_still.png",
  bedrock: "/mc/blocks/bedrock.png",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error(`img ${src}`));
    img.src = src;
  });
}

/** mulberry32 seeded rng */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** draw a texture tinted with color, preserving alpha */
function tinted(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  color: string,
  w: number,
  h: number
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const cx = c.getContext("2d")!;
  cx.imageSmoothingEnabled = false;
  cx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
  cx.globalCompositeOperation = "multiply";
  cx.fillStyle = color;
  cx.fillRect(0, 0, w, h);
  cx.globalCompositeOperation = "destination-in";
  cx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
  void ctx;
  return c;
}

const B = 16; // logical block size in px

export type Panorama = { day: string; night: string };

export async function generatePanorama(seed = 20261024): Promise<Panorama> {
  const tex: Textures = {};
  await Promise.all(
    Object.entries(SRC).map(async ([k, v]) => {
      tex[k] = await loadImage(v);
    })
  );

  const W = 2048;
  const H = 560;
  const ground = 360; // ground line (y) where terrain surface starts

  const build = (night: boolean): string => {
    const cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;

    // --- sky ---
    if (night) {
      const sky = ctx.createLinearGradient(0, 0, 0, ground + 60);
      sky.addColorStop(0, "#060a20");
      sky.addColorStop(0.7, "#0c1230");
      sky.addColorStop(1, "#1b2547");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      // stars
      const r = rng(seed + 7);
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 140; i++) {
        const x = Math.floor(r() * W);
        const y = Math.floor(r() * (ground - 40));
        const s = r() > 0.9 ? 2 : 1;
        ctx.globalAlpha = 0.35 + r() * 0.65;
        ctx.fillRect(x, y, s, s);
      }
      ctx.globalAlpha = 1;
      // moon
      ctx.fillStyle = "#e8e8d8";
      ctx.fillRect(W - 300, 70, 56, 56);
      ctx.fillStyle = "#c9c9b8";
      ctx.fillRect(W - 286, 84, 12, 12);
      ctx.fillRect(W - 268, 102, 10, 10);
    } else {
      const sky = ctx.createLinearGradient(0, 0, 0, ground + 60);
      sky.addColorStop(0, "#6f9fff");
      sky.addColorStop(0.65, "#8fb4ff");
      sky.addColorStop(1, "#b9d2f5");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      // sun
      ctx.fillStyle = "#fdfdc8";
      ctx.fillRect(160, 64, 56, 56);
    }

    // --- clouds (flat MC style) ---
    const r2 = rng(seed + 99);
    ctx.fillStyle = night ? "rgba(200,210,255,0.20)" : "rgba(255,255,255,0.85)";
    for (let i = 0; i < 26; i++) {
      const cx = Math.floor(r2() * (W + 400)) - 200;
      const cy = 30 + Math.floor(r2() * 90);
      const cw = 60 + Math.floor(r2() * 120);
      const ch = 8 + Math.floor(r2() * 10);
      ctx.fillRect(cx, cy, cw, ch);
      if (r2() > 0.5) ctx.fillRect(cx + 16, cy - 8, cw - 40, 8);
    }

    // --- terrain heightmap (tileable via smooth noise) ---
    const r = rng(seed);
    const cols = W / B;
    const heights: number[] = [];
    const waves = [
      { amp: 5, len: 14, ph: r() * 10 },
      { amp: 3, len: 31, ph: r() * 10 },
      { amp: 2, len: 53, ph: r() * 10 },
    ];
    for (let i = 0; i < cols; i++) {
      let h = 0;
      for (const w of waves) {
        h += w.amp * Math.sin((i / w.len) * Math.PI * 2 + w.ph);
      }
      heights.push(Math.round(h));
    }

    const dark = night ? 0.42 : 1;
    const tintGrassTop = tinted(ctx, tex.grassTop, "#8fbf4e", B, B);
    const tintLeaves = tinted(ctx, tex.oakLeaves, "#5c9a33", B, B);
    const dim = (c: HTMLCanvasElement) => {
      const d = document.createElement("canvas");
      d.width = c.width;
      d.height = c.height;
      const dx = d.getContext("2d")!;
      dx.fillStyle = `rgba(16,20,48,${1 - dark})`;
      dx.fillRect(0, 0, d.width, d.height);
      dx.globalCompositeOperation = "destination-in";
      dx.drawImage(c, 0, 0);
      dx.globalCompositeOperation = "multiply";
      dx.drawImage(c, 0, 0);
      return d;
    };
    const gGrassTop = night ? dim(tintGrassTop) : tintGrassTop;
    const gLeaves = night ? dim(tintLeaves) : tintLeaves;
    const drawImg = (
      img: HTMLCanvasElement | HTMLImageElement,
      x: number,
      y: number
    ) => {
      ctx.drawImage(img, x, y, B, B);
    };

    const WATER_Y = ground + 6;

    for (let i = 0; i < cols; i++) {
      const h = heights[i];
      const topY = ground - h * B;
      const sandy = h > 4; // high dunes => sand
      // water fill below water level
      for (let y = WATER_Y; y < H; y += B) {
        ctx.globalAlpha = 0.82;
        ctx.drawImage(
          tex.water,
          0,
          0,
          16,
          16,
          i * B,
          y,
          B,
          B
        );
        ctx.globalAlpha = 1;
      }
      if (topY > WATER_Y) {
        // surface underwater: sand bed
        drawImg(tex.sand, i * B, WATER_Y - B);
        continue;
      }
      // top block: grass (or sand on dunes)
      if (sandy) {
        drawImg(tex.sand, i * B, topY);
      } else {
        drawImg(tex.grassSide, i * B, topY);
        drawImg(gGrassTop, i * B, topY - 4);
      }
      // dirt below top (3 deep)
      for (let d = 1; d <= 3; d++) drawImg(tex.dirt, i * B, topY + d * B);
      // stone until bottom
      for (let y = topY + 4 * B; y < H; y += B) drawImg(tex.stone, i * B, y);
    }

    // bedrock strip bottom
    for (let i = 0; i < cols; i++) drawImg(tex.bedrock, i * B, H - B);

    // --- trees (deterministic) ---
    const rt = rng(seed + 31);
    for (let i = 3; i < cols - 3; i += 1) {
      if (rt() > 0.955 && heights[i] <= 4) {
        const topY = ground - heights[i] * B;
        const trunkH = 3 + Math.floor(rt() * 2);
        for (let t = 1; t <= trunkH; t++) drawImg(tex.oakLog, i * B, topY - t * B);
        // canopy 3x3 + cap
        for (let lx = -1; lx <= 1; lx++)
          for (let ly = -1; ly <= 1; ly++)
            drawImg(gLeaves, (i + lx) * B, topY - (trunkH + ly) * B);
        drawImg(gLeaves, i * B, topY - (trunkH + 2) * B);
      }
    }

    // vignette blur hint handled by CSS filter on <img>
    return cv.toDataURL("image/png");
  };

  return { day: build(false), night: build(true) };
}
