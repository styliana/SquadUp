import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AvatarUpload = ({ url, onUpload, size = 150 }) => {
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      onUpload(data.publicUrl);
      toast.success('Avatar updated!');
      
    } catch (error) {
      toast.error('Error uploading avatar!');
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Używamy LABEL jako kontenera - kliknięcie w niego uruchamia input */}
      <label 
        htmlFor="avatar-upload" 
        className="relative group cursor-pointer block overflow-hidden rounded-3xl border-4 border-surface shadow-xl transition-transform hover:scale-105"
        style={{ width: size, height: size }}
      >
        
        {/* 1. OBRAZEK LUB IKONA (TŁO) */}
        {url ? (
          <img
            src={url}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Camera size={size / 3} className="text-white opacity-50" />
          </div>
        )}

        {/* 2. NAKŁADKA (OVERLAY) - Pojawia się po najechaniu (group-hover) */}
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {uploading ? (
            <Loader2 className="animate-spin text-white" size={32} />
          ) : (
            <>
              <Camera size={24} className="text-white mb-2" />
              <span className="text-white font-bold text-xs uppercase tracking-wider">Change Photo</span>
            </>
          )}
        </div>

        {/* 3. UKRYTY INPUT (Technicznie jest tutaj, ale niewidoczny) */}
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden" 
        />
      </label>
    </div>
  );
};

export default AvatarUpload;