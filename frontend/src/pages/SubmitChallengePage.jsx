import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import SimilarChallengesList from '../components/SimilarChallengesList';
import PriorityBadge from '../components/PriorityBadge';
import { 
  ArrowRight, ArrowLeft, Check, Sparkles, AlertTriangle, 
  MapPin, HelpCircle, FileText, Send, Camera, Upload, 
  X, RefreshCw, AlertCircle, Eye, CheckCircle2 
} from 'lucide-react';

const SubmitChallengePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [similarityLoading, setSimilarityLoading] = useState(false);
  const [similarityResults, setSimilarityResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Image Upload & Mobile Camera State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    city: '',
    location_description: '',
    description: '',
    affected_community: '',
    estimated_severity: 'MEDIUM',
    desired_outcome: '',
    additional_context: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories/');
        setCategories(res.data.results || res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, category: res.data[0].id }));
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Cleanup object URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Image Validation & Handler
  const handleFileSelection = (file) => {
    if (!file) return;

    // Validate type: JPG, PNG, WEBP, GIF
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please choose a valid photo file (JPG, PNG, or WebP).');
      return;
    }

    // Validate size: 5 MB limit
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage('Photo size is too large. Please select an image under 5 MB.');
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelection(file);
  };

  const handleRemovePhoto = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Step Navigations
  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.city.trim() || !formData.category) {
      setErrorMessage('Please enter the challenge title, category, and city.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleNextStep2 = async (e) => {
    e.preventDefault();
    if (!formData.description.trim() || formData.description.length < 25) {
      setErrorMessage('Please describe the problem in a bit more detail (at least 25 characters).');
      return;
    }
    setErrorMessage('');

    // Trigger Semantic Similarity Check
    setSimilarityLoading(true);
    setStep(3);
    try {
      const res = await api.post('/challenges/check-similarity/', {
        title: formData.title,
        description: formData.description
      });
      setSimilarityResults(res.data);
    } catch (err) {
      console.error('Similarity check error', err);
    } finally {
      setSimilarityLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      // Build FormData for multipart file upload
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('category', formData.category);
      payload.append('city', formData.city.trim());
      payload.append('location_description', formData.location_description.trim());
      payload.append('affected_community', formData.affected_community.trim());
      payload.append('estimated_severity', formData.estimated_severity);
      payload.append('desired_outcome', formData.desired_outcome.trim());
      payload.append('additional_context', formData.additional_context.trim());

      if (selectedFile) {
        payload.append('image', selectedFile);
      }

      const res = await api.post('/challenges/', payload);
      navigate(`/challenges/${res.data.id}`);
    } catch (err) {
      console.error('Submission error', err);
      setErrorMessage(err.response?.data?.error || 'Failed to submit challenge. Please try again.');
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-5 bg-warm-offwhite min-vh-100">
        <div className="container py-5 text-center">
          <div className="cs-card p-5 max-w-md mx-auto" style={{ maxWidth: '480px' }}>
            <div className="p-3 rounded-circle bg-soft-mint text-primary-green d-inline-flex mb-3">
              <Camera size={28} />
            </div>
            <h4 className="fw-bold text-forest mb-2">Sign In to Report a Problem</h4>
            <p className="text-muted-custom small mb-4">
              To keep community issues authentic and trackable, please log in with your free citizen account before submitting.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/login" className="btn-civic">Log In Now</Link>
              <Link to="/register" className="btn-civic-secondary">Create Free Account</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 bg-warm-offwhite min-vh-100">
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 1 ? <Check size={18} /> : 1}</div>
            <span className="step-label">Photo & Place</span>
          </div>
          <div className={`step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 2 ? <Check size={18} /> : 2}</div>
            <span className="step-label">Problem Details</span>
          </div>
          <div className={`step-item ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>
            <div className="step-circle">{step > 3 ? <Check size={18} /> : 3}</div>
            <span className="step-label">Duplicate Check</span>
          </div>
          <div className={`step-item ${step === 4 ? 'active' : ''}`}>
            <div className="step-circle">4</div>
            <span className="step-label">Review & Submit</span>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-3 px-3.5 small mb-4 shadow-xs" role="alert">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Prominent Photo & Core Place Details */}
        {step === 1 && (
          <div className="cs-card p-4 p-md-5">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-soft-mint text-forest fw-semibold">Step 1 of 4</span>
            </div>
            <h3 className="display-font fw-bold text-forest mb-1 fs-4">Photo Evidence & Location</h3>
            <p className="text-muted-custom small mb-4">
              Add a photo of the ground issue and tell us where this problem is occurring.
            </p>

            <form onSubmit={handleNextStep1}>
              {/* Photo Upload & Mobile Camera Section */}
              <div className="mb-4">
                <label className="form-label-civic mb-2">
                  <Camera size={16} className="text-primary-green" />
                  <span>Ground Photo Evidence (Recommended)</span>
                </label>

                {previewUrl ? (
                  <div className="photo-preview-card p-2 text-center position-relative">
                    <img 
                      src={previewUrl} 
                      alt="Ground evidence preview" 
                      className="rounded"
                    />
                    <div className="position-absolute top-0 end-0 p-3">
                      <button 
                        type="button" 
                        onClick={handleRemovePhoto} 
                        className="btn btn-danger btn-sm rounded-circle p-2 shadow"
                        title="Remove or replace photo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="p-2 text-start bg-white d-flex justify-content-between align-items-center rounded-bottom">
                      <div className="small text-truncate" style={{ maxWidth: '280px' }}>
                        <strong className="text-forest">{selectedFile?.name}</strong>
                        <span className="text-muted ms-2">({(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                      >
                        <RefreshCw size={12} />
                        <span>Replace Photo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="photo-dropzone">
                    <div className="p-3 rounded-circle bg-white shadow-xs d-inline-flex mb-3">
                      <Camera size={32} className="text-primary-green" />
                    </div>
                    <h6 className="fw-bold text-forest mb-1">Add a Ground Photo of the Problem</h6>
                    <p className="small text-muted-custom mb-3" style={{ maxWidth: '420px', margin: '0 auto' }}>
                      Clear photos help engineers and researchers verify ground conditions much faster.
                    </p>

                    <div className="d-flex flex-wrap justify-content-center gap-2">
                      {/* Standard File Upload */}
                      <button 
                        type="button" 
                        className="btn-civic btn-sm px-3"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={15} />
                        <span>Select from Device</span>
                      </button>

                      {/* Native Mobile Camera Trigger */}
                      <button 
                        type="button" 
                        className="btn-civic-secondary btn-sm px-3"
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        <Camera size={15} className="text-primary-green" />
                        <span>Take with Camera</span>
                      </button>
                    </div>

                    <div className="form-helper-text mt-3">
                      Accepted formats: JPG, PNG, WebP (up to 5 MB)
                    </div>
                  </div>
                )}

                {/* Hidden File Inputs */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="d-none"
                  onChange={handleFileInputChange}
                />
                <input 
                  type="file" 
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  className="d-none"
                  onChange={handleFileInputChange}
                />
              </div>

              {/* Title Input */}
              <div className="mb-3">
                <label className="form-label-civic">
                  <span>What is the core issue? *</span>
                </label>
                <input 
                  type="text" 
                  name="title"
                  className="form-control form-control-civic" 
                  required
                  placeholder="e.g. Severe Groundwater Depletion and Contaminated Borewells in Ward 14"
                  value={formData.title}
                  onChange={handleChange}
                />
                <div className="form-helper-text">Give a clear headline summarizing the main community problem.</div>
              </div>

              {/* Category & City */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label-civic">Topic / Category *</label>
                  <select 
                    name="category"
                    className="form-select form-select-civic" 
                    required
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label-civic">City or Town *</label>
                  <input 
                    type="text" 
                    name="city"
                    className="form-control form-control-civic" 
                    required
                    placeholder="e.g. Bengaluru, Chennai, Pune, Mumbai..."
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Location Description */}
              <div className="mb-4">
                <label className="form-label-civic">Specific Landmark or Neighbourhood (Optional)</label>
                <input 
                  type="text" 
                  name="location_description"
                  className="form-control form-control-civic" 
                  placeholder="e.g. Outside Government Primary School on Market Main Road"
                  value={formData.location_description}
                  onChange={handleChange}
                />
              </div>

              <div className="d-flex justify-content-end pt-3 border-top">
                <button type="submit" className="btn-civic btn-civic-lg">
                  <span>Continue to Problem Details</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: Plain Language Problem Details */}
        {step === 2 && (
          <div className="cs-card p-4 p-md-5">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-soft-mint text-forest fw-semibold">Step 2 of 4</span>
            </div>
            <h3 className="display-font fw-bold text-forest mb-1 fs-4">Explain the Situation</h3>
            <p className="text-muted-custom small mb-4">
              Use simple words to explain how this issue impacts people and what outcome you want to see.
            </p>

            <form onSubmit={handleNextStep2}>
              <div className="mb-3">
                <label className="form-label-civic">Detailed Problem Description *</label>
                <textarea 
                  name="description"
                  className="form-control form-control-civic" 
                  rows="5"
                  required
                  placeholder="What is happening? When did it start? How does it affect daily living, transport, or safety? The more specific you are, the easier it is for universities to design a solution."
                  value={formData.description}
                  onChange={handleChange}
                />
                <div className="form-helper-text">Minimum 25 characters. Plain language is preferred.</div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label-civic">How urgent is this problem?</label>
                  <select 
                    name="estimated_severity"
                    className="form-select form-select-civic" 
                    value={formData.estimated_severity}
                    onChange={handleChange}
                  >
                    <option value="LOW">Low (Minor inconvenience / seasonal)</option>
                    <option value="MEDIUM">Medium (Persistent everyday trouble)</option>
                    <option value="HIGH">High (Serious disruption or property cost)</option>
                    <option value="CRITICAL">Critical (Immediate safety, health, or drinking hazard)</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label-civic">Who is affected?</label>
                  <input 
                    type="text" 
                    name="affected_community"
                    className="form-control form-control-civic" 
                    placeholder="e.g. ~1,200 residents, elderly commuters, local school children"
                    value={formData.affected_community}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label-civic">What would a successful solution look like? (Optional)</label>
                <textarea 
                  name="desired_outcome"
                  className="form-control form-control-civic" 
                  rows="2"
                  placeholder="e.g. Installing percolation shafts for aquifer recharge and setting up regular community water tests."
                  value={formData.desired_outcome}
                  onChange={handleChange}
                />
              </div>

              <div className="d-flex justify-content-between pt-3 border-top">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} className="me-1" />
                  <span>Back</span>
                </button>
                <button type="submit" className="btn-civic btn-civic-lg">
                  <span>Run Semantic Similarity Check</span>
                  <Sparkles size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: Semantic Duplicate Detection Review */}
        {step === 3 && (
          <div className="cs-card p-4 p-md-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="ai-badge">
                <Sparkles size={13} />
                <span>AI Similarity Check</span>
              </span>
            </div>
            <h3 className="display-font fw-bold text-forest mb-1 fs-4">Step 3: Checking for Existing Reports</h3>
            <p className="text-muted-custom small mb-4">
              CivicSync uses dense vector similarity to compare your report against existing issues in your city. If someone already reported this, you can collaborate on the same issue.
            </p>

            {similarityLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary-green mb-3" role="status" />
                <p className="small text-muted-custom fw-semibold">
                  Comparing report embeddings with semantic model...
                </p>
              </div>
            ) : similarityResults && similarityResults.matches?.length > 0 ? (
              <div className="mb-4">
                <SimilarChallengesList 
                  matches={similarityResults.matches} 
                  engine={similarityResults.engine}
                />
                <div className="p-3 rounded mt-3 bg-light border small text-muted-custom d-flex align-items-start gap-2">
                  <span className="text-warning fs-5">💡</span>
                  <span>
                    <strong>Good news:</strong> If your location or circumstances are distinct, you can still proceed. Your submission will never be blocked.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded bg-soft-mint border text-center mb-4">
                <CheckCircle2 size={32} className="text-primary-green mb-2" />
                <h6 className="fw-bold text-forest mb-1">No Existing Duplicates Found</h6>
                <p className="small text-muted-custom mb-0">
                  Your report represents a unique challenge in this category and region.
                </p>
              </div>
            )}

            <div className="d-flex justify-content-between pt-3 border-top">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(2)}>
                <ArrowLeft size={16} className="me-1" />
                <span>Back to Edit</span>
              </button>
              <button type="button" className="btn-civic btn-civic-lg" onClick={() => setStep(4)}>
                <span>Proceed to Final Preview</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Preview & Final Submission */}
        {step === 4 && (
          <div className="cs-card p-4 p-md-5">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-soft-mint text-forest fw-semibold">Step 4 of 4</span>
            </div>
            <h3 className="display-font fw-bold text-forest mb-1 fs-4">Review & Confirm Submission</h3>
            <p className="text-muted-custom small mb-4">
              Double-check your report details before submitting to the CivicSync moderation and AI structuring pipeline.
            </p>

            <div className="p-4 rounded border bg-light mb-4">
              {/* Photo Preview if attached */}
              {previewUrl && (
                <div className="mb-3 rounded overflow-hidden" style={{ maxHeight: '240px', backgroundColor: '#0F2D25' }}>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-100 h-100 object-fit-cover"
                    style={{ maxHeight: '240px' }}
                  />
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="badge bg-white border text-forest small fw-semibold">
                  New Challenge Draft
                </span>
                <PriorityBadge severity={formData.estimated_severity} />
              </div>

              <h4 className="fw-bold text-forest mb-2">{formData.title}</h4>
              <div className="d-flex gap-3 text-muted-custom small mb-3">
                <span>📍 {formData.city} {formData.location_description ? `• ${formData.location_description}` : ''}</span>
              </div>

              <div className="mb-3">
                <span className="small fw-bold text-muted-custom text-uppercase">Problem Statement</span>
                <p className="small text-dark mb-0 mt-1" style={{ whiteSpace: 'pre-line' }}>{formData.description}</p>
              </div>

              {formData.affected_community && (
                <div className="mb-2">
                  <span className="small fw-bold text-muted-custom text-uppercase">Affected Community</span>
                  <p className="small text-dark mb-0">{formData.affected_community}</p>
                </div>
              )}

              {formData.desired_outcome && (
                <div>
                  <span className="small fw-bold text-muted-custom text-uppercase">Desired Outcome</span>
                  <p className="small text-dark mb-0">{formData.desired_outcome}</p>
                </div>
              )}
            </div>

            <div className="ai-notice-box mb-4 d-flex align-items-start gap-2">
              <Sparkles size={18} className="text-primary-green flex-shrink-0 mt-0.5" />
              <span className="small">
                Once published, CivicSync's AI engine will automatically extract research themes, suggest stakeholders, and begin matching with registered university labs.
              </span>
            </div>

            <div className="d-flex justify-content-between pt-3 border-top">
              <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(3)}>
                <ArrowLeft size={16} className="me-1" />
                <span>Back</span>
              </button>
              <button 
                type="button" 
                className="btn-civic btn-civic-lg px-4" 
                disabled={submitting}
                onClick={handleFinalSubmit}
              >
                <Send size={18} />
                <span>{submitting ? 'Publishing Report...' : 'Confirm & Publish Report'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitChallengePage;
