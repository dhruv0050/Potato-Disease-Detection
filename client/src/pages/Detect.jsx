import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Detect = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const onSelectFile = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      setData(null);
      return;
    }
    setSelectedFile(e.target.files[0]);
    setData(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setData(null);
    }
  };

  const sendFile = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        console.error("Error uploading file");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setData(null);
    setSelectedFile(null);
    setPreview(null);
  };

  const getStatusColor = (className) => {
    if (className?.toLowerCase().includes('healthy')) return 'green';
    if (className?.toLowerCase().includes('early')) return 'orange';
    if (className?.toLowerCase().includes('late')) return 'red';
    return 'gray';
  };

  const statusColor = data ? getStatusColor(data.class) : 'gray';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-green-500/50 text-white transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-[calc(100vh-100px)] flex flex-col items-center justify-center px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 animate-fadeIn">
          <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Disease Detection
          </span>
        </h1>
        <p className="text-gray-400 text-center mb-12 animate-fadeIn delay-100">
          Upload a potato leaf image for instant AI analysis
        </p>

        {/* Main card */}
        <div className="w-full max-w-2xl animate-fadeIn delay-200">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
            {!preview && !isLoading && !data && (
              <div
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-16 transition-all duration-300 ${
                  dragActive
                    ? 'border-green-500 bg-green-500/10 scale-105'
                    : 'border-white/20 hover:border-green-500/50 hover:bg-white/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={onSelectFile}
                  accept="image/*"
                />
                
                <div className="mb-6 p-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">Drop your image here</h3>
                <p className="text-gray-400 text-center mb-4">or click to browse</p>
                <p className="text-sm text-gray-500">Supports: JPG, PNG, JPEG</p>
              </div>
            )}

            {preview && !data && (
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <img
                    src={preview}
                    alt="Preview"
                    className="relative w-full h-80 object-cover rounded-2xl border border-white/20 shadow-2xl"
                  />
                </div>

                {!isLoading && (
                  <div className="flex gap-4">
                    <button
                      onClick={sendFile}
                      className="flex-1 group relative px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold text-white shadow-lg shadow-green-500/50 hover:shadow-green-500/70 hover:scale-105 transition-all duration-300"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Analyze Now
                      </span>
                    </button>
                    <button
                      onClick={clearData}
                      className="px-6 py-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-red-500/50 text-white hover:bg-red-500/10 transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {isLoading && (
              <div className="text-center py-16">
                <div className="relative inline-flex items-center justify-center mb-8">
                  <div className="w-20 h-20 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
                  <div className="absolute w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Analyzing Image...</h3>
                <p className="text-gray-400">Our AI is examining the leaf for diseases</p>
                
                {/* Progress indicators */}
                <div className="mt-8 space-y-3">
                  {['Processing image', 'Running CNN model', 'Calculating confidence'].map((step, idx) => (
                    <div key={idx} className="flex items-center justify-center gap-3 text-sm text-gray-500">
                      <div className={`w-2 h-2 rounded-full bg-green-400 animate-pulse`} style={{ animationDelay: `${idx * 0.2}s` }}></div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data && (
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
                  <img
                    src={preview}
                    alt="Analyzed"
                    className="relative w-full h-80 object-cover rounded-2xl border border-white/20 shadow-2xl"
                  />
                  
                  {/* Result overlay badge */}
                  <div className={`absolute top-4 right-4 px-4 py-2 rounded-full backdrop-blur-md border text-sm font-semibold
                    ${statusColor === 'green' ? 'bg-green-500/20 border-green-500/50 text-green-400' : ''}
                    ${statusColor === 'orange' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : ''}
                    ${statusColor === 'red' ? 'bg-red-500/20 border-red-500/50 text-red-400' : ''}
                  `}>
                    Analysis Complete
                  </div>
                </div>

                {/* Results card */}
                <div className={`p-6 rounded-2xl backdrop-blur-md border
                  ${statusColor === 'green' ? 'bg-green-500/10 border-green-500/30' : ''}
                  ${statusColor === 'orange' ? 'bg-orange-500/10 border-orange-500/30' : ''}
                  ${statusColor === 'red' ? 'bg-red-500/10 border-red-500/30' : ''}
                `}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-xl
                      ${statusColor === 'green' ? 'bg-green-500/20' : ''}
                      ${statusColor === 'orange' ? 'bg-orange-500/20' : ''}
                      ${statusColor === 'red' ? 'bg-red-500/20' : ''}
                    `}>
                      <svg className={`w-6 h-6
                        ${statusColor === 'green' ? 'text-green-400' : ''}
                        ${statusColor === 'orange' ? 'text-orange-400' : ''}
                        ${statusColor === 'red' ? 'text-red-400' : ''}
                      `} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Diagnosis Results</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-gray-400 font-medium">Classification:</span>
                      <span className={`text-xl font-bold
                        ${statusColor === 'green' ? 'text-green-400' : ''}
                        ${statusColor === 'orange' ? 'text-orange-400' : ''}
                        ${statusColor === 'red' ? 'text-red-400' : ''}
                      `}>
                        {data.class}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 font-medium">Confidence Score:</span>
                        <span className="text-xl font-bold text-white">
                          {(data.confidence * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out
                            ${statusColor === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''}
                            ${statusColor === 'orange' ? 'bg-gradient-to-r from-orange-500 to-amber-500' : ''}
                            ${statusColor === 'red' ? 'bg-gradient-to-r from-red-500 to-rose-500' : ''}
                          `}
                          style={{ width: `${data.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={clearData}
                  className="w-full group px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold text-white shadow-lg shadow-green-500/50 hover:shadow-green-500/70 hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Analyze Another Image
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Info cards below */}
          {!preview && (
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: 'Early Blight', color: 'orange' },
                { label: 'Late Blight', color: 'red' },
                { label: 'Healthy', color: 'green' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-center"
                >
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2
                    ${item.color === 'green' ? 'bg-green-400' : ''}
                    ${item.color === 'orange' ? 'bg-orange-400' : ''}
                    ${item.color === 'red' ? 'bg-red-400' : ''}
                  `}></div>
                  <p className="text-sm text-gray-400">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default Detect;
