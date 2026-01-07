const classSuccess = '!text-green-500';
const classFailure = '!text-red-500';
const clearStatusDelayMs = 3500;

class ClipboardCopier extends HTMLElement {
  constructor() {
    super();

    const target = this.getAttribute('target');
    if (!target) {
      this.classList.add(classFailure);
      console.error('missing target attribute on ClipboardCopier element');
      return;
    }

    this._target = target;
    this.addEventListener('click', this.copyToClipboard.bind(this));
  }

  async copyToClipboard(e) {
    e.preventDefault();

    try {
      await navigator.clipboard.writeText(this.getTarget().textContent || '');
      this.statusSuccess();
    } catch (error) {
      console.error(`copying to clipboard: ${error}`);
      this.statusFailure();
    } finally {
      this.clearStatusAfterDelay();
    }
  }

  getTarget() {
    const els = document.querySelectorAll(this._target);
    if (els.length === 0) {
      throw new Error(`ClipboardCopier target element not found with selector ${this._target}`);
    }

    // The last matching element is returned to skip the element containing
    // line numbers, in case the target is a code block with line numbers.
    return els.item(els.length - 1);
  }

  statusSuccess() {
    this.clearStatus();
    this.classList.add(classSuccess);
  }

  statusFailure() {
    this.clearStatus();
    this.classList.add(classFailure);
  }

  clearStatus() {
    this.classList.remove(classSuccess, classFailure);
  }

  clearStatusAfterDelay() {
    setTimeout(() => {
      this.clearStatus();
    }, clearStatusDelayMs);
  }
}

if (!customElements.get('clipboard-copy')) {
  customElements.define('clipboard-copy', ClipboardCopier);
}
