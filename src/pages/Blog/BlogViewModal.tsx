import React from 'react';
import { X, Calendar, User, Heart, Globe, Image as ImageIcon, Edit, Link as LinkIcon } from 'lucide-react';
import { Blog } from './types';

interface Props {
  blog: Blog | null;
  onClose: () => void;
  onEdit: (blog: Blog) => void;
}

const BlogViewModal: React.FC<Props> = ({ blog, onClose, onEdit }) => {
  if (!blog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6 flex flex-col max-h-[90vh] border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 text-orange-700">
              Blog Article
            </span>
            <span className="text-xs text-gray-400 font-mono">ID: {blog.id}</span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                onClose();
                onEdit(blog);
              }}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm mr-2"
            >
              <Edit size={13} />
              <span>Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Banner */}
          {blog.banner_url ? (
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 h-56 w-full shadow-sm">
              <img
                src={blog.banner_url}
                alt={blog.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/600x200?text=No+Banner+Image';
                }}
              />
            </div>
          ) : (
            <div className="h-32 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs">
              <ImageIcon size={20} className="mr-2" />
              <span>No banner image uploaded</span>
            </div>
          )}

          {/* Title & Metadata */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">
              {blog.title}
            </h1>
            {blog.subtitle && (
              <p className="mt-1 text-sm text-gray-500 font-medium">
                {blog.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-1.5">
                <User size={14} className="text-orange-600" />
                <span>By <strong className="text-gray-700">{blog.author || 'Admin'}</strong></span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Calendar size={14} className="text-gray-400" />
                <span>
                  {blog.created_at
                    ? new Date(blog.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Heart size={14} className="text-red-500 fill-red-500" />
                <span>{blog.likes || 0} Likes</span>
              </div>
              {blog.url_slug && (
                <div className="flex items-center space-x-1.5 text-orange-600 font-mono">
                  <LinkIcon size={12} />
                  <span>/{blog.url_slug}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {blog.description && (
            <div className="p-4 bg-orange-50/50 border-l-4 border-orange-500 rounded-r-xl">
              <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider mb-1">
                Excerpt / Summary
              </h4>
              <p className="text-xs text-orange-950 leading-relaxed">
                {blog.description}
              </p>
            </div>
          )}

          {/* Content */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Article Content
            </h4>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 leading-relaxed font-sans whitespace-pre-wrap max-h-96 overflow-y-auto">
              {blog.content || <span className="italic text-gray-400">No content provided</span>}
            </div>
          </div>

          {/* SEO Details Accordion/Card */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-800">
              <Globe size={15} className="text-orange-600" />
              <span>SEO & Meta Configuration</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Meta Title
                </span>
                <span className="text-gray-800 font-medium">{blog.meta_title || '—'}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Robots Tag
                </span>
                <span className="text-gray-800 font-medium">{blog.robots_tag || '—'}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg sm:col-span-2">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Meta Description
                </span>
                <span className="text-gray-800">{blog.meta_description || '—'}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Canonical URL
                </span>
                <span className="text-gray-800 truncate block">{blog.canonical_tag || '—'}</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-lg">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                  Keywords
                </span>
                <span className="text-gray-800">{blog.meta_keywords || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogViewModal;
