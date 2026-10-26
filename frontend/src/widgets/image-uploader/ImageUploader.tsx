import { useState } from 'react';
import { Plus, X, AlertCircle, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const MAX_IMAGES = 15;
const MAX_FILE_SIZE_MB = 15;

export type ImageItem =
  | { key: string; type: 'existing'; id: number; url: string }
  | { key: string; type: 'new'; file: File };

interface ImageUploaderProps {
  items: ImageItem[];
  setItems: (items: ImageItem[]) => void;
}

export default function ImageUploader({ items, setItems }: ImageUploaderProps) {
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

    const newItems: ImageItem[] = validFiles.map((file) => ({
      key: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: 'new',
      file,
    }));

    setItems([...(items || []), ...newItems].slice(0, MAX_IMAGES));
    e.target.value = '';
  };

  const removeAt = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const setAsMain = (idx: number) => {
    if (idx === 0) return;
    const next = [...items];
    const [picked] = next.splice(idx, 1);
    next.unshift(picked);
    setItems(next);
  };

  const moveBy = (idx: number, delta: number) => {
    const target = idx + delta;
    if (target < 0 || target >= items.length) return;

    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
  };

  return (
    <div className="w-full max-w-md flex flex-col">
      <p className="font-semibold text-black text-xl">Images</p>
      <p className="text-gray-700 text-sm font-medium">
        You can add up to {MAX_IMAGES} images (max {MAX_FILE_SIZE_MB} MB each). The starred photo is shown first in listings.
      </p>

      {error && (
        <div className="flex items-center mt-2 bg-red-50 text-red-600 p-2 rounded-lg border border-red-300">
          <AlertCircle size={18} className="mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item, idx) => (
          <div key={item.key} className="relative w-30 h-30 border rounded-xl overflow-hidden">
            <img
              src={item.type === 'existing' ? item.url : URL.createObjectURL(item.file)}
              alt={`Image ${idx + 1}`}
              className="w-full h-full object-cover"
            />

            <button
              type="button"
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-200"
              onClick={() => removeAt(idx)}
            >
              <X size={16} />
            </button>

            <button
              type="button"
              title={idx === 0 ? 'Main photo' : 'Set as main photo'}
              className={`absolute top-1 left-1 rounded-full p-1 shadow ${
                idx === 0 ? 'bg-[#2AAEF7] text-white' : 'bg-white hover:bg-gray-200'
              }`}
              onClick={() => setAsMain(idx)}
            >
              <Star size={16} fill={idx === 0 ? 'currentColor' : 'none'} />
            </button>

            <div className="absolute bottom-1 left-1 right-1 flex justify-between">
              <button
                type="button"
                disabled={idx === 0}
                title="Move earlier"
                className="bg-white/90 rounded-full p-1 shadow hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => moveBy(idx, -1)}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={idx === items.length - 1}
                title="Move later"
                className="bg-white/90 rounded-full p-1 shadow hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => moveBy(idx, 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Кнопка добавления */}
        {(items?.length ?? 0) < MAX_IMAGES && (
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
