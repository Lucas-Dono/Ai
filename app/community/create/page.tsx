/**
 * Create Post Page - Página rediseñada para crear un nuevo post en la comunidad
 */

"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Type,
  Image as ImageIcon,
  Link as LinkIcon,
  ChevronDown,
  UploadCloud,
  Trash2,
  AlertCircle,
  Info,
  Plus,
  Hash,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Community {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  primaryColor?: string;
  type: string;
  description?: string;
  memberCount: number;
}

interface ImageData {
  url: string;
  filename: string;
  size: number;
  isNSFW: boolean;
  isSpoiler: boolean;
}

export default function CreatePostPage() {
  const t = useTranslations('community.create');
  const router = useRouter();
  const searchParams = useSearchParams();
  const communitySlug = searchParams.get('community');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'text' | 'media' | 'link'>('text');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    linkUrl: "",
    type: "discussion",
    tags: [] as string[],
    communityId: "",
    isNSFW: false,
    isSpoiler: false,
    isOC: false,
    flair: "",
    images: [] as ImageData[],
  });

  // Tabs de tipo de post
  const tabs = [
    { id: 'text' as const, label: 'Texto', icon: Type },
    { id: 'media' as const, label: 'Imagen y Video', icon: ImageIcon },
    { id: 'link' as const, label: 'Enlace', icon: LinkIcon },
  ];

  // Cargar comunidades del usuario al montar el componente
  useEffect(() => {
    async function loadCommunities() {
      try {
        const response = await fetch('/api/community/my-communities');
        if (response.ok) {
          const data = await response.json();
          const loadedCommunities = data.communities || [];
          setCommunities(loadedCommunities);

          // Si viene de una comunidad específica, pre-seleccionarla
          if (communitySlug) {
            const targetCommunity = loadedCommunities.find(
              (c: Community) => c.slug === communitySlug
            );
            if (targetCommunity) {
              setFormData(prev => ({ ...prev, communityId: targetCommunity.id }));
            }
          }
        }
      } catch (error) {
        console.error('Error loading communities:', error);
      } finally {
        setLoadingCommunities(false);
      }
    }

    loadCommunities();
  }, [communitySlug]);

  // Cargar borrador al montar
  useEffect(() => {
    const draft = localStorage.getItem('community_post_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed }));
        if (parsed.activeTab) {
          setActiveTab(parsed.activeTab);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Guardar borrador automáticamente
  const saveDraft = () => {
    const draft = {
      ...formData,
      activeTab,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('community_post_draft', JSON.stringify(draft));
  };

  // Manejar cambio de título
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 300) {
      setFormData({ ...formData, title: value });
    }
  };

  // Manejar cambio de contenido
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 5000) {
      setFormData({ ...formData, content: value });
    }
  };

  // Manejar carga de archivos
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const maxImages = 4;
    if (formData.images.length + files.length > maxImages) {
      alert(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validar tipo
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          throw new Error(`${file.name} no es un archivo válido`);
        }

        // Validar tamaño (5MB para imágenes, 50MB para videos)
        const maxSize = file.type.startsWith('video/') ? 50 : 5;
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`${file.name} es demasiado grande (máx ${maxSize}MB)`);
        }

        // Subir archivo
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al subir archivo');
        }

        const { url } = await response.json();
        return {
          url,
          filename: file.name,
          size: file.size,
          isNSFW: false,
          isSpoiler: false,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedFiles]
      }));
    } catch (err) {
      console.error('Error uploading files:', err);
      alert(err instanceof Error ? err.message : 'Error al subir archivos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Manejar drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  // Eliminar imagen
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Toggle NSFW en imagen específica
  const toggleImageNSFW = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === index ? { ...img, isNSFW: !img.isNSFW } : img
      )
    }));
  };

  // Toggle Spoiler en imagen específica
  const toggleImageSpoiler = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === index ? { ...img, isSpoiler: !img.isSpoiler } : img
      )
    }));
  };

  // Obtener comunidad seleccionada
  const selectedCommunity = communities.find(c => c.id === formData.communityId);

  // Manejar envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (activeTab === 'text' && !formData.content.trim()) {
      alert('El contenido es obligatorio para posts de texto');
      return;
    }

    if (activeTab === 'media' && formData.images.length === 0) {
      alert('Debes agregar al menos una imagen o video');
      return;
    }

    if (activeTab === 'link' && !formData.linkUrl.trim()) {
      alert('La URL es obligatoria para posts de enlace');
      return;
    }

    setLoading(true);

    try {
      // Determinar tipo de post según el tab activo
      let postType = formData.type;
      if (activeTab === 'media') {
        postType = 'showcase';
      } else if (activeTab === 'link') {
        postType = 'announcement';
      }

      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content || (activeTab === 'link' ? formData.linkUrl : ''),
          type: postType,
          tags: formData.tags,
          communityId: formData.communityId || null,
          isNSFW: formData.isNSFW || formData.images.some(img => img.isNSFW),
          images: formData.images.map(img => img.url),
          metadata: {
            isOC: formData.isOC,
            flair: formData.flair,
            isSpoiler: formData.isSpoiler,
            linkUrl: activeTab === 'link' ? formData.linkUrl : undefined,
            imageMetadata: formData.images.map(img => ({
              url: img.url,
              isNSFW: img.isNSFW,
              isSpoiler: img.isSpoiler,
            })),
          },
        }),
      });

      if (response.ok) {
        // Limpiar borrador
        localStorage.removeItem('community_post_draft');

        // Check if user came from the community tour
        const isFromTour = sessionStorage.getItem('community_tour_active') === 'true';
        if (isFromTour) {
          sessionStorage.setItem('returned_from_create', 'true');
        }

        // Redirect
        if (communitySlug) {
          router.push(`/community/${communitySlug}`);
        } else {
          router.push('/community');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Error al crear el post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error al crear el post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#121212] text-neutral-200 font-sans selection:bg-[#6366f1] selection:text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* PAGE HEADER */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#333]">
          <h1 className="text-2xl font-bold text-white tracking-tight">Crear Publicación</h1>
          <button
            onClick={saveDraft}
            className="text-sm font-medium text-neutral-500 hover:text-white transition-colors cursor-pointer"
          >
            Guardar Borrador
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: EDITOR FORM */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. COMMUNITY SELECTOR */}
            <div className="relative">
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">
                Publicar en
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
                  className="w-full sm:w-80 bg-[#1E1E1E] border border-[#333] hover:border-neutral-500 text-white rounded-lg px-4 py-3 flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-[#2a2a2a] border border-[#444] flex items-center justify-center text-[10px] font-bold text-neutral-300">
                      {selectedCommunity ? selectedCommunity.name.substring(0, 2).toUpperCase() : 'GL'}
                    </div>
                    <span className="font-medium text-sm">
                      {selectedCommunity ? `c/${selectedCommunity.name}` : 'Global (Sin comunidad)'}
                    </span>
                  </div>
                  <ChevronDown size={16} className="text-neutral-500 group-hover:text-white transition-colors" />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {showCommunityDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-full sm:w-80 mt-2 bg-[#1E1E1E] border border-[#333] rounded-lg shadow-xl overflow-hidden z-10"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, communityId: '' }));
                          setShowCommunityDropdown(false);
                        }}
                        className={cn(
                          "w-full px-4 py-3 text-left hover:bg-[#252525] transition-colors border-b border-[#333] cursor-pointer",
                          !formData.communityId && "bg-[#252525]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-[#2a2a2a] border border-[#444] flex items-center justify-center text-[10px] font-bold text-neutral-300">
                            GL
                          </div>
                          <div>
                            <div className="font-medium text-sm">Global</div>
                            <div className="text-xs text-neutral-500">Visible para todos</div>
                          </div>
                        </div>
                      </button>
                      {communities.map(community => (
                        <button
                          key={community.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, communityId: community.id }));
                            setShowCommunityDropdown(false);
                          }}
                          className={cn(
                            "w-full px-4 py-3 text-left hover:bg-[#252525] transition-colors border-b border-[#333] last:border-0 cursor-pointer",
                            formData.communityId === community.id && "bg-[#252525]"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-[#2a2a2a] border border-[#444] flex items-center justify-center text-[10px] font-bold text-neutral-300">
                              {community.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-sm">c/{community.name}</div>
                              <div className="text-xs text-neutral-500">{community.memberCount} miembros</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 2. MAIN EDITOR CARD */}
            <form onSubmit={handleSubmit} className="bg-[#1E1E1E] border border-[#333] rounded-lg overflow-hidden shadow-sm">

              {/* Tabs Navigation */}
              <div className="flex border-b border-[#333]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all relative cursor-pointer",
                      activeTab === tab.id
                        ? 'text-white bg-[#252525]'
                        : 'text-neutral-500 hover:text-neutral-300 hover:bg-[#222]'
                    )}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6366f1]"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6 space-y-6">

                {/* Title Input */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium text-neutral-400">Título</label>
                    <span className="text-xs text-neutral-600">{formData.title.length}/300</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Un título interesante e interesante..."
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full bg-[#121212] border border-[#333] rounded-lg p-3 text-white placeholder-neutral-600 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-all font-medium"
                    required
                  />
                </div>

                {/* MEDIA UPLOAD AREA */}
                {activeTab === 'media' && (
                  <div className="space-y-4 animate-in fade-in duration-300">

                    {formData.images.length === 0 ? (
                      /* Empty State: Upload Box */
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center bg-[#181818] transition-colors cursor-pointer group",
                          isDragging ? "border-[#6366f1]" : "border-[#333] hover:border-[#6366f1]"
                        )}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={(e) => handleFileSelect(e.target.files)}
                          className="hidden"
                        />
                        <div className="w-12 h-12 rounded-full bg-[#1E1E1E] border border-[#333] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          {uploading ? (
                            <Loader2 size={24} className="text-[#6366f1] animate-spin" />
                          ) : (
                            <UploadCloud size={24} className="text-neutral-400 group-hover:text-[#6366f1]" />
                          )}
                        </div>
                        <p className="text-white font-medium text-sm mb-1">
                          {uploading ? 'Subiendo archivos...' : 'Arrastra y suelta imágenes o videos'}
                        </p>
                        <p className="text-neutral-500 text-xs">
                          o haz clic para explorar archivos
                        </p>
                      </div>
                    ) : (
                      /* Filled State: Image Previews */
                      <div className="space-y-3">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group rounded-lg overflow-hidden border border-[#333] bg-[#121212]">
                            {/* Header del archivo */}
                            <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-sm border-b border-white/10 p-2 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs font-mono text-neutral-300 flex items-center gap-2 pl-2">
                                <ImageIcon size={12} />
                                {image.filename} <span className="text-neutral-500">({(image.size / 1024 / 1024).toFixed(2)} MB)</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="p-1.5 hover:bg-red-500/20 hover:text-red-500 text-neutral-400 rounded transition-colors cursor-pointer"
                                title="Eliminar archivo"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Imagen */}
                            <div className="relative aspect-video w-full bg-[#000]">
                              <img
                                src={image.url}
                                alt={`Preview ${index + 1}`}
                                className={cn(
                                  "w-full h-full object-contain transition-all",
                                  image.isNSFW && "blur-2xl",
                                  image.isSpoiler && "blur-md"
                                )}
                              />
                              {/* Grid overlay decorativo */}
                              <div
                                className="absolute inset-0 pointer-events-none opacity-20"
                                style={{
                                  backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
                                  backgroundSize: '40px 40px'
                                }}
                              ></div>

                              {/* Badges de estado */}
                              <div className="absolute bottom-2 left-2 flex gap-2">
                                {image.isNSFW && (
                                  <span className="px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded">
                                    NSFW
                                  </span>
                                )}
                                {image.isSpoiler && (
                                  <span className="px-2 py-1 bg-yellow-500/90 text-black text-xs font-bold rounded">
                                    SPOILER
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Controles de imagen */}
                            <div className="p-3 bg-[#181818] border-t border-[#333] flex gap-2">
                              <button
                                type="button"
                                onClick={() => toggleImageSpoiler(index)}
                                className={cn(
                                  "px-3 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                                  image.isSpoiler
                                    ? "border-yellow-500 bg-yellow-500/20 text-yellow-500"
                                    : "border-[#333] hover:border-neutral-500 bg-[#121212] text-neutral-300"
                                )}
                              >
                                {image.isSpoiler ? <EyeOff size={14} /> : <Eye size={14} />}
                                Spoiler
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleImageNSFW(index)}
                                className={cn(
                                  "px-3 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                                  image.isNSFW
                                    ? "border-red-500 bg-red-500/20 text-red-500"
                                    : "border-[#333] hover:border-neutral-500 bg-[#121212] text-neutral-300"
                                )}
                              >
                                {image.isNSFW ? <EyeOff size={14} /> : <Eye size={14} />}
                                NSFW
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Botón para agregar más */}
                        {formData.images.length < 4 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-[#333] hover:border-[#6366f1] rounded-lg p-4 flex items-center justify-center gap-2 text-neutral-400 hover:text-[#6366f1] transition-colors cursor-pointer"
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*,video/*"
                              multiple
                              onChange={(e) => handleFileSelect(e.target.files)}
                              className="hidden"
                            />
                            <Plus size={16} />
                            <span className="text-sm font-medium">
                              Agregar más ({formData.images.length}/4)
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TEXT EDITOR AREA */}
                {activeTab === 'text' && (
                  <div className="animate-in fade-in duration-300 space-y-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-medium text-neutral-400">Contenido</label>
                      <span className="text-xs text-neutral-600">{formData.content.length}/5000</span>
                    </div>
                    <textarea
                      rows={8}
                      placeholder="Escribe tu contenido aquí..."
                      value={formData.content}
                      onChange={handleContentChange}
                      className="w-full bg-[#121212] border border-[#333] rounded-lg p-3 text-white placeholder-neutral-600 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-all resize-y"
                      required
                    ></textarea>
                  </div>
                )}

                {/* LINK AREA */}
                {activeTab === 'link' && (
                  <div className="animate-in fade-in duration-300 space-y-2">
                    <label className="text-xs font-medium text-neutral-400">URL</label>
                    <input
                      type="url"
                      placeholder="https://ejemplo.com"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      className="w-full bg-[#121212] border border-[#333] rounded-lg p-3 text-white placeholder-neutral-600 focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] outline-none transition-all font-mono text-sm"
                      required
                    />
                    <p className="text-xs text-neutral-500">
                      El título se sugerirá automáticamente basado en la URL.
                    </p>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isOC: !prev.isOC }))}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                      formData.isOC
                        ? "border-[#6366f1] bg-[#6366f1]/20 text-[#6366f1]"
                        : "border-[#333] hover:border-neutral-500 bg-[#121212] text-neutral-300"
                    )}
                  >
                    <Plus size={14} /> Etiqueta (OC)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isSpoiler: !prev.isSpoiler }))}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                      formData.isSpoiler
                        ? "border-yellow-500 bg-yellow-500/20 text-yellow-500"
                        : "border-[#333] hover:border-neutral-500 bg-[#121212] text-neutral-300"
                    )}
                  >
                    <Plus size={14} /> Spoiler
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isNSFW: !prev.isNSFW }))}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                      formData.isNSFW
                        ? "border-red-500 bg-red-500/20 text-red-500"
                        : "border-[#333] hover:border-neutral-500 bg-[#121212] text-neutral-300"
                    )}
                  >
                    <Plus size={14} /> NSFW
                  </button>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-[#181818] border-t border-[#333] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium border border-[#333] text-neutral-300 hover:text-white hover:bg-[#222] transition-all cursor-pointer"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg text-sm font-bold bg-[#6366f1] text-white hover:bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={loading || !formData.title}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    'Publicar'
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT COLUMN: RULES & INFO */}
          <div className="lg:col-span-1 space-y-6">

            {/* Rules Card */}
            <div className="bg-[#1E1E1E] border border-[#333] rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#333]">
                <AlertCircle size={18} className="text-[#6366f1]" />
                <h3 className="font-bold text-white text-sm">Reglas de la comunidad</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-neutral-400">
                  <span className="font-bold text-[#6366f1] min-w-[20px]">1.</span>
                  <span className="leading-snug">Mantén tu contenido relacionado con la aplicación o personajes.</span>
                </li>
                <li className="flex gap-3 text-sm text-neutral-400">
                  <span className="font-bold text-[#6366f1] min-w-[20px]">2.</span>
                  <span className="leading-snug">Sé respetuoso con otros usuarios y sus opiniones.</span>
                </li>
                <li className="flex gap-3 text-sm text-neutral-400">
                  <span className="font-bold text-[#6366f1] min-w-[20px]">3.</span>
                  <span className="leading-snug">Proporciona contexto al compartir capturas o experiencias.</span>
                </li>
                <li className="flex gap-3 text-sm text-neutral-400">
                  <span className="font-bold text-[#6366f1] min-w-[20px]">4.</span>
                  <span className="leading-snug">Marca adecuadamente el contenido NSFW o sensible.</span>
                </li>
              </ul>
            </div>

            {/* NSFW Info Card */}
            <div className="bg-[#1E1E1E] border border-[#333] rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info size={18} className="text-[#ff6b6b]" />
                <h3 className="font-bold text-white text-sm">Sobre las etiquetas</h3>
              </div>
              <div className="space-y-3 text-sm text-neutral-400 leading-relaxed">
                <p>
                  <span className="text-red-400 font-semibold">NSFW:</span> Contenido para adultos. <span className="text-neutral-300">No afecta la popularidad</span>, solo aplica filtros visuales para usuarios que desactivan este tipo de contenido.
                </p>
                <p>
                  <span className="text-yellow-400 font-semibold">Spoiler:</span>   Marca el contenido con la etiqueta "spoiler" y añade un botón para revelar el texto
                </p>
                <p className="text-xs text-neutral-500 pt-2 border-t border-[#333]">
                  ⚠️ Contenido NSFW sin marcar infringe las reglas y puede ser eliminado automáticamente o por moderadores.
                </p>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-[#1E1E1E] border border-[#333] rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info size={18} className="text-neutral-500" />
                <h3 className="font-bold text-neutral-300 text-sm">Consejo Pro</h3>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Comparte conversaciones interesantes, sugiere mejoras, discute aspectos técnicos o ayuda a otros usuarios. ¡Las mejores publicaciones aportan valor a la comunidad!
              </p>
            </div>

            <div className="text-xs text-neutral-600 text-center px-4 leading-relaxed">
              Al publicar, aceptas los Términos de Servicio y la Política de Contenido de Blaniel.
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
