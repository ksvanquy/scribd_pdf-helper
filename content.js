// ---------- Hàm xóa toolbar và container ----------
function cleanPage() {
    const top = document.querySelector(".toolbar_top");
    if (top) top.remove();

    const bottom = document.querySelector(".toolbar_bottom");
    if (bottom) bottom.remove();

    // Nếu muốn xóa class document_scroller luôn
    const containers = document.querySelectorAll(".document_scroller");
    containers.forEach(c => c.className = '');

    console.log("🧹 Toolbar và container đã được xóa!");
}

function waitForAllPagesAndClearSafe(callback) {
    const observer = new MutationObserver((mutations, obs) => {
        const pages = document.querySelectorAll("[class*='page']");
        let allLoaded = true;

        pages.forEach(page => {
            const canvas = page.querySelector("canvas");
            if (canvas && canvas.width === 0) allLoaded = false;

            const img = page.querySelector("img");
            if (img && !img.complete) allLoaded = false;
        });

        if (allLoaded && pages.length > 0) {
            obs.disconnect(); // ngừng quan sát
            console.log("✅ All pages loaded (safe)!");
            if (callback) callback(); // gọi callback nếu có
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function addPrintStyles() {
    const style = document.createElement("style");
    style.textContent = `
        @media print {
            @page {
                margin: 0;
            }
            body, html {
                margin: 0;
                padding: 0;
                overflow: visible !important;
            }
            .document_scroller {
                transform: scale(0.8);
                transform-origin: top left;
                display: block;
                page-break-after: always;
            }
            .toolbar_top, .toolbar_bottom {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

function createPrintButton() {
    const btn = document.createElement("button");
    btn.textContent = "Print PDF";
    btn.id = "scribdPrintBtn";

    Object.assign(btn.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: "999999",
        padding: "12px 18px",
        background: "#ff5722",
        color: "white",
        fontSize: "16px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
    });

    btn.onclick = () => {
        console.log("🖨 Thêm CSS in...");

        addPrintStyles(); // gọi style in

        // Ẩn nút trước khi mở hộp thoại in
        btn.style.display = "none";

        setTimeout(() => {
            console.log("🖨 Mở hộp thoại in...");
            window.print();

            // Sau khi in xong → hiện lại nút
            setTimeout(() => {
                btn.style.display = "block";
            }, 500);

        }, 300);
    };

    document.body.appendChild(btn);

    // ✅ Ẩn nút khi chế độ print preview
    const hidePrintBtnCSS = document.createElement("style");
    hidePrintBtnCSS.textContent = `
        @media print {
            #scribdPrintBtn {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(hidePrintBtnCSS);
}

function createCleanPageButton() {
    const btn = document.createElement("button");
    btn.textContent = "Clean Page";
    btn.id = "scribdCleanBtn";

    Object.assign(btn.style, {
        position: "fixed",
        top: "60px", // khác với nút Print PDF (20px)
        right: "20px",
        zIndex: "999999",
        padding: "12px 18px",
        background: "#2196f3", // màu khác để phân biệt
        color: "white",
        fontSize: "16px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
    });

    btn.onclick = () => {
        console.log("🧹 Manual clean triggered");
        cleanPage();
        waitForAllPagesAndClear();
    };

    document.body.appendChild(btn);

    // Ẩn nút khi in
    const hideCleanBtnCSS = document.createElement("style");
    hideCleanBtnCSS.textContent = `
        @media print {
            #scribdCleanBtn {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(hideCleanBtnCSS);
}
function createAutoScrollButton() {
    let scrollInterval = null;
    let scrollSpeed = 120; // px mỗi bước
    const btn = document.createElement("button");
    btn.textContent = "Auto Scroll";
    btn.id = "scribdAutoScrollBtn";

    Object.assign(btn.style, {
        position: "fixed",
        top: "100px",
        right: "20px",
        zIndex: "999999",
        padding: "12px 18px",
        background: "#4caf50",
        color: "white",
        fontSize: "16px",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        boxShadow: "0 3px 8px rgba(0,0,0,0.25)",
    });

    btn.onclick = () => {
        const container = document.querySelector(".document_scroller") || document.body;

        if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
            btn.textContent = "Auto Scroll";
            console.log("⏸ Auto scroll stopped");
        } else {
            btn.textContent = "Stop Scroll";
            scrollInterval = setInterval(() => {
                container.scrollBy(0, scrollSpeed);

                // stop khi gần cuối container
                if ((container.scrollTop + container.clientHeight) >= container.scrollHeight) {
                    clearInterval(scrollInterval);
                    scrollInterval = null;
                    btn.textContent = "Auto Scroll";
                    console.log("✅ Reached bottom, auto scroll stopped");
                }
            }, 200); // 200ms để lazy-load page kịp
            console.log("▶ Auto scroll started");
        }
    };

    document.body.appendChild(btn);

    // Ẩn khi in
    const hideCSS = document.createElement("style");
    hideCSS.textContent = `
        @media print {
            #scribdAutoScrollBtn { display: none !important; }
        }
    `;
    document.head.appendChild(hideCSS);
}
window.addEventListener("load", () => {
    createPrintButton();
    createAutoScrollButton();
    createCleanPageButton();
    waitForAllPagesAndClear();
    console.log("✅ Page cleaned, print styles added, waiting for pages to load...");
});