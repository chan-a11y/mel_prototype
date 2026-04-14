import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const charId = searchParams.get("charId");

    let dir: string;
    if (charId) {
      dir = path.join(process.cwd(), "public", "characters", charId, "boys");
    } else {
      dir = path.join(process.cwd(), "public", "boys");
    }

    if (!fs.existsSync(dir)) return NextResponse.json([]);

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    const boys = entries
      .filter((e) => e.isDirectory() && /^\d+/.test(e.name))
      .sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10))
      .map((e) => {
        const boyName = e.name.replace(/^\d+[_.\- ]+/, "").trim();
        const base = charId
          ? `/characters/${charId}/boys/${e.name}`
          : `/boys/${e.name}`;
        const folderFiles = fs.readdirSync(path.join(dir, e.name)).filter(f => /\.(mp4|mov|webm)$/i.test(f));
        const videoFile = folderFiles.find(f => /^intro\./i.test(f)) ?? "intro.mp4";
        const transitionFile = folderFiles.find(f => /^transition\./i.test(f));
        const idleFile = folderFiles.find(f => /^idle\./i.test(f));
        return {
          id: e.name,
          name: boyName.charAt(0).toUpperCase() + boyName.slice(1),
          video: `${base}/${videoFile}`,
          ...(transitionFile && { transitionVideo: `${base}/${transitionFile}` }),
          ...(idleFile && { idleVideo: `${base}/${idleFile}` }),
        };
      });

    return NextResponse.json(boys);
  } catch {
    return NextResponse.json([]);
  }
}
