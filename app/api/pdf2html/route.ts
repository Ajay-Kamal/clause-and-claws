import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { slug, pdfUrl } = await req.json();
    if (!slug || !pdfUrl) {
      return NextResponse.json(
        { error: "Missing slug or pdfUrl" },
        { status: 400 }
      );
    }

    console.log("[PDF2HTML] Step 1: Downloading PDF...");
    const res = await fetch(pdfUrl);
    if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
    const pdfBuffer = await res.arrayBuffer();
    console.log("[PDF2HTML] PDF downloaded, size:", pdfBuffer.byteLength);

    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const tmpPdfPath = path.join(tmpDir, `${slug}.pdf`);
    fs.writeFileSync(tmpPdfPath, Buffer.from(pdfBuffer));
    console.log("[PDF2HTML] PDF saved to:", tmpPdfPath);

    const tmpHtmlPath = path.join(tmpDir, `${slug}.html`);
    console.log("[PDF2HTML] Converting PDF to HTML...");
    await new Promise<void>((resolve, reject) => {
      exec(
        `pdf2htmlEX --embed cfijo --dest-dir ${tmpDir} ${tmpPdfPath} ${tmpHtmlPath}`,
        (err, stdout, stderr) => {
          if (err) {
            console.error("[PDF2HTML] Conversion error:", stderr);
            return reject(new Error("pdf2htmlEX failed: " + stderr));
          }
          console.log("[PDF2HTML] Conversion stdout:", stdout);
          resolve();
        }
      );
    });

    const htmlContent = fs.readFileSync(tmpHtmlPath, "utf-8");
    console.log("[PDF2HTML] HTML content length:", htmlContent.length);

    console.log("[PDF2HTML] Uploading HTML to Supabase Storage...");
    const { error: uploadError } = await supabase.storage
      .from("articles")
      .upload(`html/${slug}.html`, Buffer.from(htmlContent), {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadError)
      throw new Error("Supabase upload failed: " + uploadError.message);

    const { data: publicUrlData } = supabase.storage
      .from("articles")
      .getPublicUrl(`html/${slug}.html`);

    console.log("[PDF2HTML] Success! Public URL:", publicUrlData.publicUrl);
    return NextResponse.json({ htmlUrl: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error("[PDF2HTML] Error:", err.message || err);
    return NextResponse.json(
      { error: err.message || "PDF to HTML conversion failed" },
      { status: 500 }
    );
  }
}
