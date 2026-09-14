// Certification photo uploader
// Lets a visitor (or the site owner, before publishing) attach an image
// to each certification card. Images are stored as data URLs in the
// browser's localStorage, keyed by certificate id, so they persist
// across page reloads on the same device/browser.

(function () {
  const STORAGE_PREFIX = "certImg:";

  function loadImage(certEl) {
    const id = certEl.dataset.certId;
    if (!id) return;
    const saved = localStorage.getItem(STORAGE_PREFIX + id);
    if (saved) {
      setImage(certEl, saved);
    }
  }

  function setImage(certEl, dataUrl) {
    const media = certEl.querySelector(".cert-media");
    let img = media.querySelector("img");
    if (!img) {
      img = document.createElement("img");
      img.alt = certEl.querySelector("h4")?.textContent
        ? "Certificate: " + certEl.querySelector("h4").textContent
        : "Certificate image";
      media.appendChild(img);
    }
    img.src = dataUrl;
    media.classList.add("has-image");
  }

  function clearImage(certEl) {
    const id = certEl.dataset.certId;
    const media = certEl.querySelector(".cert-media");
    const img = media.querySelector("img");
    if (img) img.remove();
    media.classList.remove("has-image");
    if (id) localStorage.removeItem(STORAGE_PREFIX + id);
  }

  function handleFile(certEl, file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      setImage(certEl, dataUrl);
      const id = certEl.dataset.certId;
      if (id) {
        try {
          localStorage.setItem(STORAGE_PREFIX + id, dataUrl);
        } catch (err) {
          // Storage full or unavailable — image still shows for this session.
          console.warn("Could not save certificate image to localStorage:", err);
        }
      }
    };
    reader.readAsDataURL(file);
  }

  function init() {
    const certs = document.querySelectorAll(".cert");
    certs.forEach((certEl) => {
      loadImage(certEl);

      const input = certEl.querySelector('input[type="file"]');
      if (input) {
        input.addEventListener("change", (e) => {
          const file = e.target.files && e.target.files[0];
          handleFile(certEl, file);
        });
      }

      const removeBtn = certEl.querySelector(".cert-remove");
      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          clearImage(certEl);
          if (input) input.value = "";
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
