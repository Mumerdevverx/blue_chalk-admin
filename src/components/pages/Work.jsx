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
  FiRotateCcw,
  FiLoader
} from 'react-icons/fi';
import ImagePicker from '../../components/ImagePicker';
import TipTapEditor from '../../components/TipTapEditor';
import getImageUrl from '../../utils/imageUrl';
import { createWorkAboutContent, getWorkAboutContent } from '../../utils/workAboutContent';
import { getWorkNameSlug } from '../../utils/workSlug';

const CHUNK_SIZE = 12;

function Work() {
  const navigate = useNavigate();
  const [projectsByCategory, setProjectsByCategory] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [orderSaveStatus, setOrderSaveStatus] = useState({ type: '', message: '' });
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

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
    showInAllProjects: true,
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

  // Helper function to fetch chunks progressively
  const loadCategoryChunks = async (categoryKey, forceReset = false) => {
    if (forceReset || !projectsByCategory[categoryKey] || projectsByCategory[categoryKey].length === 0) {
      setIsCategoryLoading(true);
    }
    setIsLoadingMore(false);
    setOrderSaveStatus({ type: '', message: '' });

    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        if (page > 1) {
          setIsLoadingMore(true);
        }

        const data = await workService.getCategoryChunk(categoryKey, page, CHUNK_SIZE);
        const chunkItems = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

        setProjectsByCategory((prev) => {
          const currentList = forceReset && page === 1 ? [] : (prev[categoryKey] || []);
          const existingIds = new Set(currentList.map((item) => String(item._id)));
          const uniqueChunk = chunkItems.filter((item) => !existingIds.has(String(item._id)));

          if (page === 1) {
            return {
              ...prev,
              [categoryKey]: chunkItems
            };
          }

          return {
            ...prev,
            [categoryKey]: [...currentList, ...uniqueChunk]
          };
        });

        // Display chunk 1 immediately as soon as response arrives
        if (page === 1) {
          setIsCategoryLoading(false);
        }

        hasMore = Boolean(data?.hasMore) && chunkItems.length > 0;
        page += 1;
      } catch (error) {
        console.error(`Error loading chunk ${page} for ${categoryKey}:`, error);
        hasMore = false;
      }
    }

    setIsCategoryLoading(false);
    setIsLoadingMore(false);
  };

  // Progressive chunk loading for the selected category:
  // - Displays chunk 1 (12 items) immediately upon receiving response.
  // - Directly calls next chunk and merges with existing list without page reload.
  // - For All Projects, chunks arrive in saved order (1-12, 13-24, etc.).
  useEffect(() => {
    let isCancelled = false;
    const categoryKey = activeCategory;

    // If already cached, show immediately
    const cached = projectsByCategory[categoryKey];
    if (!cached || cached.length === 0) {
      setIsCategoryLoading(true);
    } else {
      setIsCategoryLoading(false);
    }
    setIsLoadingMore(false);
    setHasOrderChanges(false);
    setOrderSaveStatus({ type: '', message: '' });

    const fetchCategoryData = async () => {
      let page = 1;
      let hasMore = true;

      while (hasMore && !isCancelled) {
        try {
          if (page > 1 && !isCancelled) {
            setIsLoadingMore(true);
          }

          const data = await workService.getCategoryChunk(categoryKey, page, CHUNK_SIZE);
          if (isCancelled) break;

          const chunkItems = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

          setProjectsByCategory((prev) => {
            const currentList = prev[categoryKey] || [];
            const existingIds = new Set(currentList.map((item) => String(item._id)));
            const uniqueChunk = chunkItems.filter((item) => !existingIds.has(String(item._id)));

            if (page === 1) {
              return {
                ...prev,
                [categoryKey]: chunkItems
              };
            }

            return {
              ...prev,
              [categoryKey]: [...currentList, ...uniqueChunk]
            };
          });

          // Display chunk 1 immediately
          if (page === 1 && !isCancelled) {
            setIsCategoryLoading(false);
          }

          hasMore = Boolean(data?.hasMore) && chunkItems.length > 0;
          page += 1;
        } catch (error) {
          console.error(`Error fetching category chunks for ${categoryKey}:`, error);
          hasMore = false;
        }
      }

      if (!isCancelled) {
        setIsCategoryLoading(false);
        setIsLoadingMore(false);
      }
    };

    fetchCategoryData();

    return () => {
      isCancelled = true;
    };
  }, [activeCategory]);

  const displayedWorks = projectsByCategory[activeCategory] || [];

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

    const currentList = [...(projectsByCategory['All'] || [])];
    const [moved] = currentList.splice(draggedIndex, 1);
    currentList.splice(dropIndex, 0, moved);

    setProjectsByCategory((prev) => ({
      ...prev,
      All: currentList
    }));
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
    const currentList = [...(projectsByCategory['All'] || [])];
    const temp = currentList[index - 1];
    currentList[index - 1] = currentList[index];
    currentList[index] = temp;

    setProjectsByCategory((prev) => ({
      ...prev,
      All: currentList
    }));
    setHasOrderChanges(true);
  };

  const moveItemDown = (index) => {
    const currentList = [...(projectsByCategory['All'] || [])];
    if (index >= currentList.length - 1) return;
    const temp = currentList[index + 1];
    currentList[index + 1] = currentList[index];
    currentList[index] = temp;

    setProjectsByCategory((prev) => ({
      ...prev,
      All: currentList
    }));
    setHasOrderChanges(true);
  };

  // Save new order to database
  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    setOrderSaveStatus({ type: '', message: '' });

    try {
      const allProjects = projectsByCategory['All'] || [];
      const projectIds = allProjects.map((item) => item._id);
      await workService.saveOrder(projectIds);

      setHasOrderChanges(false);
      setOrderSaveStatus({
        type: 'success',
        message: 'Order saved successfully! Public All Projects section will now display this order.'
      });

      // Update local works order numbers
      setProjectsByCategory((prev) => ({
        ...prev,
        All: allProjects.map((item, idx) => ({ ...item, order: idx + 1 }))
      }));

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
    // Re-fetch All Projects order from database
    loadCategoryChunks('All', true);
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

      // Refresh active category without page reload
      loadCategoryChunks(activeCategory, true);
      if (activeCategory !== 'All') {
        loadCategoryChunks('All', true);
      }
    } catch (error) {
      console.error('Error saving work:', error);
      alert('Failed to save work');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (work) => {
    const isFromAll = activeCategory === 'All' || activeCategory === 'All Projects';
    const hasOtherCategory =
      work.category &&
      !['All', 'All Projects', 'all-projects'].includes(String(work.category).trim());

    const confirmMessage = isFromAll && hasOtherCategory
      ? `Remove "${work.title || work.buttonText || 'this project'}" from All Projects?\n\nIt will be removed from All Projects only, and will remain preserved in "${work.category}".`
      : `Delete "${work.title || work.buttonText || 'this project'}"?\n\nThis will permanently delete it.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await workService.delete(work._id, activeCategory);

      if (isFromAll && hasOtherCategory) {
        // Remove only from 'All' tab in local state; keep in its category tab!
        setProjectsByCategory((prev) => ({
          ...prev,
          All: (prev['All'] || []).filter((item) => String(item._id) !== String(work._id))
        }));
        alert(`✅ Removed from All Projects (preserved in ${work.category})`);
      } else {
        // Full delete: remove from all cached category lists immediately
        setProjectsByCategory((prev) => {
          const next = {};
          for (const [cat, list] of Object.entries(prev)) {
            next[cat] = list.filter((item) => String(item._id) !== String(work._id));
          }
          return next;
        });
        alert('✅ Deleted');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed');
    }
  };

  const resetForm = (category = 'All Projects') => {
    const allList = projectsByCategory['All'] || [];
    const defaultNextOrder = allList.length + 1;
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
      showInAllProjects: true,
      order: defaultNextOrder
    });
    setEditingWork(null);
  };

  const handleEdit = async (work) => {
    try {
      setIsFetchingDetail(true);
      // Fetch full work by ID to obtain complete aboutContent for the editor
      const res = await workService.getById(work._id);
      const fullWork = res?.data || res || work;
      const aboutContent = getWorkAboutContent(fullWork.aboutContent);

      setEditingWork({ ...fullWork, legacyAboutColumns: aboutContent.legacyColumns });
      setFormData({
        category: fullWork.category || 'All Projects',
        image: fullWork.image || '',
        buttonText: fullWork.buttonText || 'Watch Now',
        award: fullWork.award || '',
        aboutContent: aboutContent.content,
        aboutContextText: aboutContent.contextText,
        aboutLeftText: aboutContent.left,
        aboutRightText: aboutContent.right,
        showOverlay: fullWork.showOverlay || false,
        overlayType: fullWork.overlayType || '',
        showInAllProjects: fullWork.showInAllProjects !== false,
        order: fullWork.order || ''
      });
      setShowModal(true);
    } catch (err) {
      console.error('Failed to load full work details:', err);
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
        showInAllProjects: work.showInAllProjects !== false,
        order: work.order || ''
      });
      setShowModal(true);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleReadMore = (work) => {
    const slug = getWorkNameSlug(work);
    if (slug) {
      navigate(`/work/${slug}`);
    } else {
      alert('Slug not found for this work.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">🎬 Work Management</h1>
            {isLoadingMore && (
              <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                <FiLoader className="animate-spin text-sm" /> Loading more items...
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadCategoryChunks(activeCategory, true)}
              className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2 cursor-pointer transition-colors"
              title="Refresh this category"
            >
              <FiRefreshCw className={isCategoryLoading ? 'animate-spin' : ''} /> Refresh
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

        {/* Initial Category Loading State */}
        {isCategoryLoading && displayedWorks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-sm text-gray-500">Loading {activeCategory === 'All' ? 'All Projects' : activeCategory}...</p>
          </div>
        ) : (
          /* Works Grid */
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
                      alt={item.title || item.buttonText || 'Work'}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                    />
                    <div className="p-4">
                      <p className="text-sm font-bold text-blue-600">
                        Order: {isAllProjectsTab ? index + 1 : (item.order || index + 1)}
                      </p>
                      <p className="text-sm font-semibold text-gray-700">Category: {item.category}</p>
                      {item.showInAllProjects === false && (
                        <span className="inline-block mt-1 bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded border border-amber-200">
                          Hidden from All Projects
                        </span>
                      )}
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
                          disabled={isFetchingDetail}
                          className="text-yellow-600 hover:text-yellow-800 text-sm cursor-pointer flex items-center gap-1 disabled:opacity-50"
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
        )}

        {!isCategoryLoading && displayedWorks.length === 0 && (
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

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="showInAllProjects"
                      checked={formData.showInAllProjects !== false}
                      onChange={handleChange}
                    />
                    <span className="text-sm font-medium text-gray-700">Show in All Projects</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" name="showOverlay" checked={formData.showOverlay} onChange={handleChange} />
                    <span className="text-sm font-medium text-gray-700">Show Overlay</span>
                  </label>
                </div>

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
