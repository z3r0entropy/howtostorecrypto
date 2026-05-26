import sharp from "sharp";
import { readFile } from "node:fs/promises";

const jobs = [
  ["public/brand/avatar-dark.svg",   "public/brand/avatar-dark.png",   400, 400],
  ["public/brand/avatar-light.svg",  "public/brand/avatar-light.png",  400, 400],
  ["public/brand/twitter-header.svg","public/brand/twitter-header.png",1500, 500],
  ["public/brand/lockup.svg",        "public/brand/lockup.png",        1040, 160],
  ["public/brand/mark.svg",          "public/brand/mark.png",          512,  512],
];

for (const [src, dst, w, h] of jobs) {
  const buf = await readFile(src);
  await sharp(buf, { density: 384 }).resize(w, h).png().toFile(dst);
  console.log("ok", dst);
}
