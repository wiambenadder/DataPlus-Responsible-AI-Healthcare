import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { uploadId } = await request.json();

    if (!uploadId) {
      return NextResponse.json(
        { error: "Missing upload id" },
        { status: 400 }
      );
    }

    const { data: upload, error: uploadError } = await supabase
      .from("uploads")
      .select("*")
      .eq("id", uploadId)
      .single();

    if (uploadError || !upload) {
      return NextResponse.json(
        { error: "Upload not found" },
        { status: 404 }
      );
    }

    await supabase
      .from("uploads")
      .update({ extraction_status: "processing" })
      .eq("id", uploadId);

    const { data: file, error: downloadError } = await supabase.storage
      .from("reports")
      .download(upload.file_url);

    if (downloadError || !file) {
      await supabase
        .from("uploads")
        .update({ extraction_status: "failed" })
        .eq("id", uploadId);

      return NextResponse.json(
        { error: downloadError?.message ?? "Unable to download file" },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // @ts-ignore
    const { default: pdfParse } = await import("pdf-parse");
    const parsed = await pdfParse(buffer);

    const extractedText = parsed.text;

    console.log("Extracted text length:", extractedText?.length);
    console.log("Upload ID:", uploadId);

    // ✅ Log the exact update payload
    const updatePayload = {
      extracted_text: extractedText,
      extraction_status: "complete",
      processed_at: new Date().toISOString(),
    };

    console.log("Update payload keys:", Object.keys(updatePayload));
    console.log("extracted_text sample:", extractedText?.slice(0, 100));

    const { data: updateData, error: updateError } = await supabase
      .from("uploads")
      .update(updatePayload)
      .eq("id", uploadId)
      .select(); // ✅ .select() forces Supabase to return what was actually written

    console.log("Update result:", updateData);
    console.log("Update error:", updateError);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message, details: updateError },
        { status: 500 }
      );
    }

    if (!updateData || updateData.length === 0) {
      return NextResponse.json(
        { error: "Update ran but no rows were matched — check the uploadId" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pages: parsed.numpages,
      characters: extractedText.length,
      written: updateData[0]?.extracted_text?.length ?? 0,
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
