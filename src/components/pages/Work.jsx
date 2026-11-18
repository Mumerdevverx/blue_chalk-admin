import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workService } from '../../services/workService';
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiMove,
  FiSave,
  FiCheck,
  FiAlertCircle,
  FiRotateCcw
} from 'react-icons/fi';
import ImagePicker from '../../components/ImagePicker';
import TipTapEditor from '../../components/TipTapEditor';
import getImageUrl from '../../utils/imageUrl';
import { createWorkAboutContent, getWorkAboutContent } from '../../utils/workAboutContent';
import { getWorkNameSlug } from '../../utils/workSlug';

function sortAllProjects(items) {
  return items
    .filter((item) => String(item.category || '').trim().toLowerCase() !== 'award')
    .sort((a, b) => {
      const orderA = Number(a.order);
      const orderB = Number(b.order);
      const hasOrderA = Number.isFinite(orderA) && orderA > 0;
      const hasOrderB = Number.isFinite(orderB) && orderB > 0;

      if (hasOrderA && hasOrderB) return orderA - orderB;
      if (hasOrderA) return -1;
      if (hasOrderB) return 1;

      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateA - dateB || String(a._id).localeCompare(String(b._id));
    });
}

function Work() {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [orderedAllProjects, setOrderedAllProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [orderSaveStatus, setOrderSaveStatus] = useState({ type: '', message: '' });
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    category: 'All Projects',
    image: '',
    buttonText: 'Watch Now',
    award: '',
    aboutContent: '',
    aboutContextText: '',
    aboutLeftText: '',
    aboutRightText: '',
    showOverlay: false,
    overlayType: '',
    order: ''
  });

  const categories = [
    { label: 'All Projects', value: 'All' },
    { label: 'Featured', value: 'Featured' },
    { label: 'Brand', value: 'Branded' },
    { label: 'Entertainment', value: 'Entertainment' },
    { label: 'Social Impact', value: 'Social Impact' },
    { label: 'Documentary', value: 'Documentary' },
    { label: 'Award', value: 'Award' }
  ];

  // Specific category works keep their original/default ordering (untouched)
  const categoryWorks = activeCategory === 'All'
    ? []
    : works
        .filter((item) => {
          const itemCat = String(item.category || '').trim().toLowerCase();
          const activeCat = String(activeCategory || '').trim().toLowerCase();

          if (activeCat === 'branded' || activeCat === 'brand') {
            return itemCat === 'branded' || itemCat === 'brand';
          }
          if (activeCat === 'award' || activeCat === 'awards') {
            return itemCat === 'award' || itemCat === 'awards';
          }
          return itemCat === activeCat;
        })
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateA - dateB || String(a._id).localeCompare(String(b._id));
        });

  const displayedWorks = activeCategory === 'All' ? orderedAllProjects : categoryWorks;

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    setLoading(true);
    setOrderSaveStatus({ type: '', message: '' });
    try {
      const res = await workService.getAll();
      const items = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      const normalizedItems = items.map((item) => ({
        ...item,
        category: item.category?.trim().toLowerCase() === 'awards'
          ? 'Award'
          : item.category
      }));

      setWorks(normalizedItems);
      const sortedAll = sortAllProjects(normalizedItems);
      setOrderedAllProjects(sortedAll);
      setHasOrderChanges(false);
    } catch (error) {
      console.error('Error loading works:', error);
      alert('Failed to load works');
    }
    setLoading(false);
  };

  // Drag and Drop Handlers for All Projects
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...orderedAllProjects];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, moved);

    setOrderedAllProjects(updated);
    setHasOrderChanges(true);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Up/Down buttons for All Projects reordering
  const moveItemUp = (index) => {
    if (index <= 0) return;
    const updated = [...orderedAllProjects];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setOrderedAllProjects(updated);
    setHasOrderChanges(true);
  };

  const moveItemDown = (index) => {
    if (index >= orderedAllProjects.length - 1) return;
    const updated = [...orderedAllProjects];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setOrderedAllProjects(updated);
    setHasOrderChanges(true);
  };

  // Save new order to database
  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    setOrderSaveStatus({ type: '', message: '' });

    try {
      const projectIds = orderedAllProjects.map((item) => item._id);
      await workService.saveOrder(projectIds);

      setHasOrderChanges(false);
      setOrderSaveStatus({
        type: 'success',
        message: 'Order saved successfully! Public All Projects section will now display this order.'
      });

      // Update local works order values
      setWorks((prevWorks) =>
        prevWorks.map((work) => {
          const idx = projectIds.indexOf(work._id);
          return idx !== -1 ? { ...work, order: idx + 1 } : work;
        })
      );

      setTimeout(() => {
        setOrderSaveStatus((prev) => (prev.type === 'success' ? { type: '', message: '' } : prev));
      }, 4000);
    } catch (error) {
      console.error('Error saving order:', error);
      setOrderSaveStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to save order. Please try again.'
      });
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleResetOrder = () => {
    const original = sortAllProjects(works);
    setOrderedAllProjects(original);
    setHasOrderChanges(false);
    setOrderSaveStatus({ type: '', message: '' });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image.trim()) return alert('Image is required');
    if (!formData.aboutContent.trim() && !editingWork?.legacyAboutColumns) {
      return alert('About Content is required');
    }
    const order = Number(formData.order);
    if (!Number.isInteger(order) || order < 1) return alert('Order must be a whole number greater than 0');

    setIsSaving(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([key]) => (
          !['order', 'aboutContextText', 'aboutLeftText', 'aboutRightText'].includes(key)
        ))
      );
      payload.order = order;

      if (formData.aboutContextText.trim() || formData.aboutLeftText.trim() || formData.aboutRightText.trim()) {
        payload.aboutContent = createWorkAboutContent(
          formData.aboutContent,
          formData.aboutLeftText,
          formData.aboutRightText,
          formData.aboutContextText
        );
      }

      if (editingWork) {
        await workService.update(editingWork._id, payload);
        alert('✅ Work updated successfully!');
      } else {
        await workService.create(payload);
        alert('✅ Work created successfully!');
      }

      setShowModal(false);
      setEditingWork(null);
      resetForm();
      await loadWorks();
    } catch (error) {
      console.error('Error saving work:', error);
      alert('Failed to save work');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (work) => {
    if (!window.confirm('Delete this work? It will be removed from all categories.')) return;
    try {
      await workService.delete(work._id);
      alert('✅ Deleted');
      loadWorks();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const resetForm = (category = 'All Projects') => {
    // Default order is set to the end of the All Projects list
    const defaultNextOrder = orderedAllProjects.length + 1;
    setFormData({
      category,
      image: '',
      buttonText: 'Watch Now',
      award: '',
      aboutContent: '',
      aboutContextText: '',
      aboutLeftText: '',
      aboutRightText: '',
      showOverlay: false,
      overlayType: '',
      order: defaultNextOrder
    });
    setEditingWork(null);
  };

  const handleEdit = (work) => {
    const aboutContent = getWorkAboutContent(work.aboutContent);
    setEditingWork({ ...work, legacyAboutColumns: aboutContent.legacyColumns });
    setFormData({
      category: work.category || 'All Projects',
      image: work.image || '',
      buttonText: work.buttonText || 'Watch Now',
      award: work.award || '',
      aboutContent: aboutContent.content,
      aboutContextText: aboutContent.contextText,
      aboutLeftText: aboutContent.left,
      aboutRightText: aboutContent.right,
      showOverlay: work.showOverlay || false,
      overlayType: work.overlayType || '',
      order: work.order || ''
    });
    setShowModal(true);
  };

  const handleReadMore = (work) => {
    const slug = getWorkNameSlug(work);
    if (slug) {
      navigate(`/work/${slug}`);
    } else {
      alert('Slug not found for this work.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🎬 Work Management</h1>
          <div className="flex gap-2">
            <button
              onClick={loadWorks}
              className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FiRefreshCw /> Refresh
            </button>
            <button
              onClick={() => {
                resetForm(activeCategory === 'All' ? 'All Projects' : activeCategory);
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FiPlus /> Add Work
            </button>
          </div>
        </div>

        {/* Categories Tab Navigation */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-2 border-b border-gray-300" role="tablist" aria-label="Filter works by category">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                role="tab"
                aria-selected={activeCategory === category.value}
                onClick={() => setActiveCategory(category.value)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                  activeCategory === category.value
                    ? 'border-blue-600 text-blue-700 font-semibold'
                    : 'border-transparent text-gray-600 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* All Projects Reordering Control Bar (ONLY displayed in All Projects tab) */}
        {activeCategory === 'All' && (
          <div className="mb-6 bg-white border border-blue-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">
                  Manual Ordering (All Projects)
                </h2>
                {hasOrderChanges && (
                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    ● Unsaved Changes
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Drag cards to reorder or use the ↑ / ↓ arrow controls. Click <strong>Save Order</strong> to persist the new order to the database and public site.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {hasOrderChanges && (
                <button
                  type="button"
                  onClick={handleResetOrder}
                  disabled={isSavingOrder}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FiRotateCcw className="text-sm" /> Reset
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveOrder}
                disabled={isSavingOrder || !hasOrderChanges}
                className={`px-4 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                  hasOrderChanges
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                } disabled:opacity-50`}
              >
                {isSavingOrder ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                    Saving Order...
                  </>
                ) : (
                  <>
                    <FiSave className="text-sm" /> Save Order
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Order Save Notification Status */}
        {activeCategory === 'All' && orderSaveStatus.message && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm flex items-center gap-2 ${
              orderSaveStatus.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {orderSaveStatus.type === 'success' ? (
              <FiCheck className="text-green-600 flex-shrink-0" />
            ) : (
              <FiAlertCircle className="text-red-600 flex-shrink-0" />
            )}
            <span>{orderSaveStatus.message}</span>
          </div>
        )}

        {/* Works Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedWorks.map((item, index) => {
            const isAllProjectsTab = activeCategory === 'All';
            const isDragged = draggedIndex === index;
            const isOver = dragOverIndex === index;

            return (
              <div
                key={item._id}
                draggable={isAllProjectsTab}
                onDragStart={isAllProjectsTab ? (e) => handleDragStart(e, index) : undefined}
                onDragOver={isAllProjectsTab ? (e) => handleDragOver(e, index) : undefined}
                onDrop={isAllProjectsTab ? (e) => handleDrop(e, index) : undefined}
                onDragEnd={isAllProjectsTab ? handleDragEnd : undefined}
                className={`bg-white rounded-lg shadow overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                  isAllProjectsTab ? 'cursor-grab active:cursor-grabbing select-none' : ''
                } ${isDragged ? 'opacity-40 scale-95 border-2 border-blue-400' : ''} ${
                  isOver && !isDragged ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:shadow-lg'
                }`}
              >
                {/* Reordering Header on Card (ONLY in All Projects) */}
                {isAllProjectsTab && (
                  <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiMove className="text-gray-400 hover:text-gray-600 cursor-move" title="Drag to reorder" />
                      <span className="bg-blue-600 text-white font-bold text-xs px-2 py-0.5 rounded">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItemUp(index);
                        }}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      >
                        <FiArrowUp className="text-sm" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItemDown(index);
                        }}
                        disabled={index === displayedWorks.length - 1}
                        title="Move Down"
                        className="p-1 rounded text-gray-600 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                      >
                        <FiArrowDown className="text-sm" />
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title || 'Work'}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                  />
                  <div className="p-4">
                    <p className="text-sm font-bold text-blue-600">
                      Order: {isAllProjectsTab ? index + 1 : (item.order || index + 1)}
                    </p>
                    <p className="text-sm font-semibold text-gray-700">Category: {item.category}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Title Button:</span> {item.buttonText || 'Watch Now'}
                    </p>
                    {item.award && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Award:</span> {item.award}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="flex items-center justify-between mt-3 border-t pt-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-yellow-600 hover:text-yellow-800 text-sm cursor-pointer flex items-center gap-1"
                      >
                        <FiEdit2 className="text-xs" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-800 text-sm cursor-pointer flex items-center gap-1"
                      >
                        <FiTrash2 className="text-xs" /> Delete
                      </button>
                    </div>
                    <button
                      onClick={() => handleReadMore(item)}
                      className="text-[#1893DB] hover:underline text-sm flex items-center gap-1 cursor-pointer"
                    >
                      Read More →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {displayedWorks.length === 0 && (
          <p className="py-10 text-center text-gray-500">No works found in this category.</p>
        )}

        {/* Modal for Add / Edit Work */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">{editingWork ? '✏️ Edit Work' : '➕ Add Work'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="All Projects">All Projects</option>
                    <option value="Featured">Featured</option>
                    <option value="Branded">Branded</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Social Impact">Social Impact</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Award">Award</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Image *</label>
                  <ImagePicker
                    value={formData.image}
                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                    label="Choose Image"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Title Button</label>
                  <input
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleChange}
                    placeholder="Watch Now"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Order *</label>
                  <input
                    type="number"
                    name="order"
                    min="1"
                    step="1"
                    required
                    value={formData.order}
                    onChange={handleChange}
                    placeholder="e.g. 1"
                    className="w-full p-2 border rounded"
                  />
                  <p className="text-xs text-gray-400 mt-1">Position in All Projects ordering</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Award</label>
                  <input
                    name="award"
                    value={formData.award}
                    onChange={handleChange}
                    placeholder="e.g. Cannes Lions"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">About Content *</label>
                  <TipTapEditor
                    value={formData.aboutContent}
                    onChange={(value) => handleContentChange('aboutContent', value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Add text, images, videos – HTML content</p>
                </div>

                <section className="rounded-lg border border-gray-300 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-800">About Us Content</h3>
                  <div className="mb-4">
                    <label htmlFor="aboutContextText" className="mb-1 block text-sm font-medium">Context Text</label>
                    <textarea
                      id="aboutContextText"
                      name="aboutContextText"
                      value={formData.aboutContextText}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded border p-3"
                      placeholder="Enter context text"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="aboutLeftText" className="mb-1 block text-sm font-medium">Left Content</label>
                      <textarea
                        id="aboutLeftText"
                        name="aboutLeftText"
                        value={formData.aboutLeftText}
                        onChange={handleChange}
                        rows={5}
                        className="w-full rounded border p-3"
                        placeholder="Enter left-side content"
                      />
                    </div>
                    <div>
                      <label htmlFor="aboutRightText" className="mb-1 block text-sm font-medium">Right Content</label>
                      <textarea
                        id="aboutRightText"
                        name="aboutRightText"
                        value={formData.aboutRightText}
                        onChange={handleChange}
                        rows={5}
                        className="w-full rounded border p-3"
                        placeholder="Enter right-side content"
                      />
                    </div>
                  </div>
                </section>

                <label className="flex items-center gap-2">
                  <input type="checkbox" name="showOverlay" checked={formData.showOverlay} onChange={handleChange} />
                  Show Overlay
                </label>

                {formData.showOverlay && (
                  <input
                    type="text"
                    name="overlayType"
                    value={formData.overlayType}
                    onChange={handleChange}
                    placeholder="Overlay text (e.g., atomic, firebreak)"
                    className="w-full p-2 border rounded"
                  />
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded cursor-pointer">Cancel</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
                    {isSaving ? 'Saving...' : (editingWork ? 'Update' : 'Save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Work;
