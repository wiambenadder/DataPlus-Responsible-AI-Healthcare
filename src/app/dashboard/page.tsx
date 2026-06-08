import { supabase } from "@/lib/supabase";

export default async function Dashboard() {

  const { data } =
    await supabase
      .from("uploads")
      .select("*");

  return (
    <div>

      <h1>Uploaded Files</h1>

      {data?.map((file) => (
        <div key={file.id}>
          {file.file_name}
        </div>
      ))}

    </div>
  );
}