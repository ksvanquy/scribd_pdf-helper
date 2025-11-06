// ---------- Xóa toolbar và container ----------
function cleanPage() {
    const top = document.querySelector(".toolbar_top");
    if (top) top.remove();

    const bottom = document.querySelector(".toolbar_bottom");
    if (bottom) bottom.remove();

    const containers = document.querySelectorAll(".document_scroller");
    containers.forEach(c => c.className = '');

    console.log("🧹 Toolbar + container removed");
}

// ---------- Lấy tổng số trang ----------
function getTotalPages() {
    const span = document.querySelector(".toolbarPager .pageCount[data-e2e='total-pages-embed']");
    if (!span) return 0;
    const total = parseInt(span.textContent.replace(/\D/g, ""), 10);
    return isNaN(total) ? 0 : total;
}

// ---------- Lấy trang hiện tại ----------
function getCurrentPage() {
    const input = document.querySelector(".toolbarPager input[name='page-number-entry']");
    if (!input) return 0;
    return parseInt(input.value, 10) || 0;
}

// ---------- STATUS INDICATOR ----------
function createStatusIndicator() {
    const status = document.createElement("div");
    status.id = "scribdStatusIndicator";
    status.textContent = "Page: 0 / 0";
    document.body.appendChild(status);
}

function updateStatus() {
    const status = document.getElementById("scribdStatusIndicator");
    if (!status) return;
    status.textContent = `Page: ${getCurrentPage()} / ${getTotalPages()}`;
}

// ---------- CSS GỘP CHUNG ----------
function addGlobalStyles() {
    const style = document.createElement("style");
    style.textContent = `
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

        #scribdStatusIndicator {
            position: fixed;
            top: 140px;
            right: 20px;
            background: rgba(0,0,0,0.7);
            color: #fff;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 999999;
        }

        @media print {
            #scribdPrintBtn, #scribdCleanBtn, #scribdAutoScrollBtn, #scribdStatusIndicator {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// ---------- HÀM TẠO NÚT ----------
function createButton(id, text, tooltip, callback) {
    const btn = document.createElement("button");
    btn.id = id;
    btn.textContent = text;
    btn.title = tooltip;
    btn.onclick = callback;
    document.body.appendChild(btn);
}

// ---------- NÚT PRINT PDF ----------
function createPrintButton() {
    createButton("scribdPrintBtn", "Print PDF", "In toàn bộ trang", () => {
        const btn = document.getElementById("scribdPrintBtn");
        btn.style.display = "none";
        setTimeout(() => {
            window.print();
            setTimeout(() => btn.style.display = "block", 300);
        }, 300);
    });
}

// ---------- NÚT CLEAN PAGE ----------
function createCleanPageButton() {
    createButton("scribdCleanBtn", "Clean Page", "Xóa toolbar + container", () => {
        cleanPage();
        updateStatus();
    });
}

// ---------- AUTO SCROLL TỐI ƯU ----------
function createAutoScrollButton() {
    let scrollInterval = null;
    const scrollSpeed = 400; // px mỗi lần scroll
    const waitFinalLoad = 400; // chờ trang cuối load

    createButton("scribdAutoScrollBtn", "Auto Scroll", "Cuộn tự động đến trang cuối", () => {
        const btn = document.getElementById("scribdAutoScrollBtn");
        const container = document.querySelector(".document_scroller") || document.body;

        // ĐANG CHẠY → STOP
        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
            btn.textContent = "Auto Scroll";
            console.log("⏸ Auto scroll stopped manually");
            return;
        }

        // CHƯA CHẠY → BẮT ĐẦU
        btn.textContent = "Stop Scroll";
        console.log("▶ Auto scroll started");

        scrollInterval = setInterval(() => {

            // Cuộn 1 đoạn
            container.scrollBy(0, scrollSpeed);
            updateStatus();

            const currentPage = getCurrentPage();
            const totalPages = getTotalPages();

            // Kiểm tra dừng
            if (totalPages > 0 && currentPage >= totalPages) {
                console.log("⏳ Reached last page, waiting final load...");

                // Chờ để đảm bảo Canvas trang cuối load xong
                setTimeout(() => {
                    clearInterval(scrollInterval);
                    scrollInterval = null;
                    btn.textContent = "Auto Scroll";
                    console.log("✅ All pages fully loaded — Auto Scroll stopped");
                }, waitFinalLoad);
            }

        }, 200); // 200ms/tick → đủ thời gian Scribd lazy-load

    });
}

// ---------- KHỞI TẠO EXTENSION ----------
window.addEventListener("load", () => {
    addGlobalStyles();
    createStatusIndicator();
    createPrintButton();
    createCleanPageButton();
    createAutoScrollButton();

    console.log("✅ Scribd Extension Loaded!");

    // Cập nhật trạng thái mỗi 300ms
    setInterval(updateStatus, 300);
});
