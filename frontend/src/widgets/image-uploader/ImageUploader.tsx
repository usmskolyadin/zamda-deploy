import { useState } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';

const MAX_IMAGES = 10;
const MAX_FILE_SIZE_MB = 15;

type ExistingImage = { id: number; url: string };

interface ImageUploaderProps {
  existingImages: ExistingImage[];
  setExistingImages: (images: ExistingImage[]) => void;
  newImages: File[];
  setNewImages: (files: File[]) => void;
}

export default function ImageUploader({
  existingImages,
  setExistingImages,
  newImages,
  setNewImages,
}: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setError(null);

    const selectedFiles = Array.from(e.target.files);
    const oversized = selectedFiles.filter(file => file.size > MAX_FILE_SIZE_MB * 1024 * 1024);

    if (oversized.length > 0) {
      setError(`Some images exceed ${MAX_FILE_SIZE_MB} MB and were not added.`);
    }

    const validFiles = selectedFiles.filter(file => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024);
    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    const combined = [...(newImages || []), ...validFiles].slice(0, MAX_IMAGES);
    setNewImages(combined);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-md flex flex-col">
      <p className="font-semibold text-black text-xl">Images</p>
      <p className="text-gray-700 text-sm font-medium">
        You can add up to {MAX_IMAGES} images (max {MAX_FILE_SIZE_MB} MB each)
      </p>

      {error && (
        <div className="flex items-center mt-2 bg-red-50 text-red-600 p-2 rounded-lg border border-red-300">
          <AlertCircle size={18} className="mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}

<div className="flex flex-wrap gap-2 mt-2">
  {(existingImages || []).map((img, idx) => (
    <div key={`exist-${img.id}`} className="relative w-30 h-30 border rounded-xl overflow-hidden">
      <img src={img.url} alt={`Image ${img.id}`} className="w-full h-full object-cover" />
      <button
        type="button"
        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-200"
        onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
      >
        <X size={16} />
      </button>
    </div>
  ))}

  {(newImages || []).map((file, idx) => (
    <div key={`new-${idx}`} className="relative w-30 h-30 border rounded-xl overflow-hidden">
      <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
      <button
        type="button"
        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-200"
        onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))}
      >
        <X size={16} />
      </button>
    </div>
  ))}

  {/* Кнопка добавления */}
  {((existingImages?.length ?? 0) + (newImages?.length ?? 0) < MAX_IMAGES) && (
    <label className="w-30 h-30 flex items-center justify-center border-2 border-dashed border-black/40 rounded-xl cursor-pointer hover:border-gray-500 transition relative">
      <Plus size={24} className="text-gray-500" />
      <input
        type="file"
        multiple
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={handleFilesChange}
      />
    </label>
  )}
</div>

    </div>
  );
}
