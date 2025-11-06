// ---------- Hàm xóa toolbar và container ----------
function cleanPage() {
    const top = document.querySelector(".toolbar_top");
    if (top) top.remove();

    const bottom = document.querySelector(".toolbar_bottom");
    if (bottom) bottom.remove();

    const containers = document.querySelectorAll(".document_scroller");
    containers.forEach(c => c.className = '');

    console.log("🧹 Toolbar và container đã được xóa!");
}

// ---------- Lấy tổng số trang từ toolbar ----------
function getTotalPages() {
    const span = document.querySelector(".toolbarPager .pageCount[data-e2e='total-pages-embed']");
    if (!span) return 0;
    const total = parseInt(span.textContent.replace(/\D/g, ""), 10);
    return isNaN(total) ? 0 : total;
}

// ---------- Lấy trang hiện tại từ input ----------
function getCurrentPage() {
    const input = document.querySelector(".toolbarPager input[name='page-number-entry']");
    if (!input) return 0;
    return parseInt(input.value, 10) || 0;
}

// ---------- Tạo và cập nhật status indicator ----------
function createStatusIndicator() {
    const status = document.createElement("div");
    status.id = "scribdStatusIndicator";
    status.textContent = "Page: 0 / 0";
    document.body.appendChild(status);
}
function updateStatus() {
    const status = document.getElementById("scribdStatusIndicator");
    if (!status) return;

    const currentPage = getCurrentPage();
    const totalPages = getTotalPages();
    status.textContent = `Page: ${currentPage} / ${totalPages}`;
}

// ---------- Thẻ style chung ----------
function addGlobalStyles() {
    const style = document.createElement("style");
    style.id = "scribdExtensionStyles";
    style.textContent = `
        /* ===== Button chung ===== */
        #scribdPrintBtn, #scribdCleanBtn, #scribdAutoScrollBtn {
            position: fixed;
            right: 20px;
            z-index: 999999;
            padding: 12px 18px;
            color: white;
            font-size: 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 3px 8px rgba(0,0,0,0.25);
        }
        #scribdPrintBtn { top: 20px; background: #ff5722; }
        #scribdCleanBtn { top: 60px; background: #2196f3; }
        #scribdAutoScrollBtn { top: 100px; background: #4caf50; }

        /* ===== Status indicator ===== */
        #scribdStatusIndicator {
            position: fixed;
            top: 140px;
            right: 20px;
            z-index: 999999;
            background: rgba(0,0,0,0.7);
            color: #fff;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }

        /* ===== Ẩn khi in ===== */
        @media print {
            #scribdPrintBtn, #scribdCleanBtn, #scribdAutoScrollBtn, #scribdStatusIndicator {
                display: none !important;
            }
            @page { margin: 0; }
            body, html { margin:0; padding:0; overflow: visible !important; }
            .document_scroller {
                transform: scale(0.8);
                transform-origin: top left;
                display: block;
                page-break-after: always;
            }
            .toolbar_top, .toolbar_bottom { display: none !important; }
        }
    `;
    document.head.appendChild(style);
}

// ---------- Tạo nút với tooltip ----------
function createButton(id, text, tooltip, onClick) {
    const btn = document.createElement("button");
    btn.id = id;
    btn.textContent = text;
    btn.title = tooltip;
    btn.onclick = onClick;
    document.body.appendChild(btn);
    return btn;
}

// ---------- Nút Print PDF ----------
function createPrintButton() {
    createButton("scribdPrintBtn", "Print PDF", "In toàn bộ trang hiện tại", () => {
        const btn = document.getElementById("scribdPrintBtn");
        btn.style.display = "none";
        setTimeout(() => {
            window.print();
            setTimeout(() => { btn.style.display = "block"; }, 500);
        }, 300);
    });
}

// ---------- Nút Clean Page ----------
function createCleanPageButton() {
    createButton("scribdCleanBtn", "Clean Page", "Xóa toolbar và container", () => {
        cleanPage();
        updateStatus();
    });
}

// ---------- Nút Auto Scroll an toàn ----------
function createAutoScrollButton() {
    let scrollInterval = null;
    const scrollSpeed = 120;

    createButton("scribdAutoScrollBtn", "Auto Scroll", "Cuộn trang tự động, load tất cả pages", () => {
        const container = document.querySelector(".document_scroller") || document.body;

        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
            document.getElementById("scribdAutoScrollBtn").textContent = "Auto Scroll";
            console.log("⏸ Auto scroll stopped");
        } else {
            document.getElementById("scribdAutoScrollBtn").textContent = "Stop Scroll";
            scrollInterval = setInterval(() => {
                container.scrollBy(0, scrollSpeed);
                updateStatus();

                const currentPage = getCurrentPage();
                const totalPages = getTotalPages();

                if (totalPages > 0 && currentPage >= totalPages) {
                    clearInterval(scrollInterval);
                    scrollInterval = null;
                    document.getElementById("scribdAutoScrollBtn").textContent = "Auto Scroll";
                    console.log("✅ Reached last page, auto scroll stopped");
                }
            }, 200);
            console.log("▶ Auto scroll started");
        }
    });
}

// ---------- Khởi tạo extension ----------
window.addEventListener("load", () => {
    addGlobalStyles();
    createStatusIndicator();
    createPrintButton();
    createCleanPageButton();
    createAutoScrollButton();
    console.log("✅ Extension loaded, waiting for pages...");

    // Cập nhật trạng thái mỗi 500ms
    setInterval(updateStatus, 500);
});
