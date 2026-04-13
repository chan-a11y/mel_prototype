import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "characters");
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    const characters = entries
      .filter((e) => e.isDirectory() && /^\d+/.test(e.name))
      .sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10))
      .map((e) => {
        const charName = e.name.replace(/^\d+[_.\- ]+/, "").trim();
        const hasBoys = fs.existsSync(path.join(dir, e.name, "boys"));
        const folderFiles = fs.readdirSync(path.join(dir, e.name));
        const videoFile = folderFiles.find(f => /\.(mp4|mov|webm)$/i.test(f)) ?? "intro.mp4";
        return {
          id: e.name,
          name: charName.charAt(0).toUpperCase() + charName.slice(1),
          video: `/characters/${e.name}/${videoFile}`,
          hasBoys,
        };
      });

    return NextResponse.json(characters);
  } catch {
    return NextResponse.json([]);
  }
}
