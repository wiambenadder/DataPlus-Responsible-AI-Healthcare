"use client";

import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    // 1. Create a unique file name to avoid overwriting
    const filePath = `${Date.now()}-${file.name}`;

    // 2. Upload file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from("reports")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return;
    }

    // 3. Save metadata to database AFTER successful upload
    const { error: dbError } = await supabase
      .from("uploads")
      .insert({
        file_name: file.name,
        file_type: file.type,
        file_url: data?.path // path inside Supabase storage
      });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return;
    }

    alert("Upload successful");
  }

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-4">
        Upload Report
      </h1>

      <input
        type="file"
        onChange={handleUpload}
      />
    </div>
  );
}