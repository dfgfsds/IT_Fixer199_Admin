import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Search,
  RotateCcw,
  Edit3,
  Trash2,
  Eye,
  FileText,
  Heart,
  Globe,
  Calendar,
  User,
  AlertTriangle,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import axiosInstance from '../../configs/axios-middleware';
import Api from '../../api-endpoints/ApiUrls';
import { extractErrorMessage } from '../../utils/extractErrorMessage ';
import toast from 'react-hot-toast';
import Pagination from '../../components/Pagination';
import BlogModal from './BlogModal';
import BlogViewModal from './BlogViewModal';
import { Blog } from './types';

const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [viewBlog, setViewBlog] = useState<Blog | null>(null);
  const [deleteBlog, setDeleteBlog] = useState<Blog | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(Api.blog);
      // Support array directly, res.data.data, or res.data.blogs
      let data: Blog[] = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (Array.isArray(res.data?.data)) {
        data = res.data.data;
      } else if (Array.isArray(res.data?.blogs)) {
        data = res.data.blogs;
      } else if (Array.isArray(res.data?.results)) {
        data = res.data.results;
      }
      setBlogs(data);
    } catch (err: any) {
      console.error('Fetch blogs error:', err);
      toast.error(extractErrorMessage(err) || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  // Filter blogs by search term
  const filteredBlogs = useMemo(() => {
    if (!search.trim()) return blogs;
    const q = search.toLowerCase();
    return blogs.filter(
      (b) =>
        b.title?.toLowerCase()?.includes(q) ||
        b.subtitle?.toLowerCase()?.includes(q) ||
        b.author?.toLowerCase()?.includes(q) ||
        b.url_slug?.toLowerCase()?.includes(q) ||
        b.description?.toLowerCase()?.includes(q)
    );
  }, [blogs, search]);

  // Paginated blogs
  const totalPages = Math.ceil(filteredBlogs.length / pageSize) || 1;
  const paginatedBlogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBlogs.slice(start, start + pageSize);
  }, [filteredBlogs, page, pageSize]);

  // Stats
  const totalLikes = useMemo(
    () => blogs.reduce((sum, b) => sum + (Number(b.likes) || 0), 0),
    [blogs]
  );
  const uniqueAuthors = useMemo(
    () => new Set(blogs.map((b) => b.author).filter(Boolean)).size,
    [blogs]
  );

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteBlog) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`${Api.blog}${deleteBlog.id}/`);
      toast.success('Blog deleted successfully');
      setDeleteBlog(null);
      fetchBlogs();
    } catch (err: any) {
      console.error('Delete blog error:', err);
      toast.error(extractErrorMessage(err) || 'Failed to delete blog');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Blog Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create, edit, and organize company blog articles, news, and SEO parameters.
          </p>
        </div>

        <button
          onClick={() => {
            setEditBlog(null);
            setShowModal(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <Plus size={16} className="mr-1.5" />
          <span>Create Blog</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Articles</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{blogs.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
            <Heart size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Likes</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{totalLikes}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Active Authors</p>
            <h3 className="text-xl font-bold text-gray-900 mt-0.5">{uniqueAuthors}</h3>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search blogs by title, author, slug..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Clear
            </button>
          )}

          <button
            onClick={fetchBlogs}
            disabled={loading}
            title="Refresh List"
            className="p-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
          >
            <RotateCcw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="animate-spin mx-auto text-orange-600 mb-3" size={32} />
            <p className="text-xs text-gray-500 font-medium">Loading blog articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText size={24} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">
              {search ? 'No matching blogs found' : 'No blogs created yet'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {search
                ? `No articles match "${search}". Try checking for spelling errors or clear your search.`
                : 'Get started by creating your very first blog article to display on the platform.'}
            </p>
            {!search && (
              <button
                onClick={() => {
                  setEditBlog(null);
                  setShowModal(true);
                }}
                className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Plus size={14} className="mr-1.5" />
                <span>Create Blog</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-20">Banner</th>
                  <th className="py-3 px-4 min-w-[200px]">Title & Subtitle</th>
                  {/* <th className="py-3 px-4">Author</th> */}
                  {/* <th className="py-3 px-4">Slug</th> */}
                  {/* <th className="py-3 px-4 text-center">Likes</th> */}
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {paginatedBlogs.map((blog, idx) => (
                  <tr
                    key={blog.id || idx}
                    className="hover:bg-orange-50/30 transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 text-center text-gray-400 font-medium">
                      {(page - 1) * pageSize + idx + 1}
                    </td>

                    {/* Banner */}
                    <td className="py-3.5 px-4">
                      {blog.banner_url ? (
                        <div className="w-14 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                          <img
                            src={blog.banner_url}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://placehold.co/100x70?text=No+Img';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                          <ImageIcon size={14} />
                        </div>
                      )}
                    </td>

                    {/* Title & Subtitle */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {blog.title}
                      </div>
                      {blog.subtitle ? (
                        <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                          {blog.subtitle}
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                          {blog.description || 'No subtitle'}
                        </div>
                      )}
                      {blog.meta_keywords && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {blog.meta_keywords
                            .split(',')
                            .map((k) => k.trim())
                            .filter(Boolean)
                            .slice(0, 4)
                            .map((kw, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-orange-50 text-orange-700 border border-orange-100 font-medium"
                              >
                                #{kw}
                              </span>
                            ))}
                        </div>
                      )}
                    </td>

                    {/* Author */}
                    {/* <td className="py-3.5 px-4">
                      <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium">
                        <User size={12} className="text-gray-400" />
                        <span>{blog.author || 'Admin'}</span>
                      </div>
                    </td> */}

                    {/* Slug */}
                    {/* <td className="py-3.5 px-4">
                      {blog.url_slug ? (
                        <span className="font-mono text-[11px] text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                          /{blog.url_slug}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px] italic">No slug</span>
                      )}
                    </td> */}

                    {/* Likes */}
                    {/* <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-700 bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                        <Heart size={11} className="fill-red-500 text-red-500" />
                        <span>{blog.likes || 0}</span>
                      </span>
                    </td> */}

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>
                          {blog.created_at
                            ? new Date(blog.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                            : '—'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => setViewBlog(blog)}
                          title="View Details"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setEditBlog(blog);
                            setShowModal(true);
                          }}
                          title="Edit Blog"
                          className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteBlog(blog)}
                          title="Delete Blog"
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reusable Pagination Component */}
        {!loading && filteredBlogs.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredBlogs.length}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setPage(1);
            }}
          />
        )}
      </div>

      {/* Create / Edit Modal */}
      <BlogModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditBlog(null);
        }}
        onSuccess={() => {
          fetchBlogs();
        }}
        editBlog={editBlog}
      />

      {/* View Preview Modal */}
      <BlogViewModal
        blog={viewBlog}
        onClose={() => setViewBlog(null)}
        onEdit={(blog) => {
          setEditBlog(blog);
          setShowModal(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900">Delete Blog Article</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-gray-800">"{deleteBlog.title}"</strong>? This
              action cannot be undone.
            </p>
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={() => setDeleteBlog(null)}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition flex items-center justify-center space-x-1.5"
              >
                {deleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
