
// ===== PROJECT DETAILS MODAL =====

(() => {
  const projectSection = document.getElementById("projects");

  if (!projectSection) return;

  const projectModal = projectSection.querySelector("#projectModal");
  const projectModalDialog = projectSection.querySelector(
    ".project-modal-dialog"
  );
  const projectModalContent = projectSection.querySelector(
    "#projectModalContent"
  );
  const closeProjectModalButton = projectSection.querySelector(
    "#closeProjectModal"
  );

  if (
    !projectModal ||
    !projectModalDialog ||
    !projectModalContent ||
    !closeProjectModalButton
  ) {
    console.error("Project details modal elements were not found.");
    return;
  }

  // Move the fixed modal outside <main>,
  // whose overflow can clip fixed elements.
  document.body.appendChild(projectModal);

  let previouslyFocusedElement = null;
  let previousBodyOverflow = "";

  // Open modal and display the selected project's details.
  function openProjectModal(templateId, triggerButton) {
    const template = document.getElementById(templateId);

    if (!(template instanceof HTMLTemplateElement)) {
      console.error(`Project details template not found: ${templateId}`);
      return;
    }

    previouslyFocusedElement = triggerButton;
    previousBodyOverflow = document.body.style.overflow;

    projectModalContent.replaceChildren(
      template.content.cloneNode(true)
    );

    projectModal.classList.add("is-open");
    projectModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    closeProjectModalButton.focus();
  }

  // Close modal and restore the previous page state.
  function closeProjectDetails() {
    if (!projectModal.classList.contains("is-open")) return;

    projectModal.classList.remove("is-open");
    projectModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = previousBodyOverflow;

    if (previouslyFocusedElement?.isConnected) {
      previouslyFocusedElement.focus();
    }
  }

  // Event delegation allows newly added project cards
  // to work without editing this JavaScript.
  projectSection.addEventListener("click", event => {
    const triggerButton = event.target.closest(
      ".project-details-trigger"
    );

    if (
      !triggerButton ||
      !projectSection.contains(triggerButton)
    ) {
      return;
    }

    openProjectModal(
      triggerButton.dataset.details,
      triggerButton
    );
  });

  // Close button.
  closeProjectModalButton.addEventListener(
    "click",
    closeProjectDetails
  );

  // Close when clicking outside the modal dialog.
  projectModal.addEventListener("click", event => {
    if (event.target === projectModal) {
      closeProjectDetails();
    }
  });

  // Escape closes the modal.
  // Tab navigation stays inside the modal while it is open.
  projectModal.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeProjectDetails();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = [
      ...projectModalDialog.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ].filter(element => element.getClientRects().length > 0);

    if (focusableElements.length === 0) {
      event.preventDefault();
      projectModalDialog.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === firstElement
    ) {
      event.preventDefault();
      lastElement.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === lastElement
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  });
})();
