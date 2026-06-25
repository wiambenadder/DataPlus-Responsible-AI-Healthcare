import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Import for pdf-parse may need adjusting depending on your version.
// Start with this:
const pdfParse = require("pdf-parse");

export async function POST(request: NextRequest) {
  try {
    const { uploadId } = await request.json();

    if (!uploadId) {
      return NextResponse.json(
        { error: "Missing upload id" },
        { status: 400 }
      );
    }

    // Find upload record
    const {
      data: upload,
      error: uploadError,
    } = await supabase
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

    // Mark as processing
    await supabase
      .from("uploads")
      .update({
        extraction_status: "processing",
      })
      .eq("id", uploadId);

    // Download file from storage
    const {
      data: file,
      error: downloadError,
    } = await supabase.storage
      .from("reports")
      .download(upload.file_url);

    if (downloadError || !file) {
      await supabase
        .from("uploads")
        .update({
          extraction_status: "failed",
        })
        .eq("id", uploadId);

      return NextResponse.json(
        {
          error:
            downloadError?.message ??
            "Unable to download file",
        },
        { status: 500 }
      );
    }

    // Convert PDF to Buffer
    const arrayBuffer =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(arrayBuffer);

    // Extract text
    const parsed =
      await pdfParse(buffer);

    const extractedText =
      parsed.text;

    // Save extracted text
    const {
      error: updateError,
    } = await supabase
      .from("uploads")
      .update({
        extracted_text:
          extractedText,

        extraction_status:
          "complete",

        processed_at:
          new Date().toISOString(),
      })
      .eq("id", uploadId);

    if (updateError) {
      return NextResponse.json(
        {
          error:
            updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pages:
        parsed.numpages,
      characters:
        extractedText.length,
    });

  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        error:
          err.message ??
          "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}