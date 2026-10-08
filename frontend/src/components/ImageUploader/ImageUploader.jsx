import React, { useCallback, useRef, useState } from "react";
import { uploadsAPI } from "../../api/api";
import "./ImageUploader.css";

/**
 * ImageUploader
 *
 * Props:
 *   images       – array of { id, imageUrl, publicId, isPrimary } (controlled)
 *   onChange     – called with the updated images array after every change
 *   maxImages    – max number of images allowed (default 10)
 */
const ImageUploader = ({ images = [], onChange, maxImages = 10 }) => {
  const [dragging, setDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [errors, setErrors] = useState([]);
  const inputRef = useRef(null);

  // ── helpers ────────────────────────────────────────────────────────────────

  const addError = (msg) =>
    setErrors((prev) => [...prev, msg]);

  const clearErrors = () => setErrors([]);

  const hasPrimary = (list) => list.some((i) => i.isPrimary);

  /** Upload one File object → returns { imageUrl, publicId } or throws */
  const uploadFile = async (file) => {
    const res = await uploadsAPI.uploadImage(file);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Upload failed");
    }
    return { imageUrl: data.imageUrl, publicId: data.publicId };
  };

  /** Process an array of File objects chosen by the user */
  const processFiles = useCallback(
    async (files) => {
      clearErrors();
      const accepted = [];

      for (const file of files) {
        if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
          addError(`"${file.name}" is not a supported format (JPG, PNG, WebP only).`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          addError(`"${file.name}" exceeds the 10 MB size limit.`);
          continue;
        }
        accepted.push(file);
      }

      const slotsLeft = maxImages - images.length;
      if (accepted.length > slotsLeft) {
        addError(`You can only add ${slotsLeft} more image${slotsLeft !== 1 ? "s" : ""}.`);
        accepted.splice(slotsLeft);
      }

      if (accepted.length === 0) return;

      setUploadingCount(accepted.length);

      const uploaded = [];
      await Promise.all(
        accepted.map(async (file) => {
          // local preview while uploading
          const previewUrl = URL.createObjectURL(file);
          const tempId = `temp_${Date.now()}_${Math.random()}`;

          // optimistic insert
          onChange((prev) => {
            const needsPrimary = !hasPrimary(prev) && uploaded.length === 0 && prev.length === 0;
            return [
              ...prev,
              { id: tempId, imageUrl: previewUrl, publicId: null, isPrimary: needsPrimary, uploading: true },
            ];
          });

          try {
            const { imageUrl, publicId } = await uploadFile(file);
            uploaded.push({ imageUrl, publicId });

            onChange((prev) => {
              const idx = prev.findIndex((i) => i.id === tempId);
              if (idx === -1) return prev;
              const next = [...prev];
              next[idx] = {
                ...next[idx],
                imageUrl,
                publicId,
                uploading: false,
              };
              // revoke blob URL to free memory
              URL.revokeObjectURL(previewUrl);
              return next;
            });
          } catch (err) {
            addError(`Failed to upload "${file.name}": ${err.message}`);
            // remove the optimistic placeholder
            onChange((prev) => prev.filter((i) => i.id !== tempId));
            URL.revokeObjectURL(previewUrl);
          } finally {
            setUploadingCount((c) => Math.max(0, c - 1));
          }
        })
      );
    },
    [images.length, maxImages, onChange]
  );

  // ── event handlers ─────────────────────────────────────────────────────────

  const onFileInput = (e) => {
    if (e.target.files?.length) {
      processFiles(Array.from(e.target.files));
      e.target.value = ""; // reset so same file can be re-selected
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const setPrimary = (id) => {
    onChange((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === id })));
  };

  const removeImage = async (img) => {
    // Delete from Cloudinary (fire-and-forget — don't block the UI)
    if (img.publicId) {
      uploadsAPI.deleteImage(img.publicId).catch(() => {});
    }
    onChange((prev) => {
      const next = prev.filter((i) => i.id !== img.id);
      // if we removed the primary, promote the first remaining image
      if (img.isPrimary && next.length > 0 && !next.some((i) => i.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

  const slotsLeft = maxImages - images.length;
  const isAtLimit = slotsLeft <= 0;

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="iu-root">
      {/* Error list */}
      {errors.length > 0 && (
        <ul className="iu-errors" role="alert">
          {errors.map((e, i) => (
            <li key={i}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {e}
            </li>
          ))}
          <button className="iu-errors-close" onClick={clearErrors} aria-label="Dismiss errors">×</button>
        </ul>
      )}

      {/* Drop zone — hidden when limit reached */}
      {!isAtLimit && (
        <div
          className={`iu-dropzone ${dragging ? "iu-dropzone--active" : ""}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload car images"
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="iu-hidden-input"
            onChange={onFileInput}
          />
          <div className="iu-dropzone-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <p className="iu-dropzone-title">
            {uploadingCount > 0
              ? `Uploading ${uploadingCount} image${uploadingCount > 1 ? "s" : ""}…`
              : "Drag & drop photos here"}
          </p>
          <p className="iu-dropzone-sub">
            or <span className="iu-dropzone-link">browse files</span>
            &nbsp;· JPG, PNG, WebP · max 10 MB each · up to {maxImages} images
          </p>
          {slotsLeft < maxImages && (
            <p className="iu-dropzone-slots">
              {slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} remaining
            </p>
          )}
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="iu-grid">
          {images.map((img) => (
            <div
              key={img.id}
              className={`iu-card ${img.isPrimary ? "iu-card--primary" : ""} ${img.uploading ? "iu-card--uploading" : ""}`}
            >
              <img
                src={img.imageUrl}
                alt="Car"
                className="iu-card-img"
                draggable={false}
              />

              {/* uploading overlay */}
              {img.uploading && (
                <div className="iu-card-overlay">
                  <span className="iu-card-spinner" />
                </div>
              )}

              {/* primary badge */}
              {img.isPrimary && !img.uploading && (
                <span className="iu-card-primary-badge">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                  Primary
                </span>
              )}

              {/* actions — only when not uploading */}
              {!img.uploading && (
                <div className="iu-card-actions">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      className="iu-card-btn iu-card-btn--star"
                      onClick={() => setPrimary(img.id)}
                      title="Set as primary photo"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    className="iu-card-btn iu-card-btn--delete"
                    onClick={() => removeImage(img)}
                    title="Remove photo"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add-more tile when under limit */}
          {!isAtLimit && (
            <button
              type="button"
              className="iu-add-more"
              onClick={() => inputRef.current?.click()}
              title={`Add more photos (${slotsLeft} remaining)`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add more</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
