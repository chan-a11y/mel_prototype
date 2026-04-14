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
        const folderFiles = fs.readdirSync(path.join(dir, e.name)).filter(f => /\.(mp4|mov|webm)$/i.test(f));
        const videoFile = folderFiles.find(f => /^intro\./i.test(f)) ?? "intro.mp4";
        const transitionFile = folderFiles.find(f => /^transition\./i.test(f));
        const idleFile = folderFiles.find(f => /^idle\./i.test(f));
        const firstMessageFile = folderFiles.find(f => /^firstmessage\./i.test(f));
        const base = `/characters/${e.name}`;
        return {
          id: e.name,
          name: charName.charAt(0).toUpperCase() + charName.slice(1),
          video: `${base}/${videoFile}`,
          ...(transitionFile && { transitionVideo: `${base}/${transitionFile}` }),
          ...(idleFile && { idleVideo: `${base}/${idleFile}` }),
          ...(firstMessageFile && { firstMessageVideo: `${base}/${firstMessageFile}` }),
          hasBoys,
        };
      });

    return NextResponse.json(characters);
  } catch {
    return NextResponse.json([]);
  }
}
