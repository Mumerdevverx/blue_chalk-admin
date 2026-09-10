import React, { useState, useEffect } from "react";
import API from "../../../api/axios";
import ImagePicker from "../../ImagePicker";
import TipTapEditor from "../../TipTapEditor";

export default function AwardsManager() {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    year: String(new Date().getFullYear()),
    category: "Awards",
    breadcrumb: "Awards",
    image: "",
    description: "",
  });

  // =========================
  // LOAD AWARDS
  // =========================
  useEffect(() => {
    loadAwards();
  }, []);

  const loadAwards = async () => {
    try {
      setLoading(true);

      const res = await API.get("/awards");

      setAwards(res.data.data || []);
    } catch (error) {
      console.error("Error loading awards:", error);
      alert("Failed to load awards");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setForm({
      title: "",
      year: String(new Date().getFullYear()),
      category: "Awards",
      breadcrumb: "Awards",
      image: "",
      description: "",
    });

    setEditingId(null);
  };

  // =========================
  // OPEN MODAL
  // =========================
  const handleOpenModal = (award = null) => {
    if (award) {
      // Edit
      setEditingId(award._id);

      setForm({
        title: award.title || "",
        year: award.year || String(new Date().getFullYear()),
        category: award.category || "Awards",
        breadcrumb: award.breadcrumb || "Awards",
        image: award.image || "",
        description: award.description || "",
      });
    } else {
      // Add new
      resetForm();
    }

    setShowModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // DESCRIPTION CHANGE
  // =========================
  const handleDescriptionChange = (value) => {
    setForm((prev) => ({
      ...prev,
      description: value,
    }));
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    if (!form.image) {
      alert("Award image is required");
      return;
    }

    try {
      if (editingId) {
        // UPDATE
        await API.put(`/awards/${editingId}`, form);
      } else {
        // CREATE
        await API.post("/awards", form);
      }

      handleCloseModal();
      await loadAwards();
    } catch (error) {
      console.error("Error saving award:", error);

      alert(
        error?.response?.data?.message ||
          "Error saving award"
      );
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this award?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/awards/${id}`);

      await loadAwards();
    } catch (error) {
      console.error("Error deleting award:", error);

      alert(
        error?.response?.data?.message ||
          "Error deleting award"
      );
    }
  };

  // =========================
  // IMAGE URL
  // =========================
  const getImageUrl = (url) => {
    if (!url) {
      return "https://via.placeholder.com/400x300?text=No+Image";
    }

    if (url.startsWith("http")) {
      return url;
    }

    return `http://localhost:5000${url}`;
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="p-6">
        <p>Loading awards...</p>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* =========================
          HEADER
      ========================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Awards
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage your awards and achievements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          + Add Award
        </button>
      </div>

      {/* =========================
          AWARDS CARDS
      ========================= */}
      {awards.length === 0 ? (
        <div className="text-center text-gray-500 py-12 border-2 border-dashed rounded-lg">
          No awards added yet. Click &quot;Add Award&quot; to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {awards.map((award) => (
            <div
              key={award._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border flex flex-col"
            >
              <img
                src={getImageUrl(award.image)}
                alt={award.title}
                className="w-full h-40 object-cover"
                onError={(event) => {
                  event.currentTarget.src =
                    "https://via.placeholder.com/400x300?text=Image+Not+Found";
                }}
              />

              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-bold text-sm truncate">{award.title}</h3>
                {/* <p className="text-xs text-gray-600">
                  {award.year || "-"} - {award.category || "-"}
                </p>
                <p className="text-xs text-gray-400 mt-1 truncate">
                  {award.breadcrumb || "-"}
                </p> */}

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(award)}
                    className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(award._id)}
                    className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          MODAL
      ========================= */}
      {showModal && (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-lg max-w-3xl w-full shadow-xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">

              <h2 className="text-xl font-semibold text-gray-800">
                {editingId ? "Edit Award" : "Add Award"}
              </h2>

              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>

            </div>

            {/* =========================
                FORM
            ========================= */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {/* Title */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter award title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

              </div>

              {/* Year */}
              {/* <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>

                <input
                  type="text"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  placeholder="2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div> */}

              {/* Category */}
              {/* <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>

                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Enter category"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div> */}

              {/* Breadcrumb */}
              {/* <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breadcrumb
                </label>

                <input
                  type="text"
                  name="breadcrumb"
                  value={form.breadcrumb}
                  onChange={handleChange}
                  placeholder="Awards"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div> */}

              {/* Image */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Award Image *
                </label>

                <ImagePicker
                  value={form.image}
                  onChange={(url) =>
                    setForm((prev) => ({
                      ...prev,
                      image: url,
                    }))
                  }
                  label="Choose Image"
                />

              </div>

              {/* =========================
                  DESCRIPTION / TIPTAP
              ========================= */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>

                <TipTapEditor
                  value={form.description}
                  onChange={handleDescriptionChange}
                />

                <p className="text-xs text-gray-500 mt-2">
                  You can format text, add images, YouTube videos,
                  and change the color of selected text.
                </p>

              </div>

              {/* =========================
                  BUTTONS
              ========================= */}
              <div className="flex justify-end gap-3 pt-3 border-t">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  {editingId ? "Update Award" : "Save Award"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}