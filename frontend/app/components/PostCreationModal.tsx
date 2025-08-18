
'use client';

import { useState } from 'react';

export default function PostCreationModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => void; }) {
  const [text, setText] = useState('');
  const [media, setMedia] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMedia(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ text, media });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Create Post</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded-lg mb-4 bg-white dark:bg-zinc-700"
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input type="file" onChange={handleFileChange} className="mb-4" />
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Post</button>
          </div>
        </form>
      </div>
    </div>
  );
}

