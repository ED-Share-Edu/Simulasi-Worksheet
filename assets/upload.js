import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://YOURPROJECT.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('uploadForm');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = 'Uploading...';

  const data = new FormData(form);
  const file = data.get('file');
  const category = data.get('category');
  const type = file.type.includes('pdf') ? 'worksheet' : 'simulasi'; // simple check

  // 1. Upload file ke bucket
  const bucketName = type;
  const filePath = `${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, file);

  if (uploadError) {
    status.textContent = 'Gagal upload file: ' + uploadError.message;
    return;
  }

  // 2. Ambil public URL
  const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);

  // 3. Insert metadata ke tabel
  const meta = {
    title: data.get('title'),
    category: data.get('category'),
    description: data.get('description'),
    file_url: publicUrl,
    icon: data.get('icon'),
    difficulty: data.get('difficulty'),
    ...(type === 'worksheet' ? { pages: data.get('pages') } : {}),
  };

  const { error: dbError } = await supabase.from(type).insert([meta]);
  if (dbError) {
    status.textContent = 'Gagal simpan metadata: ' + dbError.message;
    return;
  }
  status.textContent = 'Upload berhasil!';
  form.reset();
});