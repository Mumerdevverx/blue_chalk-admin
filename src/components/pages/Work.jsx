import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workService } from '../../services/workService';
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi';
import ImagePicker from '../../components/ImagePicker';
import TipTapEditor from '../../components/TipTapEditor';
import getImageUrl from '../../utils/imageUrl';
import { createWorkAboutContent, getWorkAboutContent } from '../../utils/workAboutContent';
import {
  getStoredWorkOrders,
  getWorkOrder,
  getWorkOrderForCategory,
  WORK_ORDER_STORAGE_KEY
} from '../../utils/workOrder';

function Work() {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [storedOrders, setStoredOrders] = useState(getStoredWorkOrders);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAllOrderModal, setShowAllOrderModal] = useState(false);
  const [allOrderCategory, setAllOrderCategory] = useState('Featured');
  const [allProjectOrderDraft, setAllProjectOrderDraft] = useState({});
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
  const sortedWorks = [...works].sort((a, b) => {
    if (activeCategory === 'All') {
      const allOrderA = Number(storedOrders.All?.[a._id]);
      const allOrderB = Number(storedOrders.All?.[b._id]);
      const hasAllOrderA = Number.isFinite(allOrderA) && allOrderA > 0;
      const hasAllOrderB = Number.isFinite(allOrderB) && allOrderB > 0;

      if (hasAllOrderA && hasAllOrderB) return allOrderA - allOrderB;
      if (hasAllOrderA) return -1;
      if (hasAllOrderB) return 1;
    }

    const orderA = Number(getWorkOrderForCategory(a, activeCategory, storedOrders));
    const orderB = Number(getWorkOrderForCategory(b, activeCategory, storedOrders));
    const hasOrderA = Number.isFinite(orderA) && orderA > 0;
    const hasOrderB = Number.isFinite(orderB) && orderB > 0;

    if (hasOrderA && hasOrderB) return orderA - orderB;
    if (hasOrderA) return -1;
    if (hasOrderB) return 1;
    return 0;
  });
  const filteredWorks = activeCategory === 'All'
    ? sortedWorks.filter((item) => (
      item.category !== 'Award' && storedOrders.AllProjects?.includes(item._id)
    ))
    : sortedWorks.filter((item) => item.category === activeCategory);
  const allOrderCategories = categories.filter(
    (category) => category.value !== 'All' && category.value !== 'Award'
  );
  const allOrderWorks = works
    .filter((work) => work.category === allOrderCategory)
    .sort((a, b) => {
      const orderA = Number(getWorkOrderForCategory(a, allOrderCategory, storedOrders));
      const orderB = Number(getWorkOrderForCategory(b, allOrderCategory, storedOrders));
      const hasOrderA = Number.isFinite(orderA) && orderA > 0;
      const hasOrderB = Number.isFinite(orderB) && orderB > 0;

      if (hasOrderA && hasOrderB) return orderA - orderB;
      if (hasOrderA) return -1;
      if (hasOrderB) return 1;
      return 0;
    });

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    setLoading(true);
    try {
      const res = await workService.getAll();
      const items = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];
      let savedOrders = getStoredWorkOrders();
      const normalizedItems = items.map((item) => ({
        ...item,
        category: item.category?.trim().toLowerCase() === 'awards'
          ? 'Award'
          : item.category
      }));
      if (!Array.isArray(savedOrders.AllProjects)) {
        savedOrders = {
          ...savedOrders,
          AllProjects: normalizedItems
            .filter((item) => item.category !== 'Award')
            .map((item) => item._id)
        };
        localStorage.setItem(WORK_ORDER_STORAGE_KEY, JSON.stringify(savedOrders));
      }
      setStoredOrders(savedOrders);
      setWorks(normalizedItems);
    } catch (error) {
      console.error('Error loading works:', error);
      alert('Failed to load works');
    }
    setLoading(false);
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
      if (formData.aboutContextText.trim() || formData.aboutLeftText.trim() || formData.aboutRightText.trim()) {
        payload.aboutContent = createWorkAboutContent(
          formData.aboutContent,
          formData.aboutLeftText,
          formData.aboutRightText,
          formData.aboutContextText
        );
      }
      let savedWork;
      if (editingWork) {
        const response = await workService.update(editingWork._id, payload);
        savedWork = response?.data || response;
        alert('✅ Work updated successfully!');
      } else {
        const response = await workService.create(payload);
        savedWork = response?.data || response;
        alert('✅ Work created successfully!');
      }
      if (editingWork) {
        const updatedOrders = {
          ...storedOrders,
          [activeCategory]: {
            ...storedOrders[activeCategory],
            [editingWork._id]: order
          }
        };
        localStorage.setItem(WORK_ORDER_STORAGE_KEY, JSON.stringify(updatedOrders));
        setStoredOrders(updatedOrders);
        setWorks((currentWorks) => currentWorks.map((work) =>
          work._id === editingWork._id ? { ...work, ...savedWork } : work
        ));
      } else if (savedWork?._id) {
        let updatedOrders = {
          ...storedOrders,
          [activeCategory]: {
            ...storedOrders[activeCategory],
            [savedWork._id]: order
          }
        };
        if (formData.category === 'All Projects') {
          updatedOrders = {
            ...updatedOrders,
            AllProjects: [...new Set([...(storedOrders.AllProjects || []), savedWork._id])]
          };
        }
        localStorage.setItem(WORK_ORDER_STORAGE_KEY, JSON.stringify(updatedOrders));
        setStoredOrders(updatedOrders);
        setWorks((currentWorks) => [...currentWorks, savedWork]);
      }
      setShowModal(false);
      setEditingWork(null);
      resetForm();
      if (!editingWork) await loadWorks();
    } catch (error) {
      console.error('Error saving work:', error);
      alert('Failed to save work');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (work) => {
    if (activeCategory === 'All') {
      if (!window.confirm('Remove this project from All Projects? It will remain in its category.')) return;
      try {
        const currentOrders = getStoredWorkOrders();
        const updatedOrders = {
          ...currentOrders,
          AllProjects: (currentOrders.AllProjects || []).filter((id) => id !== work._id),
          All: { ...currentOrders.All }
        };
        delete updatedOrders.All[work._id];
        localStorage.setItem(WORK_ORDER_STORAGE_KEY, JSON.stringify(updatedOrders));
        setStoredOrders(updatedOrders);
      } catch (error) {
        console.error('Error removing work from All Projects:', error);
        alert('Failed to remove project from All Projects');
      }
      return;
    }

    if (!window.confirm('Delete this work? It will be removed from all categories.')) return;
    try {
      await workService.delete(work._id);
      const updatedOrders = Object.fromEntries(
        Object.entries(getStoredWorkOrders()).map(([category, orders]) => {
          if (Array.isArray(orders)) {
            return [category, orders.filter((id) => id !== work._id)];
          }
          const categoryOrders = { ...orders };
          delete categoryOrders[work._id];
          return [category, categoryOrders];
        })
      );
      localStorage.setItem(WORK_ORDER_STORAGE_KEY, JSON.stringify(updatedOrders));
      setStoredOrders(updatedOrders);
      alert('✅ Deleted');
      loadWorks();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const resetForm = (category = 'All Projects') => {
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
      order: ''
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
      order: getWorkOrderForCategory(work, activeCategory, storedOrders)
    });
    setEditingWork({ ...work, legacyAboutColumns: aboutContent.legacyColumns });
    setShowModal(true);
  };

  const handleReadMore = (slug) => {
    if (slug) {
      navigate(`/work/${slug}`);
    } else {
      alert('Slug not found for this work.');
    }
  };

  const openAllOrderModal = () => {
    setAllProjectOrderDraft({ ...(storedOrders.All || {}) });
    setAllOrderCategory('Featured');
    setShowAllOrderModal(true);
  };

  const handleSaveAllProjectOrders = () => {
    const validOrders = Object.fromEntries(
      Object.entries(allProjectOrderDraft)
        .filter(([, value]) => Number.isInteger(Number(value)) && Number(value) > 0)
        .map(([id, value]) => [id, Number(value)])
    );
    const allProjectIds = new Set(storedOrders.AllProjects || []);
    Object.keys(validOrders).forEach((id) => allProjectIds.add(id));
    const updatedOrders = {
      ...storedOrders,
      All: validOrders,
      AllProjects: [...allProjectIds]
    };

    try {
      localStorage.setItem(WORK_ORDER_STORAGE_KEY, JSON.stringify(updatedOrders));
      setStoredOrders(updatedOrders);
      setShowAllOrderModal(false);
    } catch (error) {
      console.error('Error saving All Projects order:', error);
      alert('Failed to save All Projects order');
    }
  };

  const handleClearAllProjectOrders = () => {
    const updatedOrders = {
      ...storedOrders,
      All: {}
    };

    try {
      localStorage.setItem(WORK_ORDER_STORAGE_KEY, JSON.stringify(updatedOrders));
      setStoredOrders(updatedOrders);
      setAllProjectOrderDraft({});
    } catch (error) {
      console.error('Error clearing All Projects order:', error);
      alert('Failed to clear All Projects order');
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🎬 Work Management</h1>
          <div className="flex gap-2">
            <button onClick={loadWorks} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2">
              <FiRefreshCw /> Refresh
            </button>
            <button onClick={() => { resetForm(activeCategory === 'All' ? 'All Projects' : activeCategory); setShowModal(true); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <FiPlus /> Add Work
            </button>
          </div>
        </div>

        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-2 border-b border-gray-300" role="tablist" aria-label="Filter works by category">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                role="tab"
                aria-selected={activeCategory === category.value}
                onClick={() => setActiveCategory(category.value)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeCategory === category.value
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-600 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {activeCategory === 'All' && (
          <div className="mb-5">
            <button
              type="button"
              onClick={openAllOrderModal}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Set All Projects Order
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorks.map((item, index) => (
            <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition">
              <img
                src={getImageUrl(item.image)}
                alt={item.title || 'Work'}
                className="w-full h-48 object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
              />
              <div className="p-4">
                <p className="text-sm font-bold text-blue-600">
                  Order: {getWorkOrderForCategory(item, activeCategory, storedOrders) || index + 1}
                </p>
                {/* ✅ Category */}
                <p className="text-sm font-semibold text-gray-700">Category: {item.category}</p>
                {/* ✅ Title Button */}
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Title Button:</span> {item.buttonText || 'Watch Now'}
                </p>
                {item.award && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Award:</span> {item.award}
                  </p>
                )}

                {/* ✅ Edit / Delete (left) and Read More (right) */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-yellow-600 hover:text-yellow-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      {activeCategory === 'All' ? 'Remove from All' : 'Delete'}
                    </button>
                  </div>
                  <button
                    onClick={() => handleReadMore(item.slug)}
                    className="text-[#1893DB] hover:underline text-sm flex items-center gap-1"
                  >
                    Read More →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredWorks.length === 0 && (
          <p className="py-10 text-center text-gray-500">No works found in this category.</p>
        )}

        {showAllOrderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
              <h2 className="mb-2 text-2xl font-bold">Set All Projects Order</h2>
              <p className="mb-4 text-sm text-gray-600">
                Choose a category, then enter each project's position in All Projects. These numbers do not change its category order.
              </p>

              <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Choose a category">
                {allOrderCategories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    role="tab"
                    aria-selected={allOrderCategory === category.value}
                    onClick={() => setAllOrderCategory(category.value)}
                    className={`rounded border px-3 py-2 text-sm ${
                      allOrderCategory === category.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {allOrderWorks.map((work) => (
                  <label
                    key={work._id}
                    className="flex items-center justify-between gap-4 rounded border border-gray-200 p-3"
                  >
                    <span className="min-w-0 flex-1 truncate font-medium text-gray-800">
                      {work.buttonText || 'Untitled project'}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-sm text-gray-600">
                      All Projects #
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={allProjectOrderDraft[work._id] ?? ''}
                        onChange={(event) => {
                          const { value } = event.target;
                          setAllProjectOrderDraft((current) => {
                            const next = { ...current };
                            if (value === '') {
                              delete next[work._id];
                            } else {
                              next[work._id] = value;
                            }
                            return next;
                          });
                        }}
                        placeholder="—"
                        aria-label={`All Projects order for ${work.buttonText || 'project'}`}
                        className="w-20 rounded border border-gray-300 p-2 text-gray-900"
                      />
                    </span>
                  </label>
                ))}
                {allOrderWorks.length === 0 && (
                  <p className="py-8 text-center text-gray-500">
                    No projects found in this category.
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-between gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={handleClearAllProjectOrders}
                  className="rounded border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50"
                >
                  Clear All Project Orders
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAllOrderModal(false)}
                    className="rounded border px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAllProjectOrders}
                    className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                  >
                    Save Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">{editingWork ? '✏️ Edit Work' : '➕ Add Work'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category */}
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

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium mb-1">Image *</label>
                  <ImagePicker
                    value={formData.image}
                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                    label="Choose Image"
                  />
                </div>

                {/* ✅ Label changed to "Title Button" */}
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

                {/* About Content */}
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
                      style={{ color: '#C2BBB6', fontSize: '24px', lineHeight: '29px', fontWeight: 400 }}
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

                {/* Show Overlay */}
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
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
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