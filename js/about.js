
window.initializeAboutCV = function () {
  const modal = document.getElementById("cvModal");
  const openButton = document.getElementById("openCvButton");
  const closeButton = document.getElementById("closeCvButton");
  const pdfFrame = document.getElementById("cvPdfFrame");
  const downloadButton = document.getElementById("downloadCvButton");
  const openNewTabButton = document.getElementById("openCvNewTabButton");

  if (
    !modal ||
    !openButton ||
    !closeButton ||
    !pdfFrame ||
    !downloadButton ||
    !openNewTabButton
  ) {
    return;
  }

  // Path PDF relatif terhadap index.html di folder utama.
  const cvPath = "assets/cv-ihsan-panji.pdf";

  downloadButton.href = cvPath;
  openNewTabButton.href = cvPath;

  function openCV() {
    pdfFrame.src = cvPath;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    closeButton.focus();
  }

  function closeCV() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Hentikan viewer saat modal ditutup.
    pdfFrame.src = "about:blank";

    openButton.focus();
  }

  openButton.addEventListener("click", openCV);
  closeButton.addEventListener("click", closeCV);

  modal.querySelectorAll("[data-close-cv]").forEach((element) => {
    element.addEventListener("click", closeCV);
  });

  // Tutup modal dengan tombol Escape.
  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCV();
    }
  });
};
