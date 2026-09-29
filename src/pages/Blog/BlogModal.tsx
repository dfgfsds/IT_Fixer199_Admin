import React, { useEffect, useState } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  FileText,
  Globe,
  Layers,
  Trash2,
} from 'lucide-react';
import axiosInstance from '../../configs/axios-middleware';
import Api from '../../api-endpoints/ApiUrls';
import { extractErrorMessage } from '../../utils/extractErrorMessage ';
import toast from 'react-hot-toast';
import { Blog, BlogFormData } from './types';

interface Props {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editBlog: Blog | null;
}

const initialFormData: BlogFormData = {
  title: '',
  subtitle: '',
  description: '',
  content: '',
  banner_url: '',
  author: 'Admin',
  likes: 0,
  meta_tags: '',
  meta_keywords: '',
  meta_title: '',
  meta_description: '',
  canonical_tag: '',
  robots_tag: 'index, follow',
  url_description: '',
  og_tags: '',
  twitter_tags: '',
  image_src_tags: '',
  schema: '',
  url_slug: '',
};

const BlogModal: React.FC<Props> = ({
  show,
  onClose,
  onSuccess,
  editBlog,
}) => {
  const isEdit = !!editBlog;
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'seo'>('basic');
  const [form, setForm] = useState<BlogFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (editBlog) {
      setForm({
        title: editBlog.title || '',
        subtitle: editBlog.subtitle || '',
        description: editBlog.description || '',
        content: editBlog.content || '',
        banner_url: editBlog.banner_url || '',
        author: editBlog.author || 'Admin',
        likes: editBlog.likes || 0,
        meta_tags: editBlog.meta_tags || '',
        meta_keywords: editBlog.meta_keywords || '',
        meta_title: editBlog.meta_title || '',
        meta_description: editBlog.meta_description || '',
        canonical_tag: editBlog.canonical_tag || '',
        robots_tag: editBlog.robots_tag || 'index, follow',
        url_description: editBlog.url_description || '',
        og_tags: editBlog.og_tags || '',
        twitter_tags: editBlog.twitter_tags || '',
        image_src_tags: editBlog.image_src_tags || '',
        schema: editBlog.schema || '',
        url_slug: editBlog.url_slug || '',
      });
    } else {
      setForm(initialFormData);
    }
    setActiveTab('basic');
    setApiError('');
  }, [editBlog, show]);

  if (!show) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'likes' ? Number(value) || 0 : value,
    }));
  };

  // Helper to generate slug from title
  const generateSlug = () => {
    if (!form.title.trim()) {
      toast.error('Please enter a title first');
      return;
    }
    const slug = form.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setForm((prev) => ({ ...prev, url_slug: slug }));
    toast.success('Slug generated!');
  };

  // Upload Banner Image via Media API
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setUploadingImage(true);
    try {
      const mediaFormData = new FormData();
      mediaFormData.append('file', file);
      mediaFormData.append('media_type', 'image');
      mediaFormData.append('title', form.title || file.name || 'Blog Banner');
      mediaFormData.append('tag', 'blog');
      mediaFormData.append('alt_text', form.title || 'Blog Banner');

      // UUID fallback if crypto.randomUUID exists, else standard uuid
      const referenceId =
        editBlog?.id ||
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : '3fa85f64-5717-4562-b3fc-2c963f66afa6');

      mediaFormData.append('reference_id', referenceId);
      mediaFormData.append('reference_type', 'BLOG');
      mediaFormData.append('is_primary', 'true');
      mediaFormData.append('status', 'ACTIVE');

      const res = await axiosInstance.post(Api.media, mediaFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl =
        res.data?.data?.url ||
        res.data?.url ||
        res.data?.data?.file_url ||
        res.data?.file_url;

      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, banner_url: uploadedUrl }));
        toast.success('Banner uploaded successfully!');
      } else {
        toast.error('Uploaded, but image URL was not returned.');
      }
    } catch (err: any) {
      console.error('Media upload error:', err);
      toast.error(extractErrorMessage(err) || 'Failed to upload banner image');
    } finally {
      setUploadingImage(false);
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Blog title is required');
      setActiveTab('basic');
      return;
    }

    setSubmitting(true);
    setApiError('');

    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle?.trim() || '',
        description: form.description?.trim() || '',
        content: form.content?.trim() || '',
        banner_url: form.banner_url?.trim() || '',
        author: form.author?.trim() || 'Admin',
        likes: Number(form.likes) || 0,
        meta_tags: form.meta_tags?.trim() || '',
        meta_keywords: form.meta_keywords?.trim() || '',
        meta_title: form.meta_title?.trim() || '',
        meta_description: form.meta_description?.trim() || '',
        canonical_tag: form.canonical_tag?.trim() || '',
        robots_tag: form.robots_tag?.trim() || '',
        url_description: form.url_description?.trim() || '',
        og_tags: form.og_tags?.trim() || '',
        twitter_tags: form.twitter_tags?.trim() || '',
        image_src_tags: form.image_src_tags?.trim() || '',
        schema: form.schema?.trim() || '',
        url_slug: form.url_slug?.trim() || '',
      };

      if (isEdit && editBlog) {
        await axiosInstance.put(`${Api.blog}${editBlog.id}/`, payload);
        toast.success('Blog updated successfully!');
      } else {
        await axiosInstance.post(Api.blog, payload);
        toast.success('Blog created successfully!');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Save blog error:', err);
      const msg = extractErrorMessage(err) || 'Failed to save blog';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-6 flex flex-col max-h-[92vh] border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/70 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-sm">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEdit ? 'Edit Blog Article' : 'Create New Blog Article'}
              </h2>
              <p className="text-xs text-gray-500">
                Fill in the details, content, banner image, and SEO meta tags
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-gray-200 bg-gray-50/60 flex space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${activeTab === 'basic'
              ? 'border-orange-600 text-orange-600 bg-white shadow-sm'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
          >
            <Layers size={14} />
            <span>Basic Info</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${activeTab === 'content'
              ? 'border-orange-600 text-orange-600 bg-white shadow-sm'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
          >
            <FileText size={14} />
            <span>Description & Content</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${activeTab === 'seo'
              ? 'border-orange-600 text-orange-600 bg-white shadow-sm'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
              }`}
          >
            <Globe size={14} />
            <span>SEO & Meta Tags</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {apiError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {apiError}
            </div>
          )}

          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Blog Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter blog title..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleChange}
                    placeholder="Brief subtitle or tagline..."
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      URL Slug
                    </label>
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center space-x-1"
                    >
                      <Sparkles size={12} />
                      <span>Auto Slug</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    name="url_slug"
                    value={form.url_slug}
                    onChange={handleChange}
                    placeholder="e.g. how-to-fix-it-issues"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                  />
                </div>

                {/* <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Author
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={form.author}
                      onChange={handleChange}
                      placeholder="Author name"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Initial Likes
                    </label>
                    <input
                      type="number"
                      name="likes"
                      min={0}
                      value={form.likes}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                </div> */}

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="meta_keywords"
                    value={form.meta_keywords}
                    onChange={handleChange}
                    placeholder="e.g. computer repair, laptop service, tech support (comma separated)"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                  />
                  {form.meta_keywords && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.meta_keywords
                        .split(',')
                        .map((kw) => kw.trim())
                        .filter(Boolean)
                        .map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-orange-50 text-orange-700 border border-orange-200"
                          >
                            #{kw}
                          </span>
                        ))}
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    Enter comma-separated keywords for SEO & search.
                  </p>
                </div>
              </div>

              {/* Banner Upload Box */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-800">
                    Banner Image (via Media API)
                  </label>
                  {form.banner_url && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, banner_url: '' }))}
                      className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                    >
                      <Trash2 size={12} />
                      <span>Remove Image</span>
                    </button>
                  )}
                </div>

                {/* Live Preview */}
                {form.banner_url ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 max-h-48 flex items-center justify-center group">
                    <img
                      src={form.banner_url}
                      alt="Banner Preview"
                      className="w-full h-48 object-cover transition-transform group-hover:scale-105 duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/600x200?text=Invalid+Image+URL';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <label className="cursor-pointer bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors shadow">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBannerUpload}
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-500 transition-colors bg-white">
                    <div className="mx-auto w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                      {uploadingImage ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : (
                        <ImageIcon size={24} />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-700">
                      {uploadingImage
                        ? 'Uploading image via /api/media/ ...'
                        : 'Upload Blog Banner Image'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      PNG, JPG, WEBP up to 10MB
                    </p>
                    <label className="mt-3 inline-flex items-center justify-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-medium cursor-pointer transition shadow-sm">
                      <Upload size={14} className="mr-1.5" />
                      <span>{uploadingImage ? 'Uploading...' : 'Browse Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                )}

                {/* Or Direct URL Input */}
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">
                    Or direct image URL:
                  </label>
                  <input
                    type="url"
                    name="banner_url"
                    value={form.banner_url}
                    onChange={handleChange}
                    placeholder="https://example.com/banner.jpg"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Short Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="A compelling summary or excerpt of the blog..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Full Blog Content (HTML or Markdown)
                </label>
                <textarea
                  name="content"
                  rows={14}
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Write or paste your full blog article content here..."
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 leading-relaxed"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Supports plain text, Markdown, or HTML tags.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SEO & META TAGS */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="bg-orange-50/50 border border-orange-200/60 p-3.5 rounded-xl text-xs text-orange-900 leading-relaxed">
                Configure SEO meta tags, social share previews, and search engine directives for this article.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={form.meta_title}
                    onChange={handleChange}
                    placeholder="SEO page title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Canonical Tag URL
                  </label>
                  <input
                    type="text"
                    name="canonical_tag"
                    value={form.canonical_tag}
                    onChange={handleChange}
                    placeholder="https://itfixer199.com/blog/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    rows={2}
                    value={form.meta_description}
                    onChange={handleChange}
                    placeholder="Brief SEO meta description (150-160 characters recommended)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="meta_keywords"
                    value={form.meta_keywords}
                    onChange={handleChange}
                    placeholder="it repair, fixer, computer service"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Robots Tag
                  </label>
                  <input
                    type="text"
                    name="robots_tag"
                    value={form.robots_tag}
                    onChange={handleChange}
                    placeholder="index, follow"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Meta Tags (Raw)
                  </label>
                  <input
                    type="text"
                    name="meta_tags"
                    value={form.meta_tags}
                    onChange={handleChange}
                    placeholder="Custom meta tags"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    URL Description
                  </label>
                  <input
                    type="text"
                    name="url_description"
                    value={form.url_description}
                    onChange={handleChange}
                    placeholder="URL description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Open Graph (OG) Tags
                  </label>
                  <textarea
                    name="og_tags"
                    rows={2}
                    value={form.og_tags}
                    onChange={handleChange}
                    placeholder='og:title, og:description...'
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Twitter Tags
                  </label>
                  <textarea
                    name="twitter_tags"
                    rows={2}
                    value={form.twitter_tags}
                    onChange={handleChange}
                    placeholder='twitter:card, twitter:creator...'
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Image SRC Tags
                  </label>
                  <input
                    type="text"
                    name="image_src_tags"
                    value={form.image_src_tags}
                    onChange={handleChange}
                    placeholder="image_src link"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Structured Schema (JSON-LD)
                  </label>
                  <textarea
                    name="schema"
                    rows={3}
                    value={form.schema}
                    onChange={handleChange}
                    placeholder='{"@context": "https://schema.org", "@type": "BlogPosting", ...}'
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <div className="flex space-x-2">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(activeTab === 'seo' ? 'content' : 'basic')
                  }
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
                >
                  Previous
                </button>
              )}
              {activeTab !== 'seo' ? (
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(activeTab === 'basic' ? 'content' : 'seo')
                  }
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Next Section
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 transition"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>{isEdit ? 'Updating...' : 'Publishing...'}</span>
                    </>
                  ) : (
                    <span>{isEdit ? 'Save Changes' : 'Create Blog'}</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogModal;
