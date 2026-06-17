// not current in use
// upload page for the app, allows users to upload files to their company account, files are stored in Supabase storage and metadata is stored in the uploads table

"use client";

import { supabase } from "@/lib/supabase";

export default function UploadPage() {
 async function handleUpload(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const files = event.target.files;

  if (!files || files.length === 0) return;

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Please log in");
    return;
  }

  // Get company ID from profile
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    alert("No company linked to account");
    return;
  }

  for (const file of Array.from(files)) {
    const filePath = `${Date.now()}-${file.name}`;

    const { data, error: uploadError } =
      await supabase.storage
        .from("reports")
        .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      continue;
    }

    const { error: dbError } =
      await supabase
        .from("uploads")
        .insert({
          company_id: profile.company_id,
          file_name: file.name,
          file_type: file.type,
          file_url: data?.path,
        });

    if (dbError) {
      console.error(dbError);
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