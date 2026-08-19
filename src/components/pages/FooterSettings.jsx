import React, { useState, useEffect } from 'react';
import  footerService  from '../../services/footerService';
import { FiSave, FiEdit2, FiTrash2, FiRefreshCw } from 'react-icons/fi';

function FooterSettings() {
  const [footer, setFooter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      fullAddress: ''
    },
    phone: '',
    email: '',
    socialLinks: {
      twitter: '',
      facebook: '',
      instagram: '',
      emailLink: ''
    },
    footerLinks: {
      privacyPolicy: '',
      termsOfUse: '',
      copyrightText: ''
    }
  });

  useEffect(() => {
    loadFooter();
  }, []);

  const loadFooter = async () => {
    setLoading(true);
    try {
      const res = await footerService.getFooter();
      if (res.success) {
        setFooter(res.data);
        setFormData(res.data);
      }
    } catch (error) {
      console.error('Error loading footer:', error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (footer) {
        await footerService.updateFooter(formData);
      } else {
        await footerService.createFooter(formData);
      }
      setEditing(false);
      await loadFooter();
      alert('✅ Footer saved successfully!');
    } catch (error) {
      console.error('Error saving footer:', error);
      alert('❌ Failed to save footer');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete footer data?')) return;
    try {
      await footerService.deleteFooter(footer._id);
      setFooter(null);
      setFormData({
        address: { street: '', city: '', state: '', zipCode: '', fullAddress: '' },
        phone: '',
        email: '',
        socialLinks: { twitter: '', facebook: '', instagram: '', emailLink: '' },
        footerLinks: { privacyPolicy: '', termsOfUse: '', copyrightText: '' }
      });
      alert('✅ Footer deleted successfully!');
    } catch (error) {
      console.error('Error deleting footer:', error);
      alert('❌ Failed to delete footer');
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">⚙️ Footer Settings</h1>
              <p className="text-gray-500 text-sm mt-1">
                {footer ? 'Edit your footer content' : 'No footer found. Create one now!'}
              </p>
            </div>
            <div className="flex gap-2">
              {!editing && footer && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </>
              )}
              {!editing && !footer && (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <FiRefreshCw /> Create Footer
                </button>
              )}
              {editing && (
                <button
                  onClick={() => {
                    setEditing(false);
                    if (footer) setFormData(footer);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Form / Display */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Address Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">📍 Address</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Street *</label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">City *</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">State *</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Zip Code *</label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Full Address *</label>
                  <input
                    type="text"
                    name="address.fullAddress"
                    value={formData.address.fullAddress}
                    onChange={handleChange}
                    placeholder="68 Jay Street Suite 201, Brooklyn, NY 11201"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Contact Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">📞 Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone *</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="347.410.8445"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="hello@bluechalk.com"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">🌐 Social Links</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Twitter URL</label>
                    <input
                      type="url"
                      name="socialLinks.twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleChange}
                      placeholder="https://x.com/BlueChalkMedia"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Facebook URL</label>
                    <input
                      type="url"
                      name="socialLinks.facebook"
                      value={formData.socialLinks.facebook}
                      onChange={handleChange}
                      placeholder="https://www.facebook.com/BlueChalkMedia"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Instagram URL</label>
                    <input
                      type="url"
                      name="socialLinks.instagram"
                      value={formData.socialLinks.instagram}
                      onChange={handleChange}
                      placeholder="https://www.instagram.com/bluechalkmedia"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email Link URL</label>
                    <input
                      type="url"
                      name="socialLinks.emailLink"
                      value={formData.socialLinks.emailLink}
                      onChange={handleChange}
                      placeholder="https://bluechalk.com/contact/"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Links */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">🔗 Footer Links</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Privacy Policy URL</label>
                    <input
                      type="text"
                      name="footerLinks.privacyPolicy"
                      value={formData.footerLinks.privacyPolicy}
                      onChange={handleChange}
                      placeholder="/privacy-policy"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Terms of Use URL</label>
                    <input
                      type="text"
                      name="footerLinks.termsOfUse"
                      value={formData.footerLinks.termsOfUse}
                      onChange={handleChange}
                      placeholder="/terms-of-use"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Copyright Text</label>
                  <input
                    type="text"
                    name="footerLinks.copyrightText"
                    value={formData.footerLinks.copyrightText}
                    onChange={handleChange}
                    placeholder="© 2026 Blue Chalk Media"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <FiSave /> {saving ? 'Saving...' : 'Save Footer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    if (footer) setFormData(footer);
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            // ✅ VIEW MODE - Show current footer
            <div className="space-y-6">
              {footer ? (
                <>
                  {/* Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">📍 Address</h3>
                    <p className="text-gray-800 text-lg">{footer.address?.fullAddress}</p>
                  </div>
                  
                  {/* Contact */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">📞 Contact</h3>
                    <p className="text-gray-800">📱 {footer.phone}</p>
                    <p className="text-gray-800">✉️ {footer.email}</p>
                  </div>
                  
                  {/* Social Links */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">🌐 Social Links</h3>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {footer.socialLinks?.twitter && (
                        <a href={footer.socialLinks.twitter} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                          🐦 Twitter
                        </a>
                      )}
                      {footer.socialLinks?.facebook && (
                        <a href={footer.socialLinks.facebook} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                          📘 Facebook
                        </a>
                      )}
                      {footer.socialLinks?.instagram && (
                        <a href={footer.socialLinks.instagram} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                          📸 Instagram
                        </a>
                      )}
                      {footer.socialLinks?.emailLink && (
                        <a href={footer.socialLinks.emailLink} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                          ✉️ Email
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer Links */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">🔗 Footer Links</h3>
                    <div className="space-y-1 mt-2">
                      <p className="text-gray-800">📄 Privacy Policy: {footer.footerLinks?.privacyPolicy || '/privacy-policy'}</p>
                      <p className="text-gray-800">📄 Terms of Use: {footer.footerLinks?.termsOfUse || '/terms-of-use'}</p>
                      <p className="text-gray-800">© {footer.footerLinks?.copyrightText || '© 2026 Blue Chalk Media'}</p>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="text-sm text-gray-400 border-t pt-4">
                    <p>Created: {new Date(footer.createdAt).toLocaleString()}</p>
                    <p>Updated: {new Date(footer.updatedAt).toLocaleString()}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No footer data found</p>
                  <p className="text-gray-400 text-sm mt-2">Click "Create Footer" to add your footer content</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FooterSettings;