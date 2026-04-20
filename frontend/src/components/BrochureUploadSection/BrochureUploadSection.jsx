import { useState } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BrochureUploadSection({ 
  brochure = null, 
  onBrochureChange, 
  builder = '',
  onBuilderChange,
  disabled = false 
}) {
  const [previewFile, setPreviewFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleBuilderChange = (e) => {
    onBuilderChange(e.target.value);
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type (PDF, DOC, DOCX)
    const validTypes = ['application/pdf', 'application/msword', 
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setPreviewFile(file);
    onBrochureChange({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const removeBrochure = () => {
    setPreviewFile(null);
    onBrochureChange(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
      {/* Builder Information */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Builder / Developer Name
        </label>
        <input
          type="text"
          value={builder}
          onChange={handleBuilderChange}
          placeholder="Enter builder or developer name"
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1.5">
          Name of the builder, developer, or organization responsible for this property
        </p>
      </div>

      {/* Brochure Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Project Brochure / Documentation
        </label>

        {!previewFile && !brochure?.url ? (
          <>
            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleInputChange}
                disabled={disabled}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-brand-100 rounded-full">
                  <Upload className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Drop brochure here</p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                PDF or Word document • Max 10MB
              </p>
            </div>

            {/* Info Alert */}
            <div className="mt-3 flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-medium">Storage Note:</p>
                <p>Brochure upload is ready but will work once Firebase Storage is enabled.</p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* File Preview */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 rounded-lg">
                  <File className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {previewFile?.name || brochure?.name || 'Brochure'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {previewFile ? formatFileSize(previewFile.size) : formatFileSize(brochure?.size || 0)} • Ready to upload
                  </p>
                </div>
                {brochure?.url && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
              </div>
              <button
                onClick={removeBrochure}
                disabled={disabled}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Status */}
            <div className="mt-3 flex gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-green-700">
                <p className="font-medium">Ready for Upload</p>
                <p>Your brochure will be uploaded when storage is enabled and you save the property.</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Supported Formats Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <p className="text-xs font-medium text-gray-900 mb-2">📄 Supported Formats:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <span className="font-medium">PDF</span> - Portable Document Format (recommended)</li>
          <li>• <span className="font-medium">DOC</span> - Microsoft Word 97-2003</li>
          <li>• <span className="font-medium">DOCX</span> - Microsoft Word 2007+</li>
        </ul>
      </div>
    </div>
  );
}
