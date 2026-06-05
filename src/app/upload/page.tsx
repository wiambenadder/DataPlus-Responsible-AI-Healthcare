"use client";

import { supabase } from "@/lib/supabase";

export default function UploadPage() {
 async function handleUpload(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const files = event.target.files;

  if (!files || files.length === 0) return;

  for (const file of Array.from(files)) {
    const filePath = `${Date.now()}-${file.name}`;

    // Upload to Storage
    const { data, error: uploadError } = await supabase.storage
      .from("reports")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      continue;
    }

    // Save metadata
    const { error: dbError } = await supabase
      .from("uploads")
      .insert({
        file_name: file.name,
        file_type: file.type,
        file_url: data?.path,
      });

    if (dbError) {
      console.error("DB insert error:", dbError);
      continue;
    }
  }

  alert("Files uploaded successfully");
}
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-4">
        Upload Report
      </h1>

      <input
  type="file"
  multiple
  onChange={handleUpload}
/>
    </div>
  );
}