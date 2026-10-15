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
  const rest = url.slice(index);
  // Already has transformation options (e.g. "w_400,c_fill/...") -> leave as is
  if (/^[a-z]{1,3}_[^/]*\//.test(rest)) return url;

  return `${url.slice(0, index)}f_auto,q_auto,c_limit,w_${width}/${rest}`;
};

export default cldImg;
