import React, { useState, useEffect } from 'react';
import emailService from '../../services/emailService';
import {
  FiMail,
  FiServer,
  FiSend,
  FiSave,
  FiCheck,
  FiAlertCircle,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiInbox,
  FiLock,
  FiUser,
  FiGlobe
} from 'react-icons/fi';

export default function EmailSettings() {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'messages'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  // Settings form
  const [formData, setFormData] = useState({
    recipientEmail: 'hello@bluechalk.com',
    smtpHost: 'smtp.titan.email',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: 'nouman@devverx.us',
    smtpPass: '?}>x3GuEb3c_bt\\',
    fromEmail: 'nouman@devverx.us',
    fromName: 'Blue-Chalk',
    isEnabled: true
  });

  // Messages list
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageFilter, setMessageFilter] = useState('all');

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 5000);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await emailService.getSettings();
      if (res?.data) {
        setFormData(prev => ({
          ...prev,
          ...res.data
        }));
        if (!testEmailAddress) {
          setTestEmailAddress(res.data.recipientEmail || 'hello@bluechalk.com');
        }
      }
    } catch (err) {
      console.error('Failed to load email settings:', err);
      showToast('error', 'Failed to load email settings from server');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const type = messageFilter === 'all' ? '' : messageFilter;
      const res = await emailService.getMessages(type);
      setMessages(res?.data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'messages') {
      loadMessages();
    }
  }, [activeTab, messageFilter]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recipientEmail.trim()) {
      showToast('error', 'Recipient email is required');
      return;
    }

    setSaving(true);
    try {
      const res = await emailService.updateSettings(formData);
      showToast('success', res.message || 'Email & SMTP settings saved successfully!');
    } catch (err) {
      console.error('Save error:', err);
      showToast('error', err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailAddress.trim()) {
      showToast('error', 'Please enter a test recipient email address');
      return;
    }

    setTesting(true);
    try {
      const res = await emailService.sendTestEmail(testEmailAddress);
      showToast('success', res.message || `Test email sent to ${testEmailAddress}!`);
    } catch (err) {
      console.error('Test email error:', err);
      showToast('error', err.response?.data?.message || 'SMTP Test failed! Check credentials.');
    } finally {
      setTesting(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await emailService.deleteMessage(id);
      setMessages(prev => prev.filter(m => m._id !== id));
      if (selectedMessage?._id === id) setSelectedMessage(null);
      showToast('success', 'Message deleted');
    } catch (err) {
      showToast('error', 'Failed to delete message');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FiMail className="text-blue-600" /> Email & SMTP Settings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure recipient email, Titan SMTP credentials, and manage incoming inquiries.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiServer className="inline mr-1.5" /> Settings
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'messages'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiInbox className="inline mr-1.5" /> Received Messages
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toast.message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {toast.type === 'success' ? (
              <FiCheck className="text-emerald-600 text-lg flex-shrink-0" />
            ) : (
              <FiAlertCircle className="text-red-600 text-lg flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-sm text-gray-500">Loading settings...</p>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 cols: Main Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
              {/* Card 1: Primary Recipient */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FiGlobe className="text-blue-600" /> Website Contact Email (Recipient)
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  All messages sent from the Contact Us form, email links, and newsletter subscriptions will be delivered to this address. It also updates the displayed email across the public site (footer, contact page, etc.).
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Recipient Email *
                  </label>
                  <input
                    type="email"
                    name="recipientEmail"
                    required
                    value={formData.recipientEmail}
                    onChange={handleChange}
                    placeholder="hello@bluechalk.com"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Currently set: <strong>{formData.recipientEmail || 'hello@bluechalk.com'}</strong>
                  </p>
                </div>
              </div>

              {/* Card 2: Titan SMTP Credentials */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FiLock className="text-blue-600" /> SMTP Configuration (Titan Email)
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Credentials used by the backend server to dispatch outgoing emails via SSL.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="isEnabled"
                      checked={formData.isEnabled}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-gray-700">Enabled</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SMTP Host */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">SMTP Host</label>
                    <input
                      type="text"
                      name="smtpHost"
                      value={formData.smtpHost}
                      onChange={handleChange}
                      placeholder="smtp.titan.email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  {/* SMTP Port */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">SMTP Port</label>
                    <input
                      type="number"
                      name="smtpPort"
                      value={formData.smtpPort}
                      onChange={handleChange}
                      placeholder="465"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">SMTP Username</label>
                    <input
                      type="text"
                      name="smtpUser"
                      value={formData.smtpUser}
                      onChange={handleChange}
                      placeholder="nouman@devverx.us"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">SMTP Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="smtpPass"
                        value={formData.smtpPass}
                        onChange={handleChange}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* From Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">From Email</label>
                    <input
                      type="email"
                      name="fromEmail"
                      value={formData.fromEmail}
                      onChange={handleChange}
                      placeholder="nouman@devverx.us"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  {/* From Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">From Name</label>
                    <input
                      type="text"
                      name="fromName"
                      value={formData.fromName}
                      onChange={handleChange}
                      placeholder="Blue-Chalk"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Encryption: <strong>SSL (Port 465)</strong>
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                    <input
                      type="checkbox"
                      name="smtpSecure"
                      checked={formData.smtpSecure}
                      onChange={handleChange}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    Use SSL Secure Connection
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition shadow flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving Settings...
                    </>
                  ) : (
                    <>
                      <FiSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Right 1 col: Test Email & Info Card */}
            <div className="space-y-6">
              {/* Test Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FiSend className="text-blue-600" /> Send Test Email
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Verify your Titan SMTP connection by sending a real test message.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Send Test To:
                    </label>
                    <input
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="e.g. test@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={testing}
                    className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {testing ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                        Connecting to Titan SMTP...
                      </>
                    ) : (
                      <>
                        <FiSend size={14} /> Send Test Email
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-xs text-blue-900 space-y-2">
                <div className="font-semibold text-sm text-blue-950 flex items-center gap-1.5">
                  <FiCheck className="text-blue-600" /> Active Configuration
                </div>
                <p>
                  Incoming inquiries from the public website contact form and newsletter requests are logged to the database and sent via <strong>smtp.titan.email</strong> to:
                </p>
                <p className="font-mono bg-white px-2.5 py-1.5 rounded border border-blue-200 text-blue-800 break-all font-semibold">
                  {formData.recipientEmail || 'hello@bluechalk.com'}
                </p>
                <p className="text-[11px] text-blue-700 pt-1">
                  When you update the recipient email here, footer and contact links on the live site reflect this change.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Received Messages Table */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 text-sm">Filter:</span>
                <select
                  value={messageFilter}
                  onChange={(e) => setMessageFilter(e.target.value)}
                  className="border border-gray-300 rounded-md text-xs px-2.5 py-1.5 bg-gray-50"
                >
                  <option value="all">All Messages ({messages.length})</option>
                  <option value="contact">Contact Inquiries</option>
                  <option value="newsletter">Newsletter Subscribers</option>
                </select>
              </div>
              <button
                type="button"
                onClick={loadMessages}
                className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <FiRefreshCw size={12} /> Refresh
              </button>
            </div>

            {messages.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-sm">
                <FiInbox className="mx-auto text-4xl text-gray-300 mb-2" />
                No messages or newsletter subscriptions received yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Sender</th>
                      <th className="py-3 px-4">Subject / Details</th>
                      <th className="py-3 px-4">Delivery</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {messages.map((m) => (
                      <tr key={m._id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              m.type === 'newsletter'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {m.type === 'newsletter' ? 'Newsletter' : 'Contact'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{m.name}</div>
                          <div className="text-gray-500 font-mono text-[11px]">{m.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-600">
                            {m.title || m.company ? `${m.title || ''} ${m.company ? '@ ' + m.company : ''}` : 'Subscriber'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {m.emailSent ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 w-fit">
                              <FiCheck size={10} /> Sent
                            </span>
                          ) : m.emailError ? (
                            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 w-fit" title={m.emailError}>
                              <FiAlertCircle size={10} /> Failed
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">
                              Logged
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedMessage(m)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(m._id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <FiTrash2 size={13} className="inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Message Details Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedMessage.type === 'newsletter' ? '📰 Newsletter Subscription' : '✉️ Contact Inquiry'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Received on {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Name:</strong> {selectedMessage.name}</p>
                <p><strong>Email:</strong> <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">{selectedMessage.email}</a></p>
                {selectedMessage.phone && <p><strong>Phone:</strong> {selectedMessage.phone}</p>}
                {selectedMessage.title && <p><strong>Title:</strong> {selectedMessage.title}</p>}
                {selectedMessage.company && <p><strong>Company:</strong> {selectedMessage.company}</p>}
                {selectedMessage.subject && <p><strong>Subject:</strong> {selectedMessage.subject}</p>}

                {selectedMessage.message && (
                  <div className="mt-3 pt-3 border-t">
                    <strong className="block mb-1 text-gray-900">Message:</strong>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.message}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Blue Chalk Inquiry')}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded shadow flex items-center gap-1.5"
                >
                  <FiSend size={12} /> Reply to {selectedMessage.name}
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
