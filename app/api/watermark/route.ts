// app/api/watermark/route.ts (Next.js 13+ / app router)
import { NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side only
);

export async function POST(req: Request) {
  try {
    const { articleId, pdfUrl, logoUrl } = await req.json();

    if (!articleId || !pdfUrl || !logoUrl)
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );

    // 1️⃣ Fetch original PDF
    const existingPdfBytes = await fetch(pdfUrl).then((res) =>
      res.arrayBuffer()
    );

    // 2️⃣ Load PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 3️⃣ Embed logo image
    const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const { width, height } = logoImage;

    // 4️⃣ Add watermark to each page
    pdfDoc.getPages().forEach((page) => {
      const scale = 0.5;
      const { width: pageWidth, height: pageHeight } = page.getSize();
      page.drawImage(logoImage, {
        x: pageWidth / 2 - (width * scale) / 2,
        y: pageHeight / 2 - (height * scale) / 2,
        width: width * scale,
        height: height * scale,
        opacity: 0.3,
        rotate: degrees(0),
      });
    });

    // 5️⃣ Save watermarked PDF
    const watermarkedPdfBytes = await pdfDoc.save();

    // 6️⃣ Upload to Supabase storage
    const filePath = `articles/watermarked/${articleId}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("articles")
      .upload(filePath, watermarkedPdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 7️⃣ Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("articles")
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      watermarkedPdfUrl: publicUrlData.publicUrl,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to watermark PDF" },
      { status: 500 }
    );
  }
}
