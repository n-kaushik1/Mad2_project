// This is a styling function for tables->make them scrollable

export function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .table-wrapper {
            max-height: 200px;
            overflow-y: auto;
        }
        .table {
            width: 100%;
        }
        .table th, .table td {
            white-space: nowrap;
        }
        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1040;
        }
    `;
    document.head.appendChild(style);
}
