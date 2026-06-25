"use client";

import { supabase } from "@/lib/supabase";


const { data } =
  await supabase.storage
    .from("uploads")
    .download(storagePath);

    const arrayBuffer =
  await data.arrayBuffer();

const buffer =
  Buffer.from(arrayBuffer);

  import pdfParse from "pdf-parse";

const parsed =
  await pdfParse(buffer);

const extractedText =
  parsed.text;

  await supabase
  .from("uploads")
  .update({
    extracted_text:
      extractedText,

    extraction_status:
      "complete",

    processed_at:
      new Date(),
  })
  .eq("id", uploadId);