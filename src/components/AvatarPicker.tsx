'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Grid, Check, RefreshCw, X, Image as ImageIcon } from 'lucide-react';

interface AvatarPickerProps {
  currentAvatarUrl?: string;
  onSelect: (url: string) => void;
  label?: string;
}

const PRESET_AVATARS = [
  { url: '/avatars/instructors/alex-vance.jpg', label: 'Dr. Vance' },
  { url: '/avatars/instructors/sarah-connor.jpg', label: 'Prof. Connor' },
  { url: '/avatars/presets/preset-1.jpg', label: 'Student 1' },
  { url: '/avatars/presets/preset-2.jpg', label: 'Student 2' },
  { url: '/avatars/presets/preset-3.jpg', label: 'Student 3' },
  { url: '/avatars/presets/preset-4.jpg', label: 'Student 4' },
  { url: '/avatars/presets/preset-5.jpg', label: 'Student 5' },
  { url: '/avatars/presets/preset-6.jpg', label: 'Student 6' },
];

export default function AvatarPicker({
  currentAvatarUrl,
  onSelect,
  label = 'Profile Picture (Site Asset)',
}: AvatarPickerProps) {
  const [activeTab, setActiveTab] = useState<'preset' | 'upload' | 'camera'>('preset');
  const [selectedUrl, setSelectedUrl] = useState(currentAvatarUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Camera state
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (currentAvatarUrl) setSelectedUrl(currentAvatarUrl);
  }, [currentAvatarUrl]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleSelectPreset = (url: string) => {
    setSelectedUrl(url);
    onSelect(url);
    setErrorMsg('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setSelectedUrl(data.url);
        onSelect(data.url);
      } else {
        setErrorMsg(data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  const startCamera = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 400 }, height: { ideal: 400 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsStreaming(true);
    } catch (err: any) {
      setErrorMsg('Camera access denied or unavailable on this device.');
      setIsStreaming(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    try {
      setIsUploading(true);
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Upload to Next.js public site assets
        const res = await fetch('/api/upload-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl }),
        });

        const data = await res.json();
        if (data.success && data.url) {
          setSelectedUrl(data.url);
          onSelect(data.url);
          stopCamera();
        } else {
          setErrorMsg(data.error || 'Failed to save camera snapshot');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error capturing photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-slate-300">{label}</label>

      {/* Avatar Preview & Source Selector */}
      <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative">
          <img
            src={selectedUrl || '/avatars/default-avatar.svg'}
            alt="Avatar Preview"
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-md bg-slate-800"
          />
          {selectedUrl && (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow">
              <Check className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-1">
          <p className="text-xs text-white font-medium">
            {selectedUrl ? 'Asset Selected' : 'No Photo Selected'}
          </p>
          <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
            {selectedUrl || 'Stored locally as static site asset'}
          </p>
        </div>
      </div>

      {/* Mode Sub-Tabs */}
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveTab('preset');
          }}
          className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'preset' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Grid className="w-3.5 h-3.5" /> Choose Preset
        </button>

        <button
          type="button"
          onClick={() => {
            stopCamera();
            setActiveTab('upload');
          }}
          className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload File
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('camera');
            startCamera();
          }}
          className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'camera' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" /> Live Camera
        </button>
      </div>

      {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}

      {/* Tab 1: Preset Grid */}
      {activeTab === 'preset' && (
        <div className="grid grid-cols-4 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 max-h-40 overflow-y-auto">
          {PRESET_AVATARS.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => handleSelectPreset(preset.url)}
              className={`group relative rounded-xl overflow-hidden border-2 transition p-0.5 ${
                selectedUrl === preset.url
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                  : 'border-transparent hover:border-slate-600'
              }`}
            >
              <img
                src={preset.url}
                alt={preset.label}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <span className="text-[10px] text-slate-300 block truncate text-center mt-1">
                {preset.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Tab 2: File Upload */}
      {activeTab === 'upload' && (
        <div className="border border-dashed border-slate-700 hover:border-indigo-500/80 rounded-xl p-4 text-center bg-slate-950/40 transition">
          <input
            type="file"
            accept="image/*"
            id="avatar-file-upload"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="avatar-file-upload" className="cursor-pointer block space-y-2">
            <div className="w-9 h-9 mx-auto bg-indigo-950/80 text-indigo-400 rounded-full flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-white">Click to select photo from device</p>
            <p className="text-[11px] text-slate-400">PNG, JPG, or WebP (Saved to site assets)</p>
          </label>
          {isUploading && <p className="text-xs text-indigo-400 mt-2">Uploading image asset...</p>}
        </div>
      )}

      {/* Tab 3: Live Camera Viewfinder */}
      {activeTab === 'camera' && (
        <div className="space-y-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
          <div className="relative w-44 h-44 mx-auto rounded-full overflow-hidden border-2 border-indigo-500 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs p-4">
                Camera inactive
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2">
            {!isStreaming ? (
              <button
                type="button"
                onClick={startCamera}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Start Camera
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={isUploading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Camera className="w-3.5 h-3.5" /> Snap Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
