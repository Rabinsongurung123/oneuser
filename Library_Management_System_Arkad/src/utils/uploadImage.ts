import { supabase } from "../config/supabase";

export async function uploadBookCover(file: Express.Multer.File): Promise<string> {
  const fileExt = file.originalname.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `covers/${fileName}`;

  const { error } = await supabase.storage
    .from("book-covers")
    .upload(filePath, file.buffer, { contentType: file.mimetype });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabase.storage.from("book-covers").getPublicUrl(filePath);
  return data.publicUrl;
}