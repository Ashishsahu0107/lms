import React, { useState } from 'react';
import apiService from '../../services/api';

const UploadContent = () => {
  const [uploadType, setUploadType] = useState('video');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file || !selectedCourse || !title) {
      setError('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('course', selectedCourse);
      formData.append('type', uploadType);

      // This would need to be implemented in the backend
      const response = await apiService.upload.uploadFile(file, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });

      setSuccess('File uploaded successfully!');
      setFile(null);
      setTitle('');
      setDescription('');
      setSelectedCourse('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'pdf':
        return 'bg-blue-100 text-blue-800';
      case 'image':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Upload Content
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload videos, PDFs, images, and other course materials.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleUpload} className="space-y-6">
          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Type
            </label>
            <div className="flex space-x-4">
              {['video', 'pdf', 'image', 'other'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUploadType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    uploadType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course *
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a course</option>
              <option value="course1">JavaScript Fundamentals</option>
              <option value="course2">React Basics</option>
              <option value="course3">Node.js</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File *
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {uploadType.toUpperCase()} files only
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept={uploadType === 'video' ? 'video/*' : uploadType === 'pdf' ? 'application/pdf' : uploadType === 'image' ? 'image/*' : '*/*'}
                  required
                />
              </label>
              {file && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getFileTypeColor(uploadType)}`}>
                        {uploadType.toUpperCase()}
                      </div>
                      <span className="ml-3 text-sm text-gray-900 dark:text-white">
                        {file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter content title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the content (optional)"
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !file}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadContent;
