import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workService } from '../../services/workService';
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiTrash2
} from 'react-icons/fi';
import ImagePicker from '../../components/ImagePicker';
import TipTapEditor from '../../components/TipTapEditor';
import getImageUrl from '../../utils/imageUrl';
import { createWorkAboutContent, getWorkAboutContent } from '../../utils/workAboutContent';
import { getWorkNameSlug } from '../../utils/workSlug';
import {
  getStoredWorkOrders,
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
  const [allProjectOrderDraft, setAllProjectOrderDraft] = useState([]);
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

  // ✅ Sorting Logic (Order jo database mein hai uske hisaab se)
  const sortedWorks = [...works].sort((a, b) => {
    const orderA = Number(a.order);
    const orderB = Number(b.order);
    const hasOrderA = Number.isFinite(orderA) && orderA > 0;
    const hasOrderB = Number.isFinite(orderB) && orderB > 0;

    if (hasOrderA && hasOrderB) return orderA - orderB;
    if (hasOrderA) return -1;
    if (hasOrderB) return 1;
    return 0;
  });

  const savedAllProjectOrders = storedOrders.All
    && typeof storedOrders.All === 'object'
    && !Array.isArray(storedOrders.All)
    ? storedOrders.All
    : {};

  // ✅ FIXED FILTER: Ab saari categories show hongi, local storage ka jhanjhat khatam
  const allProjectsSortedWorks = works
    .filter((item) => String(item.category || '').trim().toLowerCase() !== 'award')
    .sort((a, b) => {
      const orderA = Number(savedAllProjectOrders[a._id]);
      const orderB = Number(savedAllProjectOrders[b._id]);
      const hasOrderA = Number.isFinite(orderA) && orderA > 0;
      const hasOrderB = Number.isFinite(orderB) && orderB > 0;

      if (hasOrderA && hasOrderB) return orderA - orderB;
      if (hasOrderA) return -1;
      if (hasOrderB) return 1;
      return 0;
    });

  const filteredWorks = activeCategory === 'All'
    ? allProjectsSortedWorks
    : sortedWorks.filter((item) => {
        const itemCat = String(item.category || '').trim().toLowerCase();
        const activeCat = String(activeCategory || '').trim().toLowerCase();
        
        if (activeCat === 'branded' || activeCat === 'brand') {
          return itemCat === 'branded' || itemCat === 'brand';
        }
        if (activeCat === 'award' || activeCat === 'awards') {
          return itemCat === 'award' || itemCat === 'awards';
        }
        return itemCat === activeCat;
      });

  const allProjectOrderIds = Array.isArray(allProjectOrderDraft)
    ? allProjectOrderDraft.filter((id) => typeof id === 'string')
    : [];
  const allOrderWorks = allProjectOrderIds
    .map((id) => works.find((work) => work._id === id))
    .filter(Boolean);

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
          
      const normalizedItems = items.map((item) => ({
        ...item,
        category: item.category?.trim().toLowerCase() === 'awards'
          ? 'Award'
          : item.category
      }));
      
      setWorks(normalizedItems); // ✅ Seedha database ka data set kar diya
      
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
      // ✅ Order ko backend mein bhej rahe hain taake database mein save ho
      payload.order = order; 

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

  const openAllOrderModal = () => {
    setAllProjectOrderDraft(allProjectsSortedWorks.map((work) => work._id));
    setShowAllOrderModal(true);
  };

  const handleSaveAllProjectOrders = () => {
    const orders = Object.fromEntries(
      allProjectOrderIds.map((id, index) => [id, index + 1])
    );
    const updatedOrders = {
      ...storedOrders,
      All: orders
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
      setAllProjectOrderDraft([]);
      setShowAllOrderModal(false);
    } catch (error) {
      console.error('Error clearing All Projects order:', error);
      alert('Failed to clear All Projects order');
    }
  };

  const moveAllProject = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= allProjectOrderDraft.length) return;

    setAllProjectOrderDraft((current) => {
      const next = Array.isArray(current) ? [...current] : [];
      if (index >= next.length || nextIndex >= next.length) return next;
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const handleClearAllProjects = () => {
    if (!window.confirm('Remove all works from All Projects? The work records and their categories will not be deleted.')) {
      return;
    }

    const updatedOrders = {
      ...storedOrders,
      AllProjects: [],
      All: {}
    };

    try {
      localStorage.setItem(WORK_ORDER_STORAGE_KEY, JSON.stringify(updatedOrders));
      setStoredOrders(updatedOrders);
      setAllProjectOrderDraft([]);
    } catch (error) {
      console.error('Error clearing All Projects:', error);
      alert('Failed to clear All Projects');
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
              Reorder All Projects
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
                loading="lazy"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
              />
              <div className="p-4">
                <p className="text-sm font-bold text-blue-600">
                  Order: {activeCategory === 'All'
                    ? (savedAllProjectOrders[item._id] || index + 1)
                    : (item.order || index + 1)}
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
                      Delete
                    </button>
                  </div>
                  <button
                    onClick={() => handleReadMore(item)}
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
              <h2 className="mb-2 text-2xl font-bold">Reorder All Projects</h2>
              <p className="mb-4 text-sm text-gray-600">
                Move projects to set their order in All Projects. Other category orders will not change.
              </p>

              <div className="space-y-2">
                {allOrderWorks.map((work, index) => (
                  <div
                    key={work._id}
                    className="flex items-center gap-3 rounded border border-gray-200 p-3"
                  >
                    <span className="w-8 shrink-0 text-center font-semibold text-gray-600">
                      {index + 1}.
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium text-gray-800">
                      {work.buttonText || 'Untitled project'}
                    </span>
                    <span className="shrink-0 text-sm text-gray-500">{work.category}</span>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => moveAllProject(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${work.buttonText || 'project'} up`}
                        className="rounded border p-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FiArrowUp />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveAllProject(index, 1)}
                        disabled={index === allOrderWorks.length - 1}
                        aria-label={`Move ${work.buttonText || 'project'} down`}
                        className="rounded border p-2 text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FiArrowDown />
                      </button>
                    </div>
                  </div>
                ))}
                {allOrderWorks.length === 0 && (
                  <p className="py-8 text-center text-gray-500">No projects found.</p>
                )}
              </div>

              <div className="mt-6 flex justify-between gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={handleClearAllProjectOrders}
                  className="rounded border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50"
                >
                  Clear Order
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