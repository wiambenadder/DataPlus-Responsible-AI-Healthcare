import { supabase } from "@/lib/supabase";

const BUCKET = "reports";

/**
 * Opens an uploaded file in a new tab.
 *
 * Uses a short-lived signed link, which works whether or not the storage
 * bucket is public (a public link to a private bucket is what produced
 * the "error opening PDF" some innovators saw). Falls back to the public
 * link if signing isn't allowed.
 *
 * The tab is opened before the link is fetched so pop-up blockers allow
 * it. Returns false (and closes the tab) if the file can't be reached.
 */
export async function openStoredFile(path: string | null | undefined): Promise<boolean> {
  if (!path) return false;
  const tab = window.open("", "_blank");

  let url: string | null = null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (!error && data?.signedUrl) {
    url = data.signedUrl;
  } else {
    // Signing failed: check the public link actually serves the file.
    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    try {
      const res = await fetch(publicUrl, { method: "HEAD" });
      if (res.ok) url = publicUrl;
    } catch {
      /* unreachable */
    }
  }

  if (!url) {
    tab?.close();
    return false;
  }
  if (tab) tab.location.href = url;
  else window.location.href = url;
  return true;
}
