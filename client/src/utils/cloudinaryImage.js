// Cloudinary can resize and re-encode images on the fly when transformation
// options are placed right after "/image/upload/" in the URL.
// f_auto  -> serve WebP/AVIF when the browser supports it
// q_auto  -> pick a quality level with no visible loss
// c_limit,w_N -> shrink to at most N px wide (never upscale)
// Any non-Cloudinary URL (and PDFs/SVGs/GIFs) is returned unchanged.
const UPLOAD_SEGMENT = "/image/upload/";

export const cldImg = (url, width = 1600) => {
  if (typeof url !== "string" || !url.includes("res.cloudinary.com") || !url.includes(UPLOAD_SEGMENT)) {
    return url;
  }
  if (/\.(pdf|svg|gif)(\?|$)/i.test(url)) return url;

  const index = url.indexOf(UPLOAD_SEGMENT) + UPLOAD_SEGMENT.length;
  let rest = url.slice(index);
  // A chosen crop (see withCloudinaryCrop) is kept, with the resizing applied after it
  // A previously sized copy (our own "f_auto,q_auto,c_limit,w_N/") -> back to the original
  rest = rest.replace(AUTO_SIZE_SEGMENT, "");
  let crop = "";
  const cropMatch = rest.match(CROP_SEGMENT);
  if (cropMatch) {
    crop = cropMatch[0];
    rest = rest.slice(crop.length);
  }
  // Already has other transformation options (e.g. "w_400,c_fill/...") -> leave as is
  if (/^[a-z]{1,3}_[^/]*\//.test(rest)) return url;

  return `${url.slice(0, index)}${crop}f_auto,q_auto,c_limit,w_${width}/${rest}`;
};

// The sizing cldImg adds, e.g. "f_auto,q_auto,c_limit,w_160/"
const AUTO_SIZE_SEGMENT = /^f_auto,q_auto,c_limit,w_\d+\//;

/** Remove sizing that cldImg added (e.g. a small thumbnail address saved by mistake) */
export const stripCloudinarySizing = (url) => {
  if (!isCloudinary(url)) return url;
  const index = url.indexOf(UPLOAD_SEGMENT) + UPLOAD_SEGMENT.length;
  return url.slice(0, index) + url.slice(index).replace(AUTO_SIZE_SEGMENT, "");
};

// Relative crop chosen by the author, e.g. "c_crop,x_0.1000,y_0.2000,w_0.8000,h_0.4500/"
const CROP_SEGMENT = /^c_crop,x_([\d.]+),y_([\d.]+),w_([\d.]+),h_([\d.]+)\//;
const isCloudinary = (url) => typeof url === "string" && url.includes("res.cloudinary.com") && url.includes(UPLOAD_SEGMENT);

/** True when the photo can be adjusted (cropped) through its address */
export const canCropImage = (url) => isCloudinary(url) && !/\.(pdf|svg|gif)(\?|$)/i.test(url);

/** The photo address without a chosen crop */
export const getCloudinaryOriginal = (url) => {
  if (!isCloudinary(url)) return url;
  const index = url.indexOf(UPLOAD_SEGMENT) + UPLOAD_SEGMENT.length;
  return url.slice(0, index) + url.slice(index).replace(CROP_SEGMENT, "");
};

/** The chosen crop as fractions { x, y, w, h }, or null */
export const getCloudinaryCrop = (url) => {
  if (!isCloudinary(url)) return null;
  const m = url.slice(url.indexOf(UPLOAD_SEGMENT) + UPLOAD_SEGMENT.length).match(CROP_SEGMENT);
  return m ? { x: +m[1], y: +m[2], w: +m[3], h: +m[4] } : null;
};

/** Photo address showing only the given part (fractions 0–1); the original file is untouched */
export const withCloudinaryCrop = (url, { x, y, w, h }) => {
  const original = getCloudinaryOriginal(url);
  const index = original.indexOf(UPLOAD_SEGMENT) + UPLOAD_SEGMENT.length;
  // always written with decimals so Cloudinary reads them as fractions, not pixels
  const f = (n) => Math.max(0, Math.min(1, n)).toFixed(4);
  return `${original.slice(0, index)}c_crop,x_${f(x)},y_${f(y)},w_${f(w)},h_${f(h)}/${original.slice(index)}`;
};

export default cldImg;
