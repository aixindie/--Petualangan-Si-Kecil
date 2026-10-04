// Hindari gambar popup sebelumnya terlihat sesaat saat aset popup baru dimuat.
window.setDialogArtwork = (image, source, description) => {
    const requestId = Number(image.dataset.artRequest || 0) + 1;
    image.dataset.artRequest = String(requestId);
    image.alt = description;
    image.style.visibility = "hidden";

    const revealCurrentArtwork = () => {
        if (Number(image.dataset.artRequest) !== requestId) return;
        image.style.visibility = "visible";
        image.onload = null;
        image.onerror = null;
    };

    image.onload = revealCurrentArtwork;
    image.onerror = revealCurrentArtwork;
    image.src = source;

    if (image.complete && image.naturalWidth > 0) revealCurrentArtwork();
};
