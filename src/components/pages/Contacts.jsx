import React, { useState, useEffect, useCallback } from 'react';
import contactService from '../../services/contactService';
import {
  FiEdit2, FiTrash2, FiPlus, FiMapPin, FiMail,
  FiPhone, FiX, FiHome, FiAlertCircle, FiCheck,
  FiLoader,
} from 'react-icons/fi';

/* ─── helpers ──────────────────────────────────────────────────── */
const EMPTY_FORM = {
  officeName: '',
  address: { street: '', city: '', state: '', zipCode: '', fullAddress: '' },
  email: '',
  phone: '',
  mapEmbedUrl: '',
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colours =
    type === 'success'
      ? 'bg-emerald-600'
      : type === 'error'
      ? 'bg-red-600'
      : 'bg-blue-600';

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-up ${colours}`}
    >
      {type === 'success' ? <FiCheck size={16} /> : <FiAlertCircle size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <FiX size={14} />
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow p-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── main component ────────────────────────────────────────────── */
export default function Contacts() {
  const [contacts, setContacts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData]           = useState(EMPTY_FORM);
  const [toast, setToast]                 = useState(null);
  const [deleteId, setDeleteId]           = useState(null);

  /* load */
  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactService.getContacts();
      setContacts(res.data?.data ?? res.data ?? []);
    } catch {
      showToast('Failed to load contacts', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadContacts(); }, [loadContacts]);

  /* toast */
  const showToast = (message, type = 'success') =>
    setToast({ message, type, key: Date.now() });

  /* form helpers */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const openAdd = () => { setFormData(EMPTY_FORM); setEditingContact(null); setShowModal(true); };

  const openEdit = (c) => {
    setEditingContact(c);
    setFormData({
      officeName:  c.officeName  ?? '',
      address: {
        street:      c.address?.street      ?? '',
        city:        c.address?.city        ?? '',
        state:       c.address?.state       ?? '',
        zipCode:     c.address?.zipCode     ?? '',
        fullAddress: c.address?.fullAddress ?? '',
      },
      email:       c.email       ?? '',
      phone:       c.phone       ?? '',
      mapEmbedUrl: c.mapEmbedUrl ?? '',
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingContact(null); };

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingContact) {
        await contactService.updateContact(editingContact._id, formData);
        showToast('Office updated successfully ✓');
      } else {
        await contactService.createContact(formData);
        showToast('New office added successfully ✓');
      }
      closeModal();
      loadContacts();
    } catch (err) {
      showToast(err?.response?.data?.message ?? 'Failed to save contact', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* delete */
  const confirmDelete = (id) => setDeleteId(id);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await contactService.deleteContact(deleteId);
      showToast('Office deleted');
      setDeleteId(null);
      loadContacts();
    } catch {
      showToast('Failed to delete', 'error');
      setDeleteId(null);
    }
  };

  /* ── render ────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* custom animation */}
      <style>{`
        @keyframes slide-up {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .animate-slide-up { animation: slide-up .3s ease both; }
        @keyframes fade-in {
          from { opacity:0; } to { opacity:1; }
        }
        .animate-fade-in { animation: fade-in .25s ease both; }
        @keyframes scale-in {
          from { opacity:0; transform:scale(.95); }
          to   { opacity:1; transform:scale(1); }
        }
        .animate-scale-in { animation: scale-in .25s cubic-bezier(.175,.885,.32,1.275) both; }
      `}</style>

      <div className="max-w-6xl mx-auto">

        {/* ── header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Contact Management
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              {contacts.length} office{contacts.length !== 1 ? 's' : ''} on record
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-150"
          >
            <FiPlus size={18} />
            Add Office
          </button>
        </div>

        {/* ── content ────────────────────────────────────────── */}
        {loading ? (
          <Skeleton />
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 py-24 px-8 text-center">
            <FiHome size={48} className="text-indigo-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 mb-2">No offices yet</h2>
            <p className="text-slate-400 mb-6">Add your first office location to get started.</p>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl transition"
            >
              <FiPlus size={16} /> Add Office
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {contacts.map((c) => (
              <div
                key={c._id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 hover:border-indigo-200 transition-all duration-300 overflow-hidden"
              >
                {/* card top accent */}
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-blue-400 to-cyan-400" />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <FiHome className="text-indigo-600" size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 leading-tight capitalize">
                          {c.officeName}
                        </h2>
                        <span className="text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                          Office
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(c)}
                        title="Edit"
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(c._id)}
                        title="Delete"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm text-slate-600">
                    <div className="flex items-start gap-2.5">
                      <FiMapPin className="text-indigo-400 mt-0.5 shrink-0" size={15} />
                      <span className="leading-snug">{c.address?.fullAddress || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <FiMail className="text-indigo-400 shrink-0" size={15} />
                      <a
                        href={`mailto:${c.email}`}
                        className="text-indigo-600 hover:underline truncate"
                      >
                        {c.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <FiPhone className="text-indigo-400 shrink-0" size={15} />
                      <a href={`tel:${c.phone}`} className="text-indigo-600 hover:underline">
                        {c.phone}
                      </a>
                    </div>
                  </div>

                  {/* map preview thumbnail */}
                  {c.mapEmbedUrl && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-slate-100 h-36 pointer-events-none">
                      <iframe
                        src={c.mapEmbedUrl}
                        title={`Map – ${c.officeName}`}
                        className="w-full h-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto animate-scale-in">

            {/* modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingContact ? 'Edit Office' : 'Add New Office'}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {editingContact ? 'Update office contact details' : 'Fill in the details below'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Office Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Office Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="officeName"
                  value={formData.officeName}
                  onChange={handleChange}
                  placeholder="e.g. Brooklyn, Portland, London"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>

              {/* Street + City */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Street <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="68 Jay Street"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="Brooklyn"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* State + Zip */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="NY"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    placeholder="11201"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address.fullAddress"
                  value={formData.address.fullAddress}
                  onChange={handleChange}
                  placeholder="68 Jay Street Suite 201, Brooklyn, NY 11201"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hello@example.com"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="347.410.8445"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Map Embed URL */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Google Maps Embed URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="mapEmbedUrl"
                  value={formData.mapEmbedUrl}
                  onChange={handleChange}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>

              {/* map preview */}
              {formData.mapEmbedUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 h-48">
                  <iframe
                    src={formData.mapEmbedUrl}
                    title="Map Preview"
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}

              {/* actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
                >
                  {submitting && <FiLoader className="animate-spin" size={15} />}
                  {editingContact ? 'Update Office' : 'Save Office'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-scale-in text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="text-red-500" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Office?</h3>
            <p className="text-sm text-slate-500 mb-6">
              This action cannot be undone. The office record will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ────────────────────────────────────────── */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}