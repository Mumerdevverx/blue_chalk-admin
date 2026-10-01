import React, { useState, useEffect } from "react";
import API from "../../../api/axios";
import ImagePicker from "../../ImagePicker";
import TipTapEditor from "../../TipTapEditor";
import getImageUrl from "../../../utils/imageUrl";
import { workService } from "../../../services/workService";

const normalizeWorkLinks = (description = "", works = [], awards = []) => {
  if (!description || typeof DOMParser === "undefined") return description;

  const normalizeText = (value = "") =>
    value
      .replace(/&nbsp;/gi, " ")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  const parsed = new DOMParser().parseFromString(description, "text/html");
  parsed.querySelectorAll("a[href]").forEach((link) => {
    const linkText = normalizeText(link.textContent);
    try {
      const url = new URL(link.getAttribute("href"), window.location.origin);
      if (url.origin !== window.location.origin && url.pathname === "/") {
        link.replaceWith(...link.childNodes);
        return;
      }
    } catch {
      // Leave invalid link URLs unchanged.
    }

    const selectedWork = works.find((work) => {
      const title = normalizeText(work.title);
      const buttonText = normalizeText(work.buttonText);
      return linkText && (linkText === title || linkText === buttonText);
    });

    if (selectedWork?.slug) {
      link.setAttribute("href", `/work/${selectedWork.slug}`);
      link.setAttribute("target", "_self");
      return;
    }

    try {
      const url = new URL(link.getAttribute("href"), window.location.origin);
      const workSlug = url.pathname.match(/^\/work\/([^/]+)\/?$/)?.[1];
      const slugMatch = works.find((work) => work.slug === workSlug);

      if (slugMatch?.slug) {
        link.setAttribute("href", `/work/${slugMatch.slug}`);
        link.setAttribute("target", "_self");
      } else if (workSlug) {
        link.remove();
      }
    } catch {
      // Leave invalid link URLs unchanged.
    }
  });

  const linkCandidates = new Map();
  works.forEach((work) => {
    const label = (work.buttonText || work.title || "").trim();
    const text = normalizeText(label);
    if (work.slug && text.length >= 8 && !linkCandidates.has(text)) {
      linkCandidates.set(text, { label, href: `/work/${work.slug}` });
    }
  });
  const candidates = [...linkCandidates.values()].sort(
    (first, second) => second.label.length - first.label.length
  );
  const textWalker = parsed.createTreeWalker(parsed.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (textWalker.nextNode()) {
    const textNode = textWalker.currentNode;
    if (!textNode.parentElement.closest("a, script, style")) {
      textNodes.push(textNode);
    }
  }

  textNodes.forEach((textNode) => {
    let remainingText = textNode.nodeValue;
    const fragment = parsed.createDocumentFragment();
    let changed = false;

    while (remainingText) {
      let match = null;
      candidates.forEach((candidate) => {
        const index = remainingText.toLowerCase().indexOf(candidate.label.toLowerCase());
        if (
          index >= 0 &&
          (!match || index < match.index || (index === match.index && candidate.label.length > match.candidate.label.length))
        ) {
          match = { candidate, index };
        }
      });

      if (!match) {
        fragment.append(parsed.createTextNode(remainingText));
        break;
      }

      changed = true;
      fragment.append(parsed.createTextNode(remainingText.slice(0, match.index)));
      const anchor = parsed.createElement("a");
      anchor.setAttribute("href", match.candidate.href);
      anchor.setAttribute("target", "_self");
      anchor.textContent = match.candidate.label;
      fragment.append(anchor);
      remainingText = remainingText.slice(match.index + match.candidate.label.length);
    }

    if (changed) {
      textNode.replaceWith(fragment);
    }
  });

  return parsed.body.innerHTML;
};

export default function AwardsManager() {
  const [awards, setAwards] = useState([]);
  const [works, setWorks] = useState([]);
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
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      const res = await workService.getAll();
      const items = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];
      setWorks(items.filter((work) => work.slug));
    } catch (error) {
      console.error("Error loading works for award links:", error);
    }
  };

  const loadAwards = async () => {
    try {
      setLoading(true);

      const res = await API.get("/api/awards");
      const items = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
      setAwards(items);
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
        description: normalizeWorkLinks(award.description || "", works, awards),
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
      const formData = {
        ...form,
        slug: awards.find((award) => award._id === editingId)?.slug,
        description: normalizeWorkLinks(form.description, works, awards),
      };

      if (editingId) {
        // UPDATE
        await API.put(`/api/awards/${editingId}`, formData);
      } else {
        // CREATE
        await API.post("/api/awards", formData);
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
      await API.delete(`/api/awards/${id}`);

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
          {[...awards]
            .sort((first, second) => {
              const firstOrder = Number(first.order);
              const secondOrder = Number(second.order);

              if (Number.isFinite(firstOrder) && Number.isFinite(secondOrder)) {
                return firstOrder - secondOrder;
              }

              return new Date(first.createdAt) - new Date(second.createdAt);
            })
            .map((award) => (
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
                  workOptions={works}
                  openLinksOnClick
                />

                <p className="text-xs text-gray-500 mt-2">
                  Select text, choose a Work, and click Link to Work to make it open that Work detail.
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